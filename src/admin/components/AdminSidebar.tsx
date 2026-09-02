import React from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  ShoppingBag,
  Boxes,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { useAdminAuth } from '../../shared/context/AdminAuthContext';

interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingOrdersCount = 0,
  lowStockCount = 0,
}) => {
  const { adminUser, adminProfile, adminLogout } = useAdminAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'All Products', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: PlusCircle },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-zinc-950 text-zinc-300 flex flex-col shrink-0 border-r border-zinc-800 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white text-zinc-950 font-black text-sm flex items-center justify-center shadow-sm">
            A
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-wider">ARC</span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium">Single-Vendor Control Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-3 py-2">
          Store Operations
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <p className="text-xs font-bold text-white truncate">
                {adminProfile?.displayName || 'ARC Owner'}
              </p>
            </div>
            <p className="text-[10px] text-zinc-500 truncate">{adminUser?.email || 'arcbeing3@gmail.com'}</p>
          </div>
          <button
            onClick={adminLogout}
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
            title="Sign Out of Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
