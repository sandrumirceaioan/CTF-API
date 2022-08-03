import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.schema';
import { SHA256 } from 'crypto-js';
import { LoginRequest, LoginResponse } from './auth.swagger';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async login(params: LoginRequest): Promise<LoginResponse> {
        let encriptedPassword = SHA256(params.password, (process.env as any).CRYPTO_KEY).toString();
        const user: User | any = await this.usersService.findOne({ email: params.email.toLowerCase(), password: encriptedPassword });
        if (!user) throw new UnauthorizedException('Invalid email or password');

        const payload = {
            id: user._id,
            role: user.role,
            email: user.email
        };
        const token = this.jwtService.sign(payload);
        return { token, user };
    }

    async register(user: User): Promise<User> {
        const exist = await this.usersService.findOne({ email: user.email }, { select: 'email' });
        if (exist && exist.email) throw new HttpException('Email already registered', HttpStatus.BAD_REQUEST);
        user.password = SHA256(user.password, (process.env as any).CRYPTO_KEY).toString();
        return this.usersService.save(user);
    }

    async verify(headers: any): Promise<any> {
        const token = headers.token ? headers.token : headers.authorization.split('Bearer')[1].trim();
        const valid = await this.jwtService.verify(token, (process.env as any).JWT_KEY);
        if (valid && valid.id) return await this.usersService.findById(valid.id);
        throw new HttpException('Could not verify request', HttpStatus.UNAUTHORIZED);
    }
}