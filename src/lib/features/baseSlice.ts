import { createSlice } from "@reduxjs/toolkit";

const baseSlice = createSlice({
  name: "base",
  initialState: {
    ollama: {
      baseUrl: "http://localhost:11434",
    },
    sdforge: {
      baseUrl: "http://127.0.0.1:7860",
    },
  },
  reducers: {
    setBaseUrl: (state, action) => {
      state.ollama.baseUrl = action.payload.ollamaBaseUrl;
      state.sdforge.baseUrl = action.payload.sdforgeBaseUrl;
    },
  },
});

export const { setBaseUrl } = baseSlice.actions;
export default baseSlice.reducer;
