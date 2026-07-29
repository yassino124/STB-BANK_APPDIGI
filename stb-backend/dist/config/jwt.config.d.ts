declare const _default: (() => {
    secret: string;
    accessExpiry: string;
    refreshExpiry: string;
    issuer: string;
    audience: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string;
    accessExpiry: string;
    refreshExpiry: string;
    issuer: string;
    audience: string;
}>;
export default _default;
