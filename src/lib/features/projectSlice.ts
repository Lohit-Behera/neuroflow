import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { FlowState } from "@/types/flowTypes";

interface ProjectState {
  _id: string;
  name: string;
  flow: FlowState;
  types: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const fetchCreateProject = createAsyncThunk(
  "project/createProject",
  async (project: { name: string; flow: FlowState }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/project/create", project);
      return data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage =
        err.response?.data?.message ??
        err.message ??
        "Something went wrong while creating project";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchAllProjects = createAsyncThunk(
  "project/getAllProjects",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/project/all");
      return data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage =
        err.response?.data?.message ??
        err.message ??
        "Something went wrong while getting projects";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchProject = createAsyncThunk(
  "project/getProject",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/project/get/${projectId}`);
      return data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage =
        err.response?.data?.message ??
        err.message ??
        "Something went wrong while getting project";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchRenameProject = createAsyncThunk(
  "project/rename",
  async (project: { projectId: string; name: string }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `/api/project/rename/${project.projectId}`,
        { newWorkflowName: project.name }
      );
      return data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage =
        err.response?.data?.message ??
        err.message ??
        "Something went wrong while renaming project";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchDeleteProject = createAsyncThunk(
  "project/delete",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/api/project/delete/${projectId}`);
      return data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage =
        err.response?.data?.message ??
        err.message ??
        "Something went wrong while deleting project";
      return rejectWithValue(errorMessage);
    }
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState: {
    createProject: {},
    createProjectStatus: "idle",
    createProjectError: {},

    allProjects: [] as ProjectState[],
    allProjectsStatus: "idle",
    allProjectsError: {},

    project: {} as ProjectState,
    projectStatus: "idle",
    projectError: {},

    renameProject: {},
    renameProjectStatus: "idle",
    renameProjectError: {},

    deleteProject: {},
    deleteProjectStatus: "idle",
    deleteProjectError: {},
  },
  reducers: {
    resetProjectStatus: (state) => {
      state.projectStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Create project
      .addCase(fetchCreateProject.pending, (state) => {
        state.createProjectStatus = "loading";
      })
      .addCase(fetchCreateProject.fulfilled, (state, action) => {
        state.createProjectStatus = "succeeded";
        state.createProject = action.payload;
      })
      .addCase(fetchCreateProject.rejected, (state, action) => {
        state.createProjectStatus = "failed";
        state.createProjectError = action.payload || {};
      })
      // Get all projects
      .addCase(fetchAllProjects.pending, (state) => {
        state.allProjectsStatus = "loading";
      })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.allProjectsStatus = "succeeded";
        state.allProjects = action.payload;
      })
      .addCase(fetchAllProjects.rejected, (state, action) => {
        state.allProjectsStatus = "failed";
        state.allProjectsError = action.payload || {};
      })
      // Get project
      .addCase(fetchProject.pending, (state) => {
        state.projectStatus = "loading";
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.projectStatus = "succeeded";
        state.project = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.projectStatus = "failed";
        state.projectError = action.payload || {};
      })

      // Rename project
      .addCase(fetchRenameProject.pending, (state) => {
        state.renameProjectStatus = "loading";
      })
      .addCase(fetchRenameProject.fulfilled, (state, action) => {
        state.renameProjectStatus = "succeeded";
        state.renameProject = action.payload;
      })
      .addCase(fetchRenameProject.rejected, (state, action) => {
        state.renameProjectStatus = "failed";
        state.renameProjectError = action.payload || {};
      })

      // Delete project
      .addCase(fetchDeleteProject.pending, (state) => {
        state.deleteProjectStatus = "loading";
      })
      .addCase(fetchDeleteProject.fulfilled, (state, action) => {
        state.deleteProjectStatus = "succeeded";
        state.deleteProject = action.payload;
      })
      .addCase(fetchDeleteProject.rejected, (state, action) => {
        state.deleteProjectStatus = "failed";
        state.deleteProjectError = action.payload || {};
      });
  },
});

export const { resetProjectStatus } = projectSlice.actions;
export default projectSlice.reducer;
