export declare class PaginationUtil {
    static calculatePage(skip: number, limit: number): {
        skip: number;
        limit: number;
    };
    static buildMeta(total: number, page: number, limit: number): {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
