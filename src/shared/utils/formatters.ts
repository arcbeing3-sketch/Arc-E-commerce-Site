export function formatCurrency(amount: number, currency: string = 'PKR'): string {
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(amount || 0);

  return `${currency} ${formatted}`;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getStockStatusText(stock: number): { text: string; color: string; badge: string } {
  if (stock <= 0) {
    return {
      text: 'Out of Stock',
      color: 'text-rose-600',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }
  if (stock <= 5) {
    return {
      text: `Low Stock (${stock} left)`,
      color: 'text-amber-600',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  return {
    text: 'In Stock',
    color: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
}

export function getOrderStatusBadge(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'pending':
      return { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'confirmed':
      return { label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'processing':
      return { label: 'Processing', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'shipped':
      return { label: 'Shipped', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'delivered':
      return { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { label: status, bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200' };
  }
}
