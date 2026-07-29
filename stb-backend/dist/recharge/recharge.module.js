"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RechargeModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const recharge_schema_1 = require("./schemas/recharge.schema");
const recharges_service_1 = require("./recharges.service");
const recharges_controller_1 = require("./recharges.controller");
let RechargeModule = class RechargeModule {
};
exports.RechargeModule = RechargeModule;
exports.RechargeModule = RechargeModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: recharge_schema_1.Recharge.name, schema: recharge_schema_1.RechargeSchema }])],
        providers: [recharges_service_1.RechargesService],
        controllers: [recharges_controller_1.RechargesController],
        exports: [recharges_service_1.RechargesService],
    })
], RechargeModule);
//# sourceMappingURL=recharge.module.js.map