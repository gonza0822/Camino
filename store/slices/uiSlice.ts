import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const TODAY_MATCHES_PANEL_MIN = 220;
export const TODAY_MATCHES_PANEL_MAX = 480;
export const TODAY_MATCHES_PANEL_DEFAULT = 288;

interface UiState {
  todayMatchesPanelWidth: number;
}

const initialState: UiState = {
  todayMatchesPanelWidth: TODAY_MATCHES_PANEL_DEFAULT,
};

function clampPanelWidth(width: number): number {
  return Math.min(TODAY_MATCHES_PANEL_MAX, Math.max(TODAY_MATCHES_PANEL_MIN, Math.round(width)));
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTodayMatchesPanelWidth(state, action: PayloadAction<number>) {
      state.todayMatchesPanelWidth = clampPanelWidth(action.payload);
    },
  },
});

export const { setTodayMatchesPanelWidth } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
