import { configureStore } from "@reduxjs/toolkit";
import { footballSearchReducer } from "@/store/slices/footballSearchSlice";
import { uiReducer } from "@/store/slices/uiSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      footballSearch: footballSearchReducer,
      ui: uiReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
