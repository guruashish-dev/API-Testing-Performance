import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/test", label: "API Testing" },
  { to: "/history", label: "History" },
  { to: "/analytics", label: "Analytics" },
];

function MobileNav() {
  return (
    <nav className="mb-5 grid grid-cols-2 gap-2 lg:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `rounded-xl border px-3 py-2 text-center text-sm transition ${
              isActive
                ? "border-accent/60 bg-accent/20 text-accent"
                : "border-white/10 bg-panelSoft/70 text-textMuted hover:text-text"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function ShellLayout({ children }) {
  return (
    <div className="min-h-screen text-text">
      <div className="mx-auto flex w-full max-w-[1500px] gap-6 px-4 py-6 lg:px-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 flex-col justify-between rounded-3xl border border-white/10 bg-panel/75 p-6 shadow-soft backdrop-blur-sm lg:flex">
          <div>
            <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/20 to-transparent p-4">
              <p className="font-display text-2xl tracking-wide text-accent">API-Watch</p>
              <p className="mt-1 text-xs text-textMuted">Enterprise API Reliability Command Center</p>
            </div>
            <nav className="mt-10 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-xl border px-3 py-2 text-sm transition ${
                      isActive
                        ? "border-accent/45 bg-accent/20 text-accent shadow-glow"
                        : "border-transparent text-textMuted hover:border-white/10 hover:bg-white/5 hover:text-text"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-3 text-xs text-textMuted">
              Slow API threshold: <span className="font-semibold text-accent">1000ms</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-panelSoft/70 p-3 text-xs text-textMuted">
              <p>Environment: <span className="font-semibold text-text">Production-ready Dev</span></p>
              <p className="mt-1">Observability layer active</p>
            </div>
          </div>
        </aside>

        <main className="w-full animate-fadeUp rounded-3xl border border-white/10 bg-panel/55 p-4 shadow-soft backdrop-blur-xs md:p-6 lg:p-8">
          <MobileNav />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <h1 className="font-display text-3xl tracking-wide md:text-4xl">Advanced API Testing Dashboard</h1>
              <p className="text-sm text-textMuted">Operational intelligence for endpoint reliability at enterprise scale.</p>
            </div>
            <div className="rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
              Live Monitoring Online
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
