"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberUtil = void 0;
class NumberUtil {
    static formatCurrency(amount, currency = 'TND', locale = 'fr-TN') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }
    static formatNumber(value, decimals = 2) {
        return value.toFixed(decimals);
    }
    static roundToDecimals(value, decimals = 2) {
        const multiplier = Math.pow(10, decimals);
        return Math.round(value * multiplier) / multiplier;
    }
    static calculatePercentage(value, total) {
        if (total === 0)
            return 0;
        return Math.round((value / total) * 10000) / 100;
    }
}
exports.NumberUtil = NumberUtil;
//# sourceMappingURL=number.util.js.map