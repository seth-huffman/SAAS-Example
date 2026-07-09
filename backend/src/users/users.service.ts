import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async onApplicationBootstrap() {
    const admins = [
      {
        email:    process.env.SEED_ADMIN_EMAIL    || 'seth@shiftcontrol.io',
        password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
        role:     UserRole.SUPER_ADMIN,
      },
      {
        email:    process.env.SEED_ADMIN2_EMAIL    || 'alex@shiftcontrol.io',
        password: process.env.SEED_ADMIN2_PASSWORD || 'Admin123!',
        role:     UserRole.SUPER_ADMIN,
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

  async findAll(): Promise<User[]> {
    return this.userRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      role: dto.role ?? UserRole.EMPLOYEE,
    });
    return this.userRepo.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (dto.email) user.email = dto.email;
    if (dto.role) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.password) user.passwordHash = await bcrypt.hash(dto.password, 10);
    return this.userRepo.save(user);
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    const hashed = token ? await bcrypt.hash(token, 10) : null;
    await this.userRepo.update(id, { refreshToken: hashed });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    user.isActive = false;
    await this.userRepo.save(user);
  }
}
