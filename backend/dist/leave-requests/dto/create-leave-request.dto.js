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
exports.CreateLeaveRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const leave_request_entity_1 = require("../entities/leave-request.entity");
class CreateLeaveRequestDto {
    employeeId;
    leaveType;
    startDate;
    endDate;
    reason;
    isHalfDay;
    halfDayPeriod;
}
exports.CreateLeaveRequestDto = CreateLeaveRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Defaults to the requesting employee\'s own record' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLeaveRequestDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: leave_request_entity_1.LeaveType }),
    (0, class_validator_1.IsEnum)(leave_request_entity_1.LeaveType),
    __metadata("design:type", String)
], CreateLeaveRequestDto.prototype, "leaveType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLeaveRequestDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-05' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLeaveRequestDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeaveRequestDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateLeaveRequestDto.prototype, "isHalfDay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: leave_request_entity_1.HalfDayPeriod }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(leave_request_entity_1.HalfDayPeriod),
    __metadata("design:type", String)
], CreateLeaveRequestDto.prototype, "halfDayPeriod", void 0);
//# sourceMappingURL=create-leave-request.dto.js.map