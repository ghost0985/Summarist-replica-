import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { Resend } from "resend";
import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false, 
  },
};

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY!);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
const db = admin.firestore();

export async function POST(req: Request) {
  try {
    const rawBody = await req.arrayBuffer();
    const body = Buffer.from(rawBody);
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
    } catch (err: any) {
      console.error("⚠️ Stripe signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook signature failed: ${err.message}` },
        { status: 400 }
      );
    }


    // ACTIVATE PREMIUM (checkout, renewal, or new subscription)
    if (
      event.type === "checkout.session.completed" ||
      event.type === "invoice.payment_succeeded" ||
      event.type === "customer.subscription.created"
    ) {
      const object = event.data.object as
        | Stripe.Checkout.Session
        | Stripe.Invoice
        | Stripe.Subscription;

      let uid: string | undefined;
      let email: string | undefined;
      let plan: string | undefined;
      let stripeCustomerId: string | undefined;
      let displayName = "there";

      // Handle checkout session
      if (event.type === "checkout.session.completed") {
        const session = object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        uid = metadata.uid;
        plan = metadata.plan || "Premium";
        email = session.customer_email || undefined;
        displayName = (metadata as any).displayName || "there";
        stripeCustomerId = session.customer as string;
      }

      // Handle invoice success (recurring payment)
      if (event.type === "invoice.payment_succeeded") {
        const invoice = object as Stripe.Invoice;
        stripeCustomerId = invoice.customer as string;
      }

      // Handle new subscription
      if (event.type === "customer.subscription.created") {
        const sub = object as Stripe.Subscription;
        stripeCustomerId = sub.customer as string;
      }

      // If no UID found, look up by Stripe customer ID
      if (!uid && stripeCustomerId) {
        const userSnap = await db
          .collection("users")
          .where("stripeCustomerId", "==", stripeCustomerId)
          .limit(1)
          .get();

        if (!userSnap.empty) {
          uid = userSnap.docs[0].id;
        }
      }

      if (!uid) {
        return NextResponse.json({ message: "Missing UID" }, { status: 200 });
      }

      // Update Firestore user record
      await db.collection("users").doc(uid).update({
        isPremium: true,
        premiumSource: "stripe",
        stripeCustomerId,
        planType: plan?.toLowerCase() || "premium",
        subscriptionStatus: "active",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send confirmation email (only for checkout session)
      if (email && event.type === "checkout.session.completed") {
        try {
          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: `🎉 Welcome to Summarist Premium (${plan})!`,
            html: `
              <div style="font-family:sans-serif;padding:20px;">
                <h2>Welcome to Summarist Premium, ${displayName}!</h2>
                <p>Thanks for subscribing to the <b>${plan}</b> plan.</p>
                <p>Your payment was received successfully.</p>
                <a href="https://summarist.app/for-you"
                   style="display:inline-block;margin-top:20px;background:#00B846;color:white;
                          padding:10px 20px;text-decoration:none;border-radius:8px;">
                  Start Reading
                </a>
                <p style="margin-top:20px;font-size:13px;color:#666;">
                  Thanks for joining Summarist.
                </p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send payment email:", emailError);
        }
      }
    }

    // HANDLE SUBSCRIPTION CANCELLATION
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Lookup Firestore user by Stripe customer ID
      const userSnap = await db
        .collection("users")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

      if (userSnap.empty) {
        return NextResponse.json({ message: "User not found" }, { status: 200 });
      }

      const userDoc = userSnap.docs[0];
      const userData = userDoc.data();

      await userDoc.ref.update({
        isPremium: false,
        subscriptionStatus: "canceled",
        canceledAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send cancellation email
      if (userData.email) {
        try {
          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: userData.email,
            subject: "Your Summarist Premium subscription was canceled",
            html: `
              <div style="font-family:sans-serif;padding:20px;">
                <h2>Hi ${userData.displayName || "there"},</h2>
                <p>Your Summarist Premium subscription has been canceled.</p>
                <p>You'll keep access until the end of your billing period.</p>
                <a href="https://summarist.app/pricing"
                   style="display:inline-block;margin-top:20px;background:#00B846;color:white;
                          padding:10px 20px;text-decoration:none;border-radius:8px;">
                  Resubscribe
                </a>
                <p style="margin-top:20px;font-size:13px;color:#666;">
                  We hope to see you again soon.
                </p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send cancellation email:", emailError);
        }
      }
    }

    // respond to Stripe
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
