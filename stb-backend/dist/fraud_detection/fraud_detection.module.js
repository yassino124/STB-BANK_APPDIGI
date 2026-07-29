"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudDetectionModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const fraud_detection_schema_1 = require("./schemas/fraud-detection.schema");
const fraud_detections_service_1 = require("./fraud-detections.service");
const fraud_detections_controller_1 = require("./fraud-detections.controller");
let FraudDetectionModule = class FraudDetectionModule {
};
exports.FraudDetectionModule = FraudDetectionModule;
exports.FraudDetectionModule = FraudDetectionModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: fraud_detection_schema_1.FraudDetection.name, schema: fraud_detection_schema_1.FraudDetectionSchema }])],
        providers: [fraud_detections_service_1.FraudDetectionsService],
        controllers: [fraud_detections_controller_1.FraudDetectionsController],
        exports: [fraud_detections_service_1.FraudDetectionsService],
    })
], FraudDetectionModule);
//# sourceMappingURL=fraud_detection.module.js.map