import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q")?.trim().toLowerCase();

    if (!search) {
      return NextResponse.json(
        { error: "Missing search query" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://us-central1-summaristt.cloudfunctions.net/getBooksByAuthorOrTitle?search=${encodeURIComponent(
        search
      )}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Cloud Function failed: ${response.status}`);
    }

    const data = await response.json();


    const booksArray = Array.isArray(data)
      ? data
      : data.books || data.data?.books || [];

    const filteredBooks = booksArray.filter((book: any) => {
      const title = book.title?.toLowerCase() || " ";
      const author = book.title?.toLowerCase() || " ";
      return title.includes(search) || author.includes(search);
    });

    return NextResponse.json(filteredBooks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
