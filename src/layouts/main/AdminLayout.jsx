import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import usePageData from "../../hooks/usePageData.js";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import AdminHeader from "../../components/admin/AdminHeader.jsx";
export default function AdminLayout() {
  const { pathname } = useLocation();
  const section = pathname.split("/")[1] || "dashboard";
  const state = usePageData(section);
  return (
    <div className="admin-shell min-h-dvh bg-brand-50 text-gray-900">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      {state.open && (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => state.setOpen(false)}
          />
          <AdminSidebar onNavigate={() => state.setOpen(false)} />
        </div>
      )}
      <div className="admin-content pt-20 md:ml-[260px]">
        <AdminHeader {...state} />
        <main
          id="main"
          tabIndex={-1}
          className="min-w-0 scroll-mt-20 px-4 py-6 outline-none md:px-8"
        >
          <Suspense fallback={null}>
            {state.user?.role === "Sales Agent" &&
            !["clients", "users"].includes(section) ? (
              <Navigate to="/clients" replace />
            ) : (
              <Outlet context={{ ...state, section }} />
            )}
          </Suspense>
        </main>
        <footer className="px-4 pb-6 text-xs text-gray-400 md:px-8">
          © {new Date().getFullYear()} NexaCRM CRM
        </footer>
      </div>
    </div>
  );
}
