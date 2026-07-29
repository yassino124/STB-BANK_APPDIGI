export class PaginationUtil {
  static calculatePage(skip: number, limit: number): { skip: number; limit: number } {
    const page = Math.max(1, Math.floor(skip / limit) + 1);
    return { skip: (page - 1) * limit, limit };
  }

  static buildMeta(total: number, page: number, limit: number) {
    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}
