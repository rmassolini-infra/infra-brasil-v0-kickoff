import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Store, DollarSign, Activity, CheckCircle, Wrench } from "lucide-react";
import Logo from "./Logo";

const Navigation = () => {
  const location = useLocation();

  const links = [
    { path: "/", label: "Início", icon: null },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/telemetria", label: "Telemetria", icon: Activity },
    { path: "/data-quality", label: "Qualidade de Dados", icon: CheckCircle },
    { path: "/manutencao", label: "Manutenção", icon: Wrench },
    { path: "/marketplace", label: "Marketplace", icon: Store },
    { path: "/financeiro", label: "Financeiro", icon: DollarSign },
  ];

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>

          <div className="flex items-center gap-8">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
