export declare class DateUtil {
    static now(): Date;
    static addDays(date: Date, days: number): Date;
    static addMonths(date: Date, months: number): Date;
    static startOfMonth(date: Date): Date;
    static endOfMonth(date: Date): Date;
    static isExpired(date: Date): boolean;
    static formatCurrency(amount: number, currency?: string): string;
}
