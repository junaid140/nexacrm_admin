import { useDispatch, useSelector } from "react-redux";
import { loginUser, logoutUser } from "../redux/actions/authAction.js";
export default function useAuth() {
  const dispatch = useDispatch();
  const session = useSelector((state) => state.auth.user);
  return {
    session,
    login: (values) => dispatch(loginUser(values)),
    logout: () => dispatch(logoutUser()),
  };
}
