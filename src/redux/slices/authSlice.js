import { createSlice } from "@reduxjs/toolkit";
const authSlice = createSlice({
  name: "auth",
  initialState: { user: null },
  reducers: {
    setSession(state, action) {
      state.user = action.payload;
    },
  },
});
export const { setSession } = authSlice.actions;
export default authSlice.reducer;
