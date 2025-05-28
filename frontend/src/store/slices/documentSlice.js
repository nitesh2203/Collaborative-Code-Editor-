import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchDocuments = createAsyncThunk(
  'document/fetchDocuments',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createDocument = createAsyncThunk(
  'document/createDocument',
  async ({ title, language, content }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/documents`,
        { title, language, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateDocument = createAsyncThunk(
  'document/updateDocument',
  async ({ id, content, language }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(
        `${API_URL}/documents/${id}`,
        { content, language },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'document/deleteDocument',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await axios.delete(`${API_URL}/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,
};

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch documents';
      })
      // Create document
      .addCase(createDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.push(action.payload);
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create document';
      })
      // Update document
      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.documents.findIndex((doc) => doc._id === action.payload._id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?._id === action.payload._id) {
          state.currentDocument = action.payload;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update document';
      })
      // Delete document
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter((doc) => doc._id !== action.payload);
        if (state.currentDocument?._id === action.payload) {
          state.currentDocument = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete document';
      });
  },
});

export const { setCurrentDocument, clearError } = documentSlice.actions;
export default documentSlice.reducer; 