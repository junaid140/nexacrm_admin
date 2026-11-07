import { NavLink } from "react-router-dom";
import logo from "../../assets/nexacrm-logo.png";
import AdminNavigation from "./AdminNavigation.jsx";
export default function AdminSidebar({ onNavigate }) {
  return (
    <aside
      id="admin-navigation"
      className="fixed bottom-0 left-0 top-0 z-40 flex w-[260px] flex-col border-r border-gray-200/80 bg-white print:hidden"
    >
      <NavLink
        to="/dashboard"
        className="mx-5 flex h-20 shrink-0 items-center gap-3 border-b border-gray-100 px-1"
        aria-label="NexaCRM home"
      >
        <img src={logo} alt="NexaCRM" className="max-h-12 max-w-full object-contain" />
      </NavLink>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 [scrollbar-width:thin]">
        <AdminNavigation onNavigate={onNavigate} />
      </div>
    </aside>
  );
}
