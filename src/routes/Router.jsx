import { lazy, Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import AdminLayout from "../layouts/main/AdminLayout.jsx";
import Login from "../pages/auth/Login.jsx";
import NotFound from "../pages/errors/NotFound.jsx";
const ContactSettings = lazy(() => import("../pages/admin/ContactSettings.jsx"));
const Renewals = lazy(() => import("../pages/admin/Renewals.jsx"));
const BankSettings = lazy(() => import("../pages/admin/BankSettings.jsx"));
const TrialApplications = lazy(() => import("../pages/admin/TrialApplications.jsx"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard.jsx"));
const Administrators = lazy(() => import("../pages/admin/Administrators.jsx"));
const Clients = lazy(() => import("../pages/admin/Clients.jsx"));
const Plans = lazy(() => import("../pages/admin/Plans.jsx"));
const Subscriptions = lazy(() => import("../pages/admin/Subscriptions.jsx"));
const Users = lazy(() => import("../pages/admin/Users.jsx"));
const Billing = lazy(() => import("../pages/admin/Billing.jsx"));
const Industries = lazy(() => import("../pages/admin/Industries.jsx"));
const Support = lazy(() => import("../pages/admin/Support.jsx"));
const System = lazy(() => import("../pages/admin/System.jsx"));
const Integrations = lazy(() => import("../pages/admin/Integrations.jsx"));
const Audit = lazy(() => import("../pages/admin/Audit.jsx"));
const Reports = lazy(() => import("../pages/admin/Reports.jsx"));
const Settings = lazy(() => import("../pages/admin/Settings.jsx"));
function Router() {
  const routes = useRoutes([
    { path: "/login", element: <Login /> },
    {
      path: "/",
      element: <AdminLayout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: "dashboard", element: <AdminDashboard /> },
        { path: "admins", element: <Administrators /> },
        { path: "clients", element: <Clients /> },
        { path: "trial-applications", element: <TrialApplications /> },
        { path: "plans", element: <Plans /> },
        { path: "subscriptions", element: <Subscriptions /> },
        { path: "renewals", element: <Renewals /> },
        { path: "payment-settings", element: <BankSettings /> },
        { path: "users", element: <Users /> },
        { path: "billing", element: <Billing /> },
        { path: "industries", element: <Industries /> },
        { path: "support", element: <Support /> },
        { path: "system", element: <System /> },
        { path: "integrations", element: <Integrations /> },
        { path: "audit", element: <Audit /> },
        { path: "reports", element: <Reports /> },
        { path: "contact-settings", element: <ContactSettings /> },
        { path: "settings", element: <Settings /> },
      ],
    },
    { path: "*", element: <NotFound /> },
  ]);
  return <Suspense fallback={null}>{routes}</Suspense>;
}
export default Router;
