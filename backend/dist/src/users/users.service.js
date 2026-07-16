"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async onApplicationBootstrap() {
        const admins = [
            {
                email: process.env.SEED_ADMIN_EMAIL || 'seth@shiftcontrol.io',
                password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
                role: user_entity_1.UserRole.SUPER_ADMIN,
            },
            {
                email: process.env.SEED_ADMIN2_EMAIL || 'alex@shiftcontrol.io',
                password: process.env.SEED_ADMIN2_PASSWORD || 'Admin123!',
                role: user_entity_1.UserRole.SUPER_ADMIN,
            },
        ];
        for (const admin of admins) {
            const existing = await this.userRepo.findOne({ where: { email: admin.email } });
            if (!existing) {
                const passwordHash = await bcrypt.hash(admin.password, 10);
                await this.userRepo.save({ email: admin.email, passwordHash, role: admin.role, isActive: true });
                console.log(`Seeded admin: ${admin.email}`);
            }
        }
    }
    async findAll() {
        return this.userRepo.find({ order: { createdAt: 'DESC' } });
    }
    async findById(id) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async findByEmail(email) {
        return this.userRepo.findOne({ where: { email } });
    }
    async create(dto) {
        const existing = await this.findByEmail(dto.email);
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({
            email: dto.email,
            passwordHash,
            role: dto.role ?? user_entity_1.UserRole.EMPLOYEE,
        });
        return this.userRepo.save(user);
    }
    async update(id, dto) {
        const user = await this.findById(id);
        if (dto.email)
            user.email = dto.email;
        if (dto.role)
            user.role = dto.role;
        if (dto.isActive !== undefined)
            user.isActive = dto.isActive;
        if (dto.password)
            user.passwordHash = await bcrypt.hash(dto.password, 10);
        return this.userRepo.save(user);
    }
    async updateRefreshToken(id, token) {
        const hashed = token ? await bcrypt.hash(token, 10) : null;
        await this.userRepo.update(id, { refreshToken: hashed });
    }
    async remove(id) {
        const user = await this.findById(id);
        user.isActive = false;
        await this.userRepo.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map