import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSession } from "../../redux/slices/authSlice.js";
export default function SessionGate({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const expired = () => {
      dispatch(setSession(null));
      navigate("/login", { replace: true });
    };
    window.addEventListener("saas-session-expired", expired);
    return () => window.removeEventListener("saas-session-expired", expired);
  }, [dispatch, navigate]);
  return children;
}
