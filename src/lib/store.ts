import { configureStore } from "@reduxjs/toolkit";
import flowSlice from "./features/flowSlice";
import baseSlice from "./features/baseSlice";
import ollamaSlice from "./features/ollamaSlice";
import sdSlice from "./features/sdSlice";
import outputSlice from "./features/outputSlice";
import projectSlice from "./features/projectSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      flow: flowSlice,
      base: baseSlice,
      ollama: ollamaSlice,
      sd: sdSlice,
      output: outputSlice,
      project: projectSlice,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
