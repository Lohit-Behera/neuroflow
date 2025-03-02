import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

export const fetchCreateOutput = createAsyncThunk(
  "output/createOutput",
  async (
    output: { output: string; images: Record<string, string>; name: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.post("/api/output/create", output);
      return data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage =
        err.response?.data?.message ??
        err.message ??
        "Something went wrong while creating output";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchAllOutputs = createAsyncThunk(
  "output/getAllOutputs",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/output/all");
      return data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage =
        err.response?.data?.message ??
        err.message ??
        "Something went wrong while getting all the outputs";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchGetOutput = createAsyncThunk(
  "output/getOutput",
  async (outputId: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/output/get/${outputId}`);
      return data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage =
        err.response?.data?.message ??
        err.message ??
        "Something went wrong while getting output";
      return rejectWithValue(errorMessage);
    }
  }
);

const outputSlice = createSlice({
  name: "output",
  initialState: {
    createOutput: {},
    createOutputStatus: "idle",
    createOutputError: {},

    allOutputs: [],
    allOutputsStatus: "idle",
    allOutputsError: {},

    output: {},
    outputStatus: "idle",
    outputError: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreateOutput.pending, (state) => {
        state.createOutputStatus = "loading";
      })
      .addCase(fetchCreateOutput.fulfilled, (state, action) => {
        state.createOutputStatus = "succeeded";
        state.createOutput = action.payload;
      })
      .addCase(fetchCreateOutput.rejected, (state, action) => {
        state.createOutputStatus = "failed";
        state.createOutputError = action.payload || "Something went wrong";
      })
      .addCase(fetchAllOutputs.pending, (state) => {
        state.allOutputsStatus = "loading";
      })
      .addCase(fetchAllOutputs.fulfilled, (state, action) => {
        state.allOutputsStatus = "succeeded";
        state.allOutputs = action.payload;
      })
      .addCase(fetchAllOutputs.rejected, (state, action) => {
        state.allOutputsStatus = "failed";
        state.allOutputsError = action.payload || "Something went wrong";
      })
      .addCase(fetchGetOutput.pending, (state) => {
        state.outputStatus = "loading";
      })
      .addCase(fetchGetOutput.fulfilled, (state, action) => {
        state.outputStatus = "succeeded";
        state.output = action.payload;
      })
      .addCase(fetchGetOutput.rejected, (state, action) => {
        state.outputStatus = "failed";
        state.outputError = action.payload || "Something went wrong";
      });
  },
});

export default outputSlice.reducer;
