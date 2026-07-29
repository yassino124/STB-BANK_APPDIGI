"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationUtil = void 0;
class PaginationUtil {
    static calculatePage(skip, limit) {
        const page = Math.max(1, Math.floor(skip / limit) + 1);
        return { skip: (page - 1) * limit, limit };
    }
    static buildMeta(total, page, limit) {
        return {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        };
    }
}
exports.PaginationUtil = PaginationUtil;
//# sourceMappingURL=pagination.util.js.map