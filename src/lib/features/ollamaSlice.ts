import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios, { AxiosError } from "axios";

interface Model {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
}

export const fetchOllamaModels = createAsyncThunk(
  "ollama/fetchOllamaModels",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { base: { ollama } = {} } = getState() as RootState;
      if (!ollama) {
        return rejectWithValue("Ollama base url is not set");
      }
      const { data } = await axios.get(`${ollama.baseUrl}/api/tags`);
      return data.models;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage =
        err.response?.data?.message ??
        err.message ??
        "Something went wrong while getting all the products";
      return rejectWithValue(errorMessage);
    }
  }
);

const ollamaSlice = createSlice({
  name: "ollama",
  initialState: {
    models: [] as Model[],
    modelsStatus: "idle",
    modelsError: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOllamaModels.pending, (state) => {
        state.modelsStatus = "loading";
      })
      .addCase(fetchOllamaModels.fulfilled, (state, action) => {
        state.modelsStatus = "succeeded";
        state.models = action.payload;
      })
      .addCase(fetchOllamaModels.rejected, (state, action) => {
        state.modelsStatus = "failed";
        state.modelsError = action.payload || "Something went wrong";
      });
  },
});

export default ollamaSlice.reducer;
