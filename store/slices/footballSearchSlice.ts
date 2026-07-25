import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FootballMatchDto, FootballTeamDto } from "@/types/football";

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface FootballSearchState {
  date: string;
  leagueId: string;
  teamQuery: string;
  selectedTeam: FootballTeamDto | null;
  scope: "next" | "last";
  matches: FootballMatchDto[];
  searched: boolean;
  error: string;
  actionMessage: string;
  addedMatchIds: string[];
}

const initialState: FootballSearchState = {
  date: todayKey(),
  leagueId: "",
  teamQuery: "",
  selectedTeam: null,
  scope: "next",
  matches: [],
  searched: false,
  error: "",
  actionMessage: "",
  addedMatchIds: [],
};

const footballSearchSlice = createSlice({
  name: "footballSearch",
  initialState,
  reducers: {
    setDate(state, action: PayloadAction<string>) {
      state.date = action.payload;
    },
    setLeagueId(state, action: PayloadAction<string>) {
      state.leagueId = action.payload;
    },
    setTeamQuery(state, action: PayloadAction<string>) {
      state.teamQuery = action.payload;
      state.selectedTeam = null;
    },
    setSelectedTeam(state, action: PayloadAction<FootballTeamDto | null>) {
      state.selectedTeam = action.payload;
      if (action.payload) {
        state.teamQuery = action.payload.name;
      }
    },
    clearSelectedTeam(state) {
      state.selectedTeam = null;
      state.teamQuery = "";
    },
    setScope(state, action: PayloadAction<"next" | "last">) {
      state.scope = action.payload;
    },
    searchStarted(state) {
      state.error = "";
      state.actionMessage = "";
      state.searched = true;
    },
    searchSucceeded(state, action: PayloadAction<FootballMatchDto[]>) {
      state.matches = action.payload;
      state.error = "";
    },
    searchFailed(state, action: PayloadAction<string>) {
      state.matches = [];
      state.error = action.payload;
    },
    setActionMessage(state, action: PayloadAction<string>) {
      state.actionMessage = action.payload;
    },
    markMatchAdded(state, action: PayloadAction<string>) {
      if (!state.addedMatchIds.includes(action.payload)) {
        state.addedMatchIds.push(action.payload);
      }
    },
    clearFootballSearch() {
      return {
        ...initialState,
        date: todayKey(),
      };
    },
  },
});

export const {
  setDate,
  setLeagueId,
  setTeamQuery,
  setSelectedTeam,
  clearSelectedTeam,
  setScope,
  searchStarted,
  searchSucceeded,
  searchFailed,
  setActionMessage,
  markMatchAdded,
  clearFootballSearch,
} = footballSearchSlice.actions;

export const footballSearchReducer = footballSearchSlice.reducer;
