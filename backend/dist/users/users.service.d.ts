import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService implements OnApplicationBootstrap {
    private userRepo;
    constructor(userRepo: Repository<User>);
    onApplicationBootstrap(): Promise<void>;
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    create(dto: CreateUserDto): Promise<User>;
    update(id: string, dto: UpdateUserDto): Promise<User>;
    updateRefreshToken(id: string, token: string | null): Promise<void>;
    remove(id: string): Promise<void>;
}
