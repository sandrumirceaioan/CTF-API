import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, SetMetadata, UseGuards, Header, Param, Head, Headers, Query, HttpCode } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiHeader, ApiParam, ApiBearerAuth, ApiHeaders, ApiQuery } from "@nestjs/swagger";

import { Public } from '../common/decorators/public.decorators';
import { AuthService } from './auth.service';

import { AuthGuard } from '@nestjs/passport';
import { Request } from "express";
import { authSwagger } from './types/swagger.types';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordInitRequest, ResetPasswordRequest } from './types/auth.types';
import { RtGuard } from '../common/guards/jwt-rt.guard';
import { GetCurrentUserId } from '../common/decorators/current-user-id.decorator';
import { AtGuard } from 'src/common/guards/jwt-at.guard';
import { GetCurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {
    }

    // LOCAL AUTH
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

    @Post('/logout')
    async logout(@Req() req: Request) {
        // JWT payload attached to req.user in 'jwt' strategy
        return await this.authService.logout(req.user['id']);
    }

    // used to bypass global AtGuard and run RtGuard
    @Public()
    @UseGuards(RtGuard)
    @Post('/local/refresh')
    @HttpCode(HttpStatus.OK)
    refreshTokens(
        @GetCurrentUserId() userId: string,
        @GetCurrentUser('refreshToken') refreshToken: string,
    ): Promise<LoginResponse> {
        console.log('TRY REFRESH TOKENS');
        console.log(userId, refreshToken)
        return this.authService.refreshTokens(userId, refreshToken);
    }

    // FACEBOOK AUTH
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

    // reset password init
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

    // reset password
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

    // // verify
    // @ApiBearerAuth('JWT')
    // @ApiHeader({
    //     name: 'Token',
    //     required: true,
    // })
    // @ApiResponse(authSwagger.verify.res)
    // @ApiOperation({
    //     summary: ' - verify token',
    //     description: '<b>NOTE</b>: When used from Swagger it uses the header <i>Token</i> provided below. When used from web app it uses the header <i>Authorization</i>.'
    // })
    // @Get('/verify')
    // async verify(
    //     @Headers() headers: any,
    // ) {
    //     return await this.authService.verify(headers);
    // }

}


