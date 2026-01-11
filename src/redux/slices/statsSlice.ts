import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StatsState {
  booksRead: number;
  activeIndex: number;
}

const initialState: StatsState = {
  booksRead: 0,
  activeIndex: 0,
};

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    incrementBooksRead: (state) => {
      state.booksRead += 1;
    },
    setActiveIndex: (state, action: PayloadAction<number>) => {
      state.activeIndex = action.payload;
    },
  },
});

export const { incrementBooksRead, setActiveIndex } = statsSlice.actions;
export default statsSlice.reducer;
