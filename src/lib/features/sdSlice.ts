import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios, { AxiosError } from "axios";

interface Model {
  title: string;
  model_name: string;
  hash: string;
  sha256: string;
  filename: string;
  config: string;
}

interface Sampler {
  name: string;
  aliases: string[];
  options: any;
}

interface Scheduler {
  name: string;
  label: string;
  aliases: null;
  default_rho: number;
  need_inner_model: boolean;
}

export const fetchSdModels = createAsyncThunk(
  "sd/fetchSdModels",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { base: { sdforge } = {} } = getState() as RootState;
      if (!sdforge) {
        return rejectWithValue("SD base url is not set");
      }
      const { data } = await axios.get(
        `${sdforge?.baseUrl}/sdapi/v1/sd-models`
      );
      return data;
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

export const fetchSamplers = createAsyncThunk(
  "sd/fetchSamplers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { base: { sdforge } = {} } = getState() as RootState;
      if (!sdforge) {
        return rejectWithValue("SD base url is not set");
      }
      const { data } = await axios.get(`${sdforge?.baseUrl}/sdapi/v1/samplers`);
      return data;
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

export const fetchSchedulers = createAsyncThunk(
  "sd/fetchSchedulers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { base: { sdforge } = {} } = getState() as RootState;
      if (!sdforge) {
        return rejectWithValue("SD base url is not set");
      }
      const { data } = await axios.get(
        `${sdforge?.baseUrl}/sdapi/v1/schedulers`
      );
      return data;
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

const sdSlice = createSlice({
  name: "sd",
  initialState: {
    models: [] as Model[],
    modelsStatus: "idle",
    modelsError: {},

    samplers: [] as Sampler[],
    samplersStatus: "idle",
    samplersError: {},

    schedulers: [] as Scheduler[],
    schedulersStatus: "idle",
    schedulersError: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Models
      .addCase(fetchSdModels.pending, (state) => {
        state.modelsStatus = "loading";
      })
      .addCase(fetchSdModels.fulfilled, (state, action) => {
        state.models = action.payload;
        state.modelsStatus = "succeeded";
      })
      .addCase(fetchSdModels.rejected, (state, action) => {
        state.modelsStatus = "failed";
        state.modelsError = action.error.message ?? "Failed to fetch models";
      })

      // Samplers
      .addCase(fetchSamplers.pending, (state) => {
        state.samplersStatus = "loading";
      })
      .addCase(fetchSamplers.fulfilled, (state, action) => {
        state.samplers = action.payload;
        state.samplersStatus = "succeeded";
      })
      .addCase(fetchSamplers.rejected, (state, action) => {
        state.samplersStatus = "failed";
        state.samplersError =
          action.error.message ?? "Failed to fetch samplers";
      })

      // Schedulers
      .addCase(fetchSchedulers.pending, (state) => {
        state.schedulersStatus = "loading";
      })
      .addCase(fetchSchedulers.fulfilled, (state, action) => {
        state.schedulers = action.payload;
        state.schedulersStatus = "succeeded";
      })
      .addCase(fetchSchedulers.rejected, (state, action) => {
        state.schedulersStatus = "failed";
        state.schedulersError =
          action.error.message ?? "Failed to fetch schedulers";
      });
  },
});

export default sdSlice.reducer;
