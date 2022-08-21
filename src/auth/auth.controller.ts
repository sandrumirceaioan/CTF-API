import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, SetMetadata, UseGuards, Header, Param, Head, Headers, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiHeader, ApiParam, ApiBearerAuth, ApiHeaders, ApiQuery } from "@nestjs/swagger";

import { Public } from '../common/decorators/public.decorators';
import { User } from '../users/users.schema';
import { AuthService } from './auth.service';
import { authSwagger, LoginRequest, ResetPasswordInitRequest, ResetPasswordRequest } from "../auth/auth.swagger";
import { isEmpty } from 'underscore';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Request } from "express";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {
    }

    // login
    @Public()
    @ApiBody(authSwagger.login.req)
    @ApiResponse(authSwagger.login.res)
    @ApiOperation({
        summary: ' - login user',
        description: '<b>NOTE</b>: Email and password are required.'
    })
    @Post('/login')
    async login(
        @Body() credentials: LoginRequest
    ) {
        if (!credentials || isEmpty(credentials)) throw new HttpException('Credentials missing', HttpStatus.BAD_REQUEST);
        if (!credentials.email) throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
        if (!credentials.password) throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
        return await this.authService.login(credentials);
    }

    // register
    @Public()
    @ApiBody(authSwagger.register.req)
    @ApiResponse(authSwagger.register.res)
    @ApiOperation({
        summary: ' - register account',
        description: '<b>NOTE</b>: Let\'s discuss which roles can use this route.'
    })
    @Post('/register')
    async register(
        @Body() user: User
    ) {
        return await this.authService.register(user);
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

    // verify
    @ApiBearerAuth('JWT')
    @ApiHeader({
        name: 'Token',
        required: true,
    })
    @ApiResponse(authSwagger.verify.res)
    @ApiOperation({
        summary: ' - verify token',
        description: '<b>NOTE</b>: When used from Swagger it uses the header <i>Token</i> provided below. When used from web app it uses the header <i>Authorization</i>.'
    })
    @Get('/verify')
    async verify(
        @Headers() headers: any,
    ) {
        return await this.authService.verify(headers);
    }

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


