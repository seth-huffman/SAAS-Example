import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(): Promise<{
        headcount: number;
        totalDepartments: number;
        pendingLeaves: number;
        recentHires: import("../employees/entities/employee.entity").Employee[];
        departmentBreakdown: {
            departmentId: any;
            departmentName: any;
            count: number;
        }[];
    }>;
}
