import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PerformanceReviewsModule } from './performance-reviews/performance-reviews.module';
import { JobPostingsModule } from './job-postings/job-postings.module';
import { LinkedInModule } from './linkedin/linkedin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'hruser'),
        password: config.get('DB_PASSWORD', 'hrpassword'),
        database: config.get('DB_NAME', 'hrdb'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    UsersModule,
    EmployeesModule,
    DepartmentsModule,
    LeaveRequestsModule,
    DashboardModule,
    PerformanceReviewsModule,
    JobPostingsModule,
    LinkedInModule,
  ],
})
export class AppModule {}
