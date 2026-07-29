"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmicaleModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const amicale_controller_1 = require("./amicale.controller");
const amicale_service_1 = require("./amicale.service");
const amicale_schema_1 = require("./amicale.schema");
let AmicaleModule = class AmicaleModule {
};
exports.AmicaleModule = AmicaleModule;
exports.AmicaleModule = AmicaleModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: amicale_schema_1.AmicaleOffer.name, schema: amicale_schema_1.AmicaleOfferSchema }])],
        controllers: [amicale_controller_1.AmicaleController],
        providers: [amicale_service_1.AmicaleService],
    })
], AmicaleModule);
//# sourceMappingURL=amicale.module.js.map