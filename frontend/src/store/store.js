import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import schemaReducer from './slices/schemaSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    schemas: schemaReducer,
  },
});
