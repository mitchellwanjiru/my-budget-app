export function formatCurrency(amount: number, currency: string = 'Ksh'): string {
  const isNegative = amount < 0;
  const formatted = Math.abs(amount).toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}${currency} ${formatted}`;
}

export function formatDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return formatDate(dateStr);
}

export function formatMonthName(monthStr: string): string {
  try {
    const parts = monthStr.split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const date = new Date(year, month - 1, 1);
      return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    }
    return monthStr;
  } catch {
    return monthStr;
  }
}

export function getPreviousMonth(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  } catch {
    return monthStr;
  }
}

export function getNextMonth(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  } catch {
    return monthStr;
  }
}

