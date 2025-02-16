import { configureStore } from "@reduxjs/toolkit";
import flowSlice from "./features/flowSlice";
import baseSlice from "./features/baseSlice";
import ollamaSlice from "./features/ollamaSlice";
import sdSlice from "./features/sdSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      flow: flowSlice,
      base: baseSlice,
      ollama: ollamaSlice,
      sd: sdSlice,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
