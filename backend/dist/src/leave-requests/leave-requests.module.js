"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const leave_request_entity_1 = require("./entities/leave-request.entity");
const employee_entity_1 = require("../employees/entities/employee.entity");
const leave_requests_service_1 = require("./leave-requests.service");
const leave_requests_controller_1 = require("./leave-requests.controller");
let LeaveRequestsModule = class LeaveRequestsModule {
};
exports.LeaveRequestsModule = LeaveRequestsModule;
exports.LeaveRequestsModule = LeaveRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([leave_request_entity_1.LeaveRequest, employee_entity_1.Employee])],
        providers: [leave_requests_service_1.LeaveRequestsService],
        controllers: [leave_requests_controller_1.LeaveRequestsController],
    })
], LeaveRequestsModule);
//# sourceMappingURL=leave-requests.module.js.map