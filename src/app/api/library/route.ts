import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ saved: [], finished: [] }, { status: 200 });
  }
  const mock = {
    saved: [
      {
        id: "1",
        title: "Can't Hurt Me",
        author: "David Goggins",
        subTitle: "Master Your Mind and Defy the Odds",
        imageLink: "https://images-na.ssl-images-amazon.com/images/I/81Otwki3mPL.jpg",
      },
      {
        id: "2",
        title: "The Lean Startup",
        author: "Eric Ries",
        subTitle: "How Constant Innovation Creates Radically Successful Businesses",
        imageLink: "https://images-na.ssl-images-amazon.com/images/I/81-QB7nDh4L.jpg",
      },
    ],
    finished: [
      {
        id: "3",
        title: "Atomic Habits",
        author: "James Clear",
        subTitle: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
        imageLink: "https://images-na.ssl-images-amazon.com/images/I/91bYsX41DVL.jpg",
      },
      {
        id: "4",
        title: "Deep Work",
        author: "Cal Newport",
        subTitle: "Rules for Focused Success in a Distracted World",
        imageLink: "https://images-na.ssl-images-amazon.com/images/I/81bGKUa1e0L.jpg",
      },
    ],
  };

  return NextResponse.json(mock, { status: 200 });
}
