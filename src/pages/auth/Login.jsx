import logo from "../../assets/nexacrm-logo.png";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import { loginValidation } from "../../validations/loginValidation.js";
function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, session } = useAuth();
  const navigate = useNavigate();
  const initialValues = {
    email: "",
    password: "",
  };
  const handleLogin = async (values, { setSubmitting, setStatus }) => {
    try {
      const account = await login(values);
      navigate(account.role === "Sales Agent" ? "/clients" : "/dashboard");
    } catch (error) {
      setStatus(error.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };
  if (session)
    return (
      <Navigate to={session.role === "Sales Agent" ? "/clients" : "/dashboard"} replace />
    );
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-x-hidden bg-brand-900 px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-12 hidden h-52 w-16 border-y border-r border-white/20 sm:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-12 right-0 hidden h-52 w-16 border-y border-l border-white/20 sm:block"
      />
      <section className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <img src={logo} alt="NexaCRM" className="mb-8 h-auto w-60 max-w-full" />
        <h1 className="mb-1 text-xl font-medium text-black">Log In</h1>
        <p className="mb-8 text-sm text-gray-500">Sign in to your panel</p>
        <Formik
          initialValues={initialValues}
          validationSchema={loginValidation}
          onSubmit={handleLogin}
        >
          {({ isSubmitting, status }) => (
            <Form className="flex flex-col gap-6">
              {status && (
                <p role="alert" className="text-red-600">
                  {status}
                </p>
              )}
              <div className="relative">
                <label
                  htmlFor="email"
                  className="absolute -top-2.5 left-3 z-10 bg-white px-1 text-xs text-gray-500"
                >
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                />
                <ErrorMessage
                  name="email"
                  component="p"
                  className="mt-1 text-xs text-red-600"
                />
              </div>
              <div>
                <div className="relative">
                  <label
                    htmlFor="password"
                    className="absolute -top-2.5 left-3 z-10 bg-white px-1 text-xs text-gray-500"
                  >
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="p"
                  className="mt-1 text-xs text-red-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting || undefined}
                className={`w-full rounded-xl bg-brand-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-800`}
              >
                Log In
              </button>
            </Form>
          )}
        </Formik>
      </section>
    </main>
  );
}
export default Login;
