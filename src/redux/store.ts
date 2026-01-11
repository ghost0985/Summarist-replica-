import { configureStore } from "@reduxjs/toolkit";
import statsReducer from "./slices/statsSlice";
import booksReducer from "./slices/booksSlice";
import useReducer  from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    stats: statsReducer,
    books: booksReducer,
    user: useReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
