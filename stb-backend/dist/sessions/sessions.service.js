"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const session_schema_1 = require("./session.schema");
let SessionsService = class SessionsService {
    sessionModel;
    constructor(sessionModel) {
        this.sessionModel = sessionModel;
    }
    async getMySessions(employeeId) {
        return this.sessionModel
            .find({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            isRevoked: false,
            refreshTokenExpiresAt: { $gt: new Date() },
        })
            .populate('deviceId', 'deviceName platform model')
            .sort({ createdAt: -1 })
            .select('-accessToken -refreshToken')
            .exec();
    }
    async revokeSession(employeeId, sessionId) {
        await this.sessionModel.updateOne({ _id: sessionId, employeeId: new mongoose_2.Types.ObjectId(employeeId) }, { isRevoked: true, revokedAt: new Date() });
        return { message: 'Session déconnectée avec succès.' };
    }
    async revokeAllSessions(employeeId, exceptToken) {
        const query = {
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            isRevoked: false,
        };
        if (exceptToken) {
            query.accessToken = { $ne: exceptToken };
        }
        const result = await this.sessionModel.updateMany(query, {
            isRevoked: true,
            revokedAt: new Date(),
        });
        return {
            message: 'Toutes les sessions ont été déconnectées.',
            count: result.modifiedCount,
        };
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(session_schema_1.Session.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map