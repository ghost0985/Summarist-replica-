import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

  const doc = await db.collection("users").doc(uid).get();
  if (!doc.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const user = doc.data();
  const customerId = user?.stripeCustomerId;
  let stripeData = null;

  if (customerId) {
    stripeData = await stripe.customers.retrieve(customerId);
  }

  return NextResponse.json({
    firestore: user,
    stripe: stripeData,
  });
}
