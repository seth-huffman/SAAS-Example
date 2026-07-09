export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    HR_MANAGER = "hr_manager",
    EMPLOYEE = "employee"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    refreshToken: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
