import { Lock, LayoutDashboard, Package, Settings, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Package, label: "Entrega & Geofencing", path: "/geofencing-settings" },
    { icon: Settings, label: "Configurações", path: "/settings" },
  ];

  return (
    <aside className="w-64 bg-primary min-h-screen flex flex-col">
      <div className="p-6 border-b border-primary-foreground/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">GeoLockBox</h1>
            <p className="text-xs text-primary-foreground/70">Monitoramento IoT</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary-foreground/10 text-primary-foreground"
                      : "text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-foreground/20">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
