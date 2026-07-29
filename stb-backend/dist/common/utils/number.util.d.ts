export declare class NumberUtil {
    static formatCurrency(amount: number, currency?: string, locale?: string): string;
    static formatNumber(value: number, decimals?: number): string;
    static roundToDecimals(value: number, decimals?: number): number;
    static calculatePercentage(value: number, total: number): number;
}
