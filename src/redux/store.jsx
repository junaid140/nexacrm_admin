import { configureStore } from "@reduxjs/toolkit";
import auth from "./slices/authSlice.js";
export const store = configureStore({ reducer: { auth } });
