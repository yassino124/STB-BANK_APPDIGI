"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const common_2 = require("@nestjs/common");
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    logger = new common_2.Logger(LoggingInterceptor_1.name);
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const { method, url, ip, headers } = req;
        const userAgent = headers['user-agent'] || 'unknown';
        const userId = req.user?._id || req.user?.sub || 'anonymous';
        this.logger.log(`Incoming Request: ${method} ${url} | User: ${userId} | IP: ${ip} | UA: ${userAgent}`);
        const now = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const responseTime = Date.now() - now;
                this.logger.log(`Response: ${method} ${url} | Status: ${context.switchToHttp().getResponse().statusCode} | Time: ${responseTime}ms`);
            },
            error: (error) => {
                this.logger.error(`Error: ${method} ${url} | Status: ${error.status || 500} | Message: ${error.message}`);
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map