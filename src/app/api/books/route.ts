import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const snapshot = await adminDB.collection("books").get();
    const books = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(books);
  } catch (error: any) {
    console.error("🔥 Firestore error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
