"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskAlertsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const risk_alert_schema_1 = require("./schemas/risk-alert.schema");
const risk_alerts_service_1 = require("./risk-alerts.service");
const risk_alerts_controller_1 = require("./risk-alerts.controller");
let RiskAlertsModule = class RiskAlertsModule {
};
exports.RiskAlertsModule = RiskAlertsModule;
exports.RiskAlertsModule = RiskAlertsModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: risk_alert_schema_1.RiskAlert.name, schema: risk_alert_schema_1.RiskAlertSchema }])],
        providers: [risk_alerts_service_1.RiskAlertsService],
        controllers: [risk_alerts_controller_1.RiskAlertsController],
        exports: [risk_alerts_service_1.RiskAlertsService],
    })
], RiskAlertsModule);
//# sourceMappingURL=risk_alerts.module.js.map