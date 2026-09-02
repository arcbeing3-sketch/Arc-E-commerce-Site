import React, { useState, useMemo } from 'react';
import { UserProfile } from '../../shared/types';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import { Search, Users, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';

interface AdminCustomersPageProps {
  customers: UserProfile[];
}

export const AdminCustomersPage: React.FC<AdminCustomersPageProps> = ({ customers }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = c.displayName?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone;
    });
  }, [customers, searchQuery]);

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">ARC Customer Directory</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Verified registered customers who have placed orders or created accounts.
          </p>
        </div>

        <div className="relative sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-6">Customer Name</th>
                <th className="py-4 px-4">Contact Info</th>
                <th className="py-4 px-4">Account Created</th>
                <th className="py-4 px-4">Orders Count</th>
                <th className="py-4 px-6 text-right">Lifetime Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-zinc-500">
                    No customer accounts found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.uid} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                          {c.displayName ? c.displayName[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{c.displayName || 'Customer'}</p>
                          <span className="text-[10px] text-zinc-400 font-mono">UID: {c.uid.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-zinc-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="text-zinc-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-zinc-500">{formatDate(c.createdAt)}</td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-lg">
                        {c.totalOrders || 0} Orders
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right font-black text-zinc-900 text-sm">
                      {formatCurrency(c.totalSpent || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
