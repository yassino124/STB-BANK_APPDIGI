"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtil = void 0;
class StringUtil {
    static generateReference(prefix = 'STB') {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
    static generateOTP(length = 6) {
        return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length);
    }
    static maskCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        return cleaned.replace(/\d(?=\d{4})/g, '*');
    }
    static maskRib(rib) {
        if (rib.length <= 8)
            return rib;
        return `${rib.substring(0, 8)}****${rib.substring(rib.length - 4)}`;
    }
    static capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}
exports.StringUtil = StringUtil;
//# sourceMappingURL=string.util.js.map