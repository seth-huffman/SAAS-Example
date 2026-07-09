"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const employees_module_1 = require("./employees/employees.module");
const departments_module_1 = require("./departments/departments.module");
const leave_requests_module_1 = require("./leave-requests/leave-requests.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const performance_reviews_module_1 = require("./performance-reviews/performance-reviews.module");
const job_postings_module_1 = require("./job-postings/job-postings.module");
const linkedin_module_1 = require("./linkedin/linkedin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST', 'localhost'),
                    port: config.get('DB_PORT', 5432),
                    username: config.get('DB_USER', 'hruser'),
                    password: config.get('DB_PASSWORD', 'hrpassword'),
                    database: config.get('DB_NAME', 'hrdb'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: config.get('NODE_ENV') !== 'production',
                    logging: config.get('NODE_ENV') === 'development',
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            employees_module_1.EmployeesModule,
            departments_module_1.DepartmentsModule,
            leave_requests_module_1.LeaveRequestsModule,
            dashboard_module_1.DashboardModule,
            performance_reviews_module_1.PerformanceReviewsModule,
            job_postings_module_1.JobPostingsModule,
            linkedin_module_1.LinkedInModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map