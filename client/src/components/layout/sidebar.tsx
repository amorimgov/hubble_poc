import { Link, useLocation } from "wouter";
import { Database, BarChart3, File, GitBranch, BookOpen, History, Satellite, CheckSquare, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Portfólio", href: "/catalog", icon: Database },
  { name: "Favoritos", href: "/favorites", icon: Heart },
  { name: "Contratos de Dados", href: "/data-contracts", icon: File },
  { name: "Lineage", href: "/lineage", icon: GitBranch },
  { name: "Documentação", href: "/documentation", icon: BookOpen },
  { name: "Histórico", href: "/history", icon: History },
  { name: "Aprovações", href: "/approvals", icon: CheckSquare },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Satellite className="text-white w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-primary">Hubble</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href === "/catalog" && location === "/");
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isActive
                    ? "text-accent bg-accent/10"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">JS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">João Silva</p>
            <p className="text-xs text-gray-500">Data Engineer</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
