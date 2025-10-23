import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { UserType } from 'src/common/enum/userType';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ user: Omit<User, 'password'>; accessToken: string }> {
        const { email, password, phone, user_type } = registerDto;

        // Check if user exists
        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('User already exists with this email');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
            phone,
            user_type: user_type || UserType.CUSTOMER,
        });

        const savedUser = await this.usersRepository.save(user);

        // Generate token
        const token = this.generateToken(savedUser);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = savedUser;

        return { user: userWithoutPassword as Omit<User, 'password'>, accessToken: token };
    }

    async login(loginDto: LoginDto): Promise<{ user: Omit<User, 'password'>; accessToken: string }> {
        const { email, password } = loginDto;

        // Find user
        const user = await this.usersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'user_type', 'is_active', 'is_verified']
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.is_active) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Generate token
        const token = this.generateToken(user);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword as Omit<User, 'password'>, accessToken: token };
    }

    private generateToken(user: User): string {
        const payload = {
            sub: user.id,
            email: user.email,
            user_type: user.user_type
        };

        return this.jwtService.sign(payload);
    }

    async validateUser(payload: any): Promise<User | any> {
        return this.usersRepository.findOne({
            where: { id: payload.sub }
        });
    }
}