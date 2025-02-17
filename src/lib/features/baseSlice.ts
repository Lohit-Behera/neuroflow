import { createSlice } from "@reduxjs/toolkit";

const baseSlice = createSlice({
  name: "base",
  initialState: {
    ollama: {
      baseUrl: "http://localhost:11434",
      useOllama: false,
    },
    sdforge: {
      baseUrl: "http://127.0.0.1:7860",
      useSdforge: false,
    },
  },
  reducers: {
    setBaseUrl: (state, action) => {
      state.ollama.baseUrl = action.payload.ollamaBaseUrl;
      state.sdforge.baseUrl = action.payload.sdforgeBaseUrl;
    },
    setUse: (state, action) => {
      state.ollama.useOllama = action.payload.useOllama;
      state.sdforge.useSdforge = action.payload.useSdforge;
    },
  },
});

export const { setBaseUrl, setUse } = baseSlice.actions;
export default baseSlice.reducer;
