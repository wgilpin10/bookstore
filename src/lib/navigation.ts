import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Books", href: "/books", icon: BookOpen },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3, badge: "Soon" },
  { label: "Settings", href: "/settings", icon: Settings, badge: "Soon" },
];
