import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, SetMetadata, UseGuards, Header, Param, Head, Headers, Query, HttpCode } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiHeader, ApiParam, ApiBearerAuth, ApiHeaders, ApiQuery } from "@nestjs/swagger";

import { Public } from '../common/decorators/public.decorators';
import { AuthService } from './auth.service';

import { AuthGuard } from '@nestjs/passport';
import { Request } from "express";
import { authSwagger } from './types/swagger.types';
import { LoginRequest, RegisterRequest, RegisterResponse, ResetPasswordInitRequest, ResetPasswordRequest } from './types/auth.types';
import { AtGuard } from 'src/common/guards/jwt-at.guard';
import { RtGuard } from 'src/common/guards/jwt-rt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {
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

    // AUTH 2

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

    @Public() // used to bypass global AtGuard and run RtGuard
    @UseGuards(RtGuard)
    @Post('/refresh')
    async refreshTokens(@Req() req: Request) {
        // JWT payload attached to req.user in 'jwt-refresh' strategy
        return await this.authService.refreshTokens(req.user['id'], req.user['refreshToken']);
    }

}


