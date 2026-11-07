import { useSelector } from "react-redux";
import { useId, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ContactRound,
  CalendarClock,
  ListTodo,
  Phone,
  Timer,
  Megaphone,
  Settings2,
  ChartNoAxesCombined,
  ChevronDown,
} from "lucide-react";
import { matchesPath, navigation } from "../../constants/Sidebar.jsx";

const icons = {
  LayoutDashboard,
  Users,
  ContactRound,
  CalendarClock,
  ListTodo,
  Phone,
  Timer,
  Megaphone,
  Settings2,
  ChartNoAxesCombined,
};

function AdminNavigation({ onNavigate, label = "Main navigation" }) {
  const { pathname } = useLocation();
  const id = useId();
  const user = useSelector((state) => state.auth.user);
  const items =
    user?.role === "Sales Agent"
      ? navigation.filter((item) => ["/clients", "/users"].includes(item.path))
      : navigation;
  const activeGroup = items.find((item) =>
    item.children?.some((child) => matchesPath(pathname, child.path)),
  )?.name;
  const [expanded, setExpanded] = useState({ pathname, name: activeGroup });
  const open = expanded.pathname === pathname ? expanded.name : activeGroup;
  return (
    <nav aria-label={label} className="space-y-1">
      {items.map((item) => {
        const Icon = icons[item.icon];
        if (!item.children)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-brand-900 text-white shadow-sm" : "text-gray-600 hover:bg-brand-50 hover:text-brand-900"}`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        const isOpen = open === item.name;
        return (
          <div key={item.name}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${id}-${item.name}`}
              onClick={() => setExpanded({ pathname, name: isOpen ? null : item.name })}
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${activeGroup === item.name ? "bg-brand-100/70 text-brand-900" : "text-gray-600 hover:bg-brand-50"}`}
            >
              <Icon size={18} />
              <span className="flex-1">{item.name}</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              id={`${id}-${item.name}`}
              hidden={!isOpen}
              className="mb-2 ml-5 mt-1 space-y-1 border-l border-gray-200 pl-4"
            >
              {item.children.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive ? "bg-brand-900 font-medium text-white" : "text-gray-500 hover:bg-brand-50 hover:text-brand-900"}`
                  }
                >
                  {child.name}
                </NavLink>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
export default AdminNavigation;
