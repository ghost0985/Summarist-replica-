import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Book } from "@/types/book";

interface BooksState {
  items: Book[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: BooksState = {
  items: [],
  status: "idle",
};

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    setBooks: (state, action: PayloadAction<Book[]>) => {
      state.items = action.payload; 
      state.status = "succeeded";
    },
    setLoading: (state) => {
      state.status = "loading";
    },
  },
});

export const { setBooks, setLoading } = booksSlice.actions;
export default booksSlice.reducer;
