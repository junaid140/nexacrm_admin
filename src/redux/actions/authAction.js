import { api, setToken } from "../../configs/api.js";
import { setSession } from "../slices/authSlice.js";
export const loginUser = (values) => async (dispatch) => {
  const result = await api("login", { method: "POST", body: values });
  if (!/^[a-f0-9]{64}$/i.test(result.token || ""))
    throw new Error("Invalid sign-in response.");
  setToken(result.token);
  dispatch(setSession(result.user));
  return result.user;
};
export const logoutUser = () => async (dispatch) => {
  await api("logout", { method: "POST", body: {} });
  setToken(null);
  dispatch(setSession(null));
};
