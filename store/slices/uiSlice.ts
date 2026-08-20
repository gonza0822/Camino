import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const TODAY_MATCHES_PANEL_MIN = 220;
export const TODAY_MATCHES_PANEL_MAX = 480;
export const TODAY_MATCHES_PANEL_DEFAULT = 288;

interface WeeklyViewState {
  weekStart: string;
  day: string;
}

interface UiState {
  todayMatchesPanelWidth: number;
  weeklyView: WeeklyViewState | null;
}

const initialState: UiState = {
  todayMatchesPanelWidth: TODAY_MATCHES_PANEL_DEFAULT,
  weeklyView: null,
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
    setWeeklyView(state, action: PayloadAction<WeeklyViewState>) {
      state.weeklyView = action.payload;
    },
    clearWeeklyView(state) {
      state.weeklyView = null;
    },
  },
});

export const { setTodayMatchesPanelWidth, setWeeklyView, clearWeeklyView } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
