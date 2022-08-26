import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, SetMetadata, UseGuards, Header, Param, Head, Headers, Query, HttpCode } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiHeader, ApiParam, ApiBearerAuth, ApiHeaders, ApiQuery, ApiHideProperty, ApiExcludeEndpoint } from "@nestjs/swagger";

import { Public } from '../common/decorators/public.decorators';
import { AuthService } from './auth.service';

import { AuthGuard } from '@nestjs/passport';
import { Request } from "express";
import { authSwagger } from './types/swagger.types';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordInitRequest, ResetPasswordRequest } from './types/auth.types';
import { JwtPayload } from './types/jwt-payload.types';
import { JwtService } from '@nestjs/jwt';
import { GetCurrentUserId } from 'src/common/decorators/current-user-id.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
        private jwtService: JwtService
    ) {
    }

    // *** LOCAL AUTH *** //

    // register
    @Public()
    @ApiBody(authSwagger.register.req)
    @ApiResponse(authSwagger.register.res)
    @ApiOperation({
        summary: ' - register user account'
    })
    @HttpCode(HttpStatus.CREATED)
    @Post('/local/register')
    async localRegister(@Body() body: RegisterRequest): Promise<RegisterResponse> {
        return await this.authService.localRegister(body);
    }

    // login
    @Public()
    @ApiBody(authSwagger.login.req)
    @ApiResponse(authSwagger.login.res)
    @ApiOperation({
        summary: ' - login user'
    })
    @HttpCode(HttpStatus.OK)
    @Post('/local/login')
    async localLogin(@Body() body: LoginRequest) {
        return await this.authService.localLogin(body);
    }

    @ApiOperation({
        summary: ' - logout user'
    })
    @Post('/local/logout')
    async logout(@GetCurrentUserId() userId: string) {
        return await this.authService.logout(userId);
    }

    // refresh
    @Public()
    // @ApiExcludeEndpoint()
    @ApiBody(authSwagger.refresh.req)
    @ApiResponse(authSwagger.refresh.res)
    @ApiOperation({
        summary: ' - refresh token'
    })
    @Post('/local/refresh')
    @HttpCode(HttpStatus.OK)
    refreshTokens(
        @Body() body: any,
    ): Promise<LoginResponse> {
        if (body.refreshToken) {
            return this.jwtService.verifyAsync(body.refreshToken, { secret: this.configService.get<any>('RT_SECRET') }).then((payload: JwtPayload) => {
                return this.authService.refreshTokens(payload.id, body.refreshToken);
            }).catch(error => {
                console.log('REFRESH ERROR: ', error.message);
                throw new HttpException('Refresh token expired', HttpStatus.BAD_REQUEST);
            });
        } else {
            throw new HttpException('Could not refresh tokens', HttpStatus.BAD_REQUEST);
        }
    }

    // verify
    @ApiBearerAuth('JWT')
    @ApiOperation({
        summary: ' - verify logged'
    })
    @Post('/local/verify')
    @HttpCode(HttpStatus.OK)
    verifyToken() {
        return true;
    }

    // reset init
    @Public()
    @ApiBody(authSwagger.resetinit.req)
    @ApiResponse(authSwagger.resetinit.res)
    @ApiOperation({
        summary: ' - reset password init'
    })
    @Post('/reset-password-init')
    async resetInit(
        @Body() body: ResetPasswordInitRequest
    ) {
        return await this.authService.resetPasswordInit(body);
    }

    // reset complete
    @Public()
    @ApiBody(authSwagger.reset.req)
    @ApiResponse(authSwagger.reset.res)
    @ApiOperation({
        summary: ' - reset password'
    })
    @Post('/reset-password')
    async reset(
        @Body() body: ResetPasswordRequest
    ) {
        return await this.authService.resetPassword(body);
    }

    
    // *** LOCAL AUTH *** //

    // init facebook login
    @Public()
    @Get('/facebook')
    @UseGuards(AuthGuard("facebook"))
    async facebookLogin(): Promise<any> {
        return HttpStatus.OK;
    }

    // postback facebook login
    @Public()
    @Get('/facebook/redirect')
    @UseGuards(AuthGuard('facebook'))
    async facebookLoginRedirect(@Req() req: Request): Promise<any> {
        return {
            statusCode: HttpStatus.OK,
            data: req.user,
        };
    }

}


