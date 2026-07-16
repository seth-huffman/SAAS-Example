import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';
interface AuthUser {
    userId: string;
    email: string;
    role: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(user: JwtRefreshPayload): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(user: AuthUser): Promise<void>;
    getMe(user: AuthUser): Promise<{
        id: string;
        email: string;
        role: import("../users/entities/user.entity").UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
export {};
