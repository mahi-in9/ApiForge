import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchSchemas = createAsyncThunk(
  'schemas/fetchSchemas',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/schemas/${projectId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch schemas'
      );
    }
  }
);

export const createSchema = createAsyncThunk(
  'schemas/createSchema',
  async (schemaData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/schemas', schemaData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create schema'
      );
    }
  }
);

export const deleteSchema = createAsyncThunk(
  'schemas/deleteSchema',
  async (schemaId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/schemas/${schemaId}`);
      return schemaId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete schema'
      );
    }
  }
);

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

const schemaSlice = createSlice({
  name: 'schemas',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSchemas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchemas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchSchemas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createSchema.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSchema.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createSchema.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteSchema.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSchema.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteSchema.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default schemaSlice.reducer;
