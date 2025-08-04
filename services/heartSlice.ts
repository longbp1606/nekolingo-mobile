import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface HeartState {
  hearts: number;
  maxHearts: number;
  lastHeartLostTime: number | null;
  heartRegenEnabled: boolean;
}

const initialState: HeartState = {
  hearts: 5, // Default hearts
  maxHearts: 5,
  lastHeartLostTime: null,
  heartRegenEnabled: true,
};

const heartSlice = createSlice({
  name: "hearts",
  initialState,
  reducers: {
    setHearts: (state, action: PayloadAction<number>) => {
      state.hearts = Math.max(0, Math.min(action.payload, state.maxHearts));
    },
    loseHeart: (state) => {
      if (state.hearts > 0) {
        state.hearts -= 1;
        state.lastHeartLostTime = Date.now();
      }
    },
    gainHeart: (state) => {
      if (state.hearts < state.maxHearts) {
        state.hearts += 1;
      }
    },
    setMaxHearts: (state, action: PayloadAction<number>) => {
      state.maxHearts = Math.max(1, action.payload);
      // If current hearts exceed new max, adjust
      if (state.hearts > state.maxHearts) {
        state.hearts = state.maxHearts;
      }
    },
    resetHearts: (state) => {
      state.hearts = state.maxHearts;
      state.lastHeartLostTime = null;
    },
    syncHeartsFromUser: (state, action: PayloadAction<number>) => {
      // Sync hearts from user profile data
      state.hearts = Math.max(0, Math.min(action.payload, state.maxHearts));
    },
  },
});

export const {
  setHearts,
  loseHeart,
  gainHeart,
  setMaxHearts,
  resetHearts,
  syncHeartsFromUser,
} = heartSlice.actions;

export default heartSlice.reducer;
