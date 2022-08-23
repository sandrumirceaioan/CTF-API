import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.schema';
import { SHA256 } from 'crypto-js';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordInitRequest, ResetPasswordRequest } from './types/auth.types';
import { ConfigService } from '@nestjs/config';
import { SharedService } from 'src/common/modules/shared/shared.service';
import { hash, compareSync } from 'bcrypt';
import { Tokens } from './types/token.types';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private sharedService: SharedService
    ) { }

    // register
    async localRegister(body: RegisterRequest): Promise<RegisterResponse> {
        const exist = await this.usersService.findOne({ email: body.email }, { select: 'email' });
        if (exist && exist.email) throw new HttpException('Email already registered', HttpStatus.BAD_REQUEST);

        const newUser = await this.usersService.save({
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            birthDate: body.birthDate,
            gender: body.gender,
            role: body.role ? body.role : 'user',
            atHash: await this.hashData(body.password),
            status: true // TBD if we keep statuses
        });

        const tokens = await this.getTokens(newUser['_id'].toString(), newUser.role, newUser.email);
        await this.updateRtHash(newUser['_id'].toString(), tokens.refresh_token);
        return { tokens };
    }

    // login
    async localLogin(body: LoginRequest): Promise<LoginResponse> {
        const user = await this.usersService.findOne({ email: body.email });
        if (!user) throw new UnauthorizedException('User not found');
        const correctPassword = await compareSync(body.password, user.atHash);
        if (!correctPassword) throw new UnauthorizedException('Access denied');

        const tokens = await this.getTokens(user['_id'].toString(), user.role, user.email);
        await this.updateRtHash(user['_id'].toString(), tokens.refresh_token);
        return { user, tokens };
    }

    // logout
    async logout(userId: string) {
        await this.usersService.findOneAndUpdate({
            _id: userId,
            rtHash: { $ne: null }
        }, {
            rtHash: null
        });

        return;
    }

    // refresh
    async refreshTokens(userId: string, rt: string): Promise<LoginResponse> {
        console.log(userId, rt);
        const user = await this.usersService.findById(userId);
        if (!user || !user.rtHash) throw new UnauthorizedException('User not found');
        const rtMatches = await compareSync(rt, user.rtHash);
        if (!rtMatches) throw new UnauthorizedException('Refresh access denied');

        const tokens = await this.getTokens(user['_id'].toString(), user.role, user.email);
        await this.updateRtHash(user['_id'].toString(), tokens.refresh_token);
        return { user, tokens };
    }

    // update rtHash
    private async updateRtHash(userId: string, rt: string) {
        const hash = await this.hashData(rt);
        await this.usersService.findByIdAndUpdate(userId, { rtHash: hash });
    }

    // hash data with bcrypt
    private hashData(data: string): Promise<string> {
        return hash(data, 10);
    }

    // generate at and rt tokens
    private async getTokens(userId: string, userRole: string, userEmail: string): Promise<Tokens> {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync({
                id: userId,
                role: userRole,
                email: userEmail,
            }, {
                secret: this.configService.get<string>('AT_SECRET'),
                expiresIn: 60 // 15 minutes
            }),
            this.jwtService.signAsync({
                id: userId,
                role: userRole,
                email: userEmail,
            }, {
                secret: this.configService.get<string>('RT_SECRET'),
                expiresIn: 60 * 10 // 1 week
            })
        ]);
        return {
            access_token: at,
            refresh_token: rt
        }
    }

    // reset password
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
            await this.jwtService.verifyAsync(body.token, this.configService.get<any>('AT_SECRET')).then(async (valid) => {
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