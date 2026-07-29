export class NumberUtil {
  static formatCurrency(amount: number, currency: string = 'TND', locale: string = 'fr-TN'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  static formatNumber(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }

  static roundToDecimals(value: number, decimals: number = 2): number {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }

  static calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 10000) / 100;
  }
}
