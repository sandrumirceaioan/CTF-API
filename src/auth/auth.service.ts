import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.schema';
import { SHA256 } from 'crypto-js';
import { LoginRequest, LoginResponse, ResetPasswordInitRequest, ResetPasswordRequest } from './auth.swagger';
import { ConfigService } from '@nestjs/config';
import { SharedService } from 'src/common/modules/shared/shared.service';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private sharedService: SharedService
    ) { }

    async login(credentials: LoginRequest): Promise<LoginResponse> {
        let encriptedPassword = SHA256(credentials.password, (process.env as any).CRYPTO_KEY).toString();
        const user: User | any = await this.usersService.findOne({ email: credentials.email.toLowerCase(), password: encriptedPassword });
        if (!user) throw new UnauthorizedException('Invalid email or password');

        const payload = {
            id: user._id,
            role: user.role,
            email: user.email
        };
        const token = this.jwtService.sign(payload, { expiresIn: credentials.remember ? '30d' : this.configService.get<string>('JWT_EXPIRES') });
        return { token, user };
    }

    async register(user: User): Promise<User> {
        const exist = await this.usersService.findOne({ email: user.email }, { select: 'email' });
        if (exist && exist.email) throw new HttpException('Email already registered', HttpStatus.BAD_REQUEST);
        user.password = SHA256(user.password, this.configService.get('CRYPTO_KEY')).toString();
        if(!user.role) user.role = 'user'; 
        return this.usersService.save(user);
    }

    async verify(headers: any): Promise<any> {
        const token = headers.token ? headers.token : headers.authorization.split('Bearer')[1].trim();
        const valid = await this.jwtService.verify(token, this.configService.get<any>('JWT_KEY'));
        if (valid && valid.id) return await this.usersService.findById(valid.id);
        throw new HttpException('Could not verify request', HttpStatus.UNAUTHORIZED);
    }

    async resetPasswordInit(body: ResetPasswordInitRequest) {
        console.log(body);
        let user: User | any = await this.usersService.findOne({ email: body.email }, { select: '_id email' });
        console.log(user);
        if (user && user._id && user.email) {
            const payload = {
                id: user._id,
                email: user.email
            };

            const token = await this.jwtService.signAsync(payload, { expiresIn: '5m' });
            console.log(token);

            if (!token) throw new HttpException('Could not generate reset token', HttpStatus.INTERNAL_SERVER_ERROR);

            try {
                const mailer = await this.sharedService.sendMail(user.email, token);
                if (mailer) return mailer;
            } catch (error) {
                console.log(error);
                throw new HttpException('Could not send reset password email', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            throw new HttpException('There is no account registered with this email', HttpStatus.BAD_REQUEST);
        }
    }

    async resetPassword(body: ResetPasswordRequest): Promise<any> {
        return new Promise(async (resolve, reject) => {
            await this.jwtService.verifyAsync(body.token, this.configService.get<any>('JWT_KEY')).then(async (valid) => {
                if (valid) {
                    let newPassword = SHA256(body.password, this.configService.get('CRYPTO_KEY')).toString();
                    const updated = await this.usersService.findByIdAndUpdate(valid.id, { password: newPassword }, { new: true });
                    if (updated) {
                        console.log('User password updated');
                        // TODO - find a way to destroy a JWT token
                    } else {
                        console.log('User password NOT updated');
                    }
                    resolve(true);
                }
            }).catch(error => {
                reject(new Error('Token invalid'));
            });
        });
    }
}