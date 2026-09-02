import React from 'react';
import { PlusCircle, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onAddProduct?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onAddProduct,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="bg-white border-b border-zinc-200 px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            ARC Private Control Panel
          </span>
          <span className="text-zinc-300">&bull;</span>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Firestore Sync Active
          </span>
        </div>
        <h1 className="text-2xl font-black text-zinc-900 mt-0.5">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}

        {onAddProduct && (
          <button
            onClick={onAddProduct}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Product</span>
          </button>
        )}
      </div>
    </header>
  );
};
