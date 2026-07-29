"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortUtil = void 0;
class SortUtil {
    static buildSort(sortDto) {
        if (!sortDto || !sortDto.sortBy) {
            return { createdAt: -1 };
        }
        const sortOrder = sortDto.sortOrder === 'asc' ? 1 : -1;
        return { [sortDto.sortBy]: sortOrder };
    }
}
exports.SortUtil = SortUtil;
//# sourceMappingURL=sort.util.js.map