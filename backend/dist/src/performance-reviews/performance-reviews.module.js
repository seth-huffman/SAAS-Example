"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceReviewsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const performance_review_entity_1 = require("./entities/performance-review.entity");
const employee_entity_1 = require("../employees/entities/employee.entity");
const performance_reviews_service_1 = require("./performance-reviews.service");
const performance_reviews_controller_1 = require("./performance-reviews.controller");
let PerformanceReviewsModule = class PerformanceReviewsModule {
};
exports.PerformanceReviewsModule = PerformanceReviewsModule;
exports.PerformanceReviewsModule = PerformanceReviewsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([performance_review_entity_1.PerformanceReview, employee_entity_1.Employee])],
        providers: [performance_reviews_service_1.PerformanceReviewsService],
        controllers: [performance_reviews_controller_1.PerformanceReviewsController],
        exports: [performance_reviews_service_1.PerformanceReviewsService],
    })
], PerformanceReviewsModule);
//# sourceMappingURL=performance-reviews.module.js.map