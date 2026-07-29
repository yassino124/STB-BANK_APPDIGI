"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsenceModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const absence_schema_1 = require("./schemas/absence.schema");
const absence_service_1 = require("./absence.service");
const absence_controller_1 = require("./absence.controller");
const employees_module_1 = require("../employees/employees.module");
let AbsenceModule = class AbsenceModule {
};
exports.AbsenceModule = AbsenceModule;
exports.AbsenceModule = AbsenceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: absence_schema_1.Absence.name, schema: absence_schema_1.AbsenceSchema }]),
            employees_module_1.EmployeesModule,
        ],
        controllers: [absence_controller_1.AbsenceController],
        providers: [absence_service_1.AbsenceService],
        exports: [absence_service_1.AbsenceService],
    })
], AbsenceModule);
//# sourceMappingURL=absence.module.js.map