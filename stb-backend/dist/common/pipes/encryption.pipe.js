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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionPipe = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const encryption_util_1 = require("../utils/encryption.util");
let EncryptionPipe = class EncryptionPipe {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    transform(value, metadata) {
        if (typeof value === 'string') {
            try {
                return encryption_util_1.EncryptionUtil.encrypt(value, this.configService.get('ENCRYPTION_KEY', ''));
            }
            catch {
                throw new common_1.BadRequestException(`Failed to encrypt value for ${metadata.data}`);
            }
        }
        return value;
    }
};
exports.EncryptionPipe = EncryptionPipe;
exports.EncryptionPipe = EncryptionPipe = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EncryptionPipe);
//# sourceMappingURL=encryption.pipe.js.map