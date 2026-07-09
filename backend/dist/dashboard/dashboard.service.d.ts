import { Repository } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { LeaveRequest } from '../leave-requests/entities/leave-request.entity';
export declare class DashboardService {
    private empRepo;
    private deptRepo;
    private leaveRepo;
    constructor(empRepo: Repository<Employee>, deptRepo: Repository<Department>, leaveRepo: Repository<LeaveRequest>);
    getStats(): Promise<{
        headcount: number;
        totalDepartments: number;
        pendingLeaves: number;
        recentHires: Employee[];
        departmentBreakdown: {
            departmentId: any;
            departmentName: any;
            count: number;
        }[];
    }>;
}
