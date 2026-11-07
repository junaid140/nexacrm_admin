import logo from "../../assets/nexacrm-logo.png";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, ChevronRight } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
export default function AdminHeader({ setOpen, user, config, setError }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <header className="admin-topbar fixed inset-x-0 top-0 z-30 flex h-20 min-w-0 items-center justify-between gap-4 border-b border-gray-200/70 bg-white/95 px-4 backdrop-blur-md md:left-[260px] md:px-8">
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          aria-label="Open navigation"
          className="rounded-xl p-2 text-gray-500"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>
        <Link to="/dashboard">
          <img
            src={logo}
            alt="NexaCRM"
            className="max-h-10 max-w-[135px] object-contain"
          />
        </Link>
      </div>
      <nav
        aria-label="Breadcrumb"
        className="hidden min-w-0 items-center gap-2 text-sm md:flex"
      >
        <span className="hidden text-gray-400 xl:block">Home</span>
        <ChevronRight size={14} className="hidden text-gray-300 xl:block" />
        <span aria-current="page" className="truncate font-medium text-gray-800">
          {config.title}
        </span>
      </nav>
      <div className="ml-auto flex shrink-0 items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-900">
          {user?.name?.slice(0, 2).toUpperCase()}
        </span>
        <span className="hidden xl:block">
          <span className="block text-sm font-semibold text-gray-800">{user?.name}</span>
          <span className="text-xs text-gray-500">
            {user?.role === "Sales Agent"
              ? "Sales Agent"
              : user?.role === "Manager"
                ? "Manager"
                : "SaaS Administrator"}
          </span>
        </span>
        <button
          type="button"
          aria-label="Sign out"
          className="rounded-xl p-3 text-gray-500 hover:bg-brand-50 hover:text-brand-900"
          onClick={async () => {
            try {
              await logout();
              navigate("/login", { replace: true });
            } catch (error) {
              setError(error.message);
            }
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
