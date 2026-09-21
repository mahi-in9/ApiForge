import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchSchemas = createAsyncThunk(
  'schemas/fetchSchemas',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/schemas/${projectId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schemas');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to create schema');
    }
  }
);

export const updateSchema = createAsyncThunk(
  'schemas/updateSchema',
  async ({ apiSchemaId, ...updates }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/schemas/${apiSchemaId}`, updates);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update schema');
    }
  }
);

export const addRelationship = createAsyncThunk(
  'schemas/addRelationship',
  async ({ apiSchemaId, relationship }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/schemas/${apiSchemaId}/relationships`, relationship);
      return { apiSchemaId, relationship: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add relationship');
    }
  }
);

export const deleteRelationship = createAsyncThunk(
  'schemas/deleteRelationship',
  async ({ apiSchemaId, relId }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/schemas/${apiSchemaId}/relationships/${relId}`);
      return { apiSchemaId, relId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete relationship');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to delete schema');
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const schemaSlice = createSlice({
  name: 'schemas',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch ──────────────────────────────────────────────────────────────
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

      // ── Create ─────────────────────────────────────────────────────────────
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

      // ── Update ─────────────────────────────────────────────────────────────
      .addCase(updateSchema.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSchema.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload._id) {
          const idx = state.items.findIndex(s => s._id === action.payload._id);
          if (idx !== -1) state.items[idx] = action.payload;
        }
      })
      .addCase(updateSchema.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ── Add Relationship ───────────────────────────────────────────────────
      .addCase(addRelationship.fulfilled, (state, action) => {
        if (action.payload) {
          const { apiSchemaId, relationship } = action.payload;
          const schema = state.items.find(s => s._id === apiSchemaId);
          if (schema) {
            if (!schema.relationships) schema.relationships = [];
            schema.relationships.push(relationship);
          }
        }
      })
      .addCase(addRelationship.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ── Delete Relationship ────────────────────────────────────────────────
      .addCase(deleteRelationship.fulfilled, (state, action) => {
        if (action.payload) {
          const { apiSchemaId, relId } = action.payload;
          const schema = state.items.find(s => s._id === apiSchemaId);
          if (schema && schema.relationships) {
            schema.relationships = schema.relationships.filter(r => r._id !== relId);
          }
        }
      })
      .addCase(deleteRelationship.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ── Delete Schema ──────────────────────────────────────────────────────
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

export const { clearError } = schemaSlice.actions;
export default schemaSlice.reducer;
