"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MongooseExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const mongodb_1 = require("mongodb");
const mongodb_2 = require("mongodb");
const mongoose_1 = require("mongoose");
let MongooseExceptionFilter = MongooseExceptionFilter_1 = class MongooseExceptionFilter {
    logger = new common_1.Logger(MongooseExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Database error';
        if (exception?.code === 11000) {
            statusCode = common_1.HttpStatus.CONFLICT;
            const keyPattern = exception.keyPattern || {};
            const keys = Object.keys(keyPattern).join(', ');
            message = `Duplicate value for field(s): ${keys}`;
        }
        else if (exception?.name === 'ValidationError') {
            statusCode = common_1.HttpStatus.BAD_REQUEST;
            message = exception.message;
        }
        else if (exception?.name === 'CastError') {
            statusCode = common_1.HttpStatus.BAD_REQUEST;
            message = `Invalid ${exception.path}: ${exception.value}`;
        }
        const errorResponse = {
            success: false,
            statusCode,
            message,
            error: exception?.name || 'MongooseError',
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        this.logger.error(`[DB ${statusCode}] ${request.url} -> ${message}`);
        response.status(statusCode).json(errorResponse);
    }
};
exports.MongooseExceptionFilter = MongooseExceptionFilter;
exports.MongooseExceptionFilter = MongooseExceptionFilter = MongooseExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(mongodb_1.MongoError, mongodb_2.MongoServerError, mongoose_1.MongooseError)
], MongooseExceptionFilter);
//# sourceMappingURL=mongoose-exception.filter.js.map