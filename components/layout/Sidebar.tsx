"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Calendar,
  Users,
  Calculator,
  FileText,
  FolderOpen,
  FileCheck,
  HelpCircle,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      id: "cadastros",
      label: "Cadastros",
      icon: Building2,
      children: [
        { label: "Empresas", href: "/dashboard/cadastros/empresas" },
        { label: "Filiais", href: "/dashboard/cadastros/filiais" },
        { label: "Eventos", href: "/dashboard/cadastros/eventos" },
        { label: "Sindicatos", href: "/dashboard/cadastros/sindicatos" },
        { label: "Funcionários", href: "/dashboard/cadastros/funcionarios" },
      ],
    },
    {
      id: "calculos",
      label: "Cálculos",
      icon: Calculator,
      href: "/dashboard/calculos",
    },
    {
      id: "relatorios",
      label: "Relatórios",
      icon: FileText,
      href: "/dashboard/relatorios",
    },
    {
      id: "arquivos",
      label: "Arquivos",
      icon: FolderOpen,
      href: "/dashboard/arquivos",
    },
    {
      id: "esocial",
      label: "eSocial",
      icon: FileCheck,
      href: "/dashboard/esocial",
    },
    {
      id: "ajuda",
      label: "Ajuda",
      icon: HelpCircle,
      href: "/dashboard/ajuda",
    },
    {
      id: "ferramentas",
      label: "Ferramentas",
      icon: Settings,
      href: "/dashboard/ferramentas",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="h-16 border-b border-gray-200 flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="text-xl font-bold text-gray-900">FOPAG</span>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Menu
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = !!item.children;
              const isExpanded = expandedMenus.includes(item.id);
              const isItemActive = item.href ? isActive(item.href) : false;

              if (hasChildren) {
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={cn(
                        "sidebar-item w-full justify-between",
                        isItemActive && "active"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children?.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "sidebar-item text-sm",
                              isActive(child.href) && "active"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href!}
                  className={cn("sidebar-item", isItemActive && "active")}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-red-600 hover:bg-red-50 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}

