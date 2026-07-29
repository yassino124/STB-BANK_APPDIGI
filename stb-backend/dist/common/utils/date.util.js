"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtil = void 0;
class DateUtil {
    static now() {
        return new Date();
    }
    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    static addMonths(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }
    static startOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    static endOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
    static isExpired(date) {
        return date < new Date();
    }
    static formatCurrency(amount, currency = 'TND') {
        return new Intl.NumberFormat('fr-TN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
        }).format(amount);
    }
}
exports.DateUtil = DateUtil;
//# sourceMappingURL=date.util.js.map