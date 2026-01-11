import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  isPremium: boolean;
  planType: string | null;
  subscriptionStatus: string | null; 
  premiumSource: string | null;
  isGuest: boolean;
  savedBooks: string[];
  finishedBooks: string[];
}

const savedGuestData =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("guestUserData") || "{}")
    : {};

const initialState: UserState = {
  uid: savedGuestData.uid || null,
  email: savedGuestData.email || null,
  displayName: savedGuestData.displayName || null,
  isPremium: savedGuestData.isPremium || false,
  planType: savedGuestData.planType || null,
  subscriptionStatus: savedGuestData.subscriptionStatus || null,
  premiumSource: savedGuestData.premiumSource || null,
  isGuest: savedGuestData.isGuest || false,
  savedBooks: savedGuestData.savedBooks || [],
  finishedBooks: savedGuestData.finishedBooks || [],
};

const persistGuestData = (state: UserState) => {
  if (state.isGuest) {
    localStorage.setItem("guestUserData", JSON.stringify(state));
  }
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload);
      persistGuestData(state);
    },

    clearUser: (state) => {
      Object.assign(state, initialState);
      localStorage.removeItem("guestUserData");
    },

    addSavedBook: (state, action: PayloadAction<string>) => {
      if (!state.savedBooks.includes(action.payload)) {
        state.savedBooks.push(action.payload);
        persistGuestData(state);
      }
    },

    removeSavedBook: (state, action: PayloadAction<string>) => {
      state.savedBooks = state.savedBooks.filter(
        (bookId) => bookId !== action.payload
      );
      persistGuestData(state);
    },

    addFinishedBook: (state, action: PayloadAction<string>) => {
      if (!state.finishedBooks.includes(action.payload)) {
        state.finishedBooks.push(action.payload);
        persistGuestData(state);
      }
    },

    removeFinishedBook: (state, action: PayloadAction<string>) => {
      state.finishedBooks = state.finishedBooks.filter(
        (bookId) => bookId !== action.payload
      );
      persistGuestData(state);
    },
  },
});

export const {
  setUser,
  clearUser,
  addSavedBook,
  removeSavedBook,
  addFinishedBook,
  removeFinishedBook,
} = userSlice.actions;

export default userSlice.reducer;
