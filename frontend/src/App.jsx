import { useEffect, useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCheck,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Plus,
  UsersRound,
  X,
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Analytics from "./pages/Analytics";
import { ToastProvider } from "./components/toast";

const navigation = [
  { label: "Overview", to: "/", icon: LayoutDashboard, end: true },
  { label: "Tasks", to: "/tasks", icon: ClipboardList },
  { label: "Team", to: "/team", icon: UsersRound },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
];

function Workspace() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const current =
    navigation.find((item) => item.to === location.pathname) || navigation[0];
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  useEffect(() => {
    const content = document.querySelector(".main-content");
    if (!content) return undefined;

    const targets =
      ".panel, .stat-card, .employee-card, .filter-bar, .analytics-note";
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("is-visible");
                  observer.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
          )
        : null;

    function observeTargets() {
      content.querySelectorAll(targets).forEach((element) => {
        if (element.classList.contains("scroll-reveal")) return;
        element.classList.add("scroll-reveal");
        const bounds = element.getBoundingClientRect();
        if (
          !observer ||
          (bounds.bottom > 0 && bounds.top < window.innerHeight)
        ) {
          window.setTimeout(() => {
            if (element.isConnected) element.classList.add("is-visible");
          }, 20);
        } else {
          observer.observe(element);
        }
      });
    }

    function revealVisibleTargets() {
      content
        .querySelectorAll(".scroll-reveal:not(.is-visible)")
        .forEach((element) => {
          const bounds = element.getBoundingClientRect();
          if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
            element.classList.add("is-visible");
            observer?.unobserve(element);
          }
        });
    }

    observeTargets();
    const mutations = new MutationObserver(observeTargets);
    mutations.observe(content, { childList: true, subtree: true });
    window.addEventListener("scroll", revealVisibleTargets, { passive: true });
    return () => {
      mutations.disconnect();
      observer?.disconnect();
      window.removeEventListener("scroll", revealVisibleTargets);
      content.querySelectorAll(".scroll-reveal").forEach((element) => {
        element.classList.remove("scroll-reveal", "is-visible");
      });
    };
  }, [location.pathname]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={closeMenu}
        />
      )}
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <span className="brand-mark">
            <CheckCheck size={20} strokeWidth={2.3} />
          </span>
          <span className="brand-name">
            daymark<span>.</span>
            <small>WORKSPACE</small>
          </span>
          <button
            className="icon-button sidebar-close"
            onClick={closeMenu}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>
        <div className="workspace-switcher">
          <span className="workspace-monogram">S</span>
          <span>
            <strong>Studio &amp; Co.</strong>
            <small>Business workspace</small>
          </span>
          <ArrowUpRight size={15} className="workspace-arrow" />
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="week-card">
            <div className="week-icon">
              <CalendarDays size={17} />
            </div>
            <div>
              <strong>One day at a time.</strong>
              <span>Good work adds up.</span>
            </div>
          </div>
          <div className="profile-row">
            <span className="profile-avatar">SM</span>
            <span>
              <strong>Studio Manager</strong>
              <small>Workspace admin</small>
            </span>
            <span className="online-dot" />
          </div>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="topbar">
          <div className="topbar-leading">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumbs">
              <span>Studio &amp; Co.</span>
              <span className="crumb-slash">/</span>
              <strong>{current.label}</strong>
            </div>
          </div>
          <div className="topbar-trailing">
            <span className="today-label">{today}</span>
            <span className="topbar-divider" />
            <span className="topbar-avatar">SM</span>
          </div>
        </header>
        <main className="main-content min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/team" element={<Team />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <footer className="page-footer">
            <span>DAYMARK WORKSPACE</span>
            <span>Make room for the work that matters.</span>
            <Plus size={13} />
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Workspace />
      </BrowserRouter>
    </ToastProvider>
  );
}
