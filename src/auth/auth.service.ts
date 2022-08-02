import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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
        const user: User = await this.usersService.findOne({ email: params.email.toLowerCase(), password: encriptedPassword });
        if (!user) throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
        
        const payload = {
            id: user._id,
            role: user.role,
            email: user.email
        };
        const token = this.jwtService.sign(payload);
        return { token, user };
    }

    async register(user: User): Promise<any> {
        user.password = SHA256(user.password, (process.env as any).CRYPTO_KEY).toString();
        return this.usersService.save(user);
    }
}