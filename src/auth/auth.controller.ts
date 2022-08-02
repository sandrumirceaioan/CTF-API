import { Body, Controller, Get, HttpException, HttpStatus, Post, Request, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { Public } from '../common/decorators/public.decorators';
import { User } from '../users/users.schema';
import { AuthService } from './auth.service';
import { AuthGuard } from "@nestjs/passport";
import { authSwagger } from "../auth/auth.swagger";
import { isEmpty } from 'underscore';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {
    }

    @Public()
    @ApiBody(authSwagger.req.login_req)
    @ApiResponse(authSwagger.res.login_res)
    @Post('/login')
    async login(@Body() user: User) {
        if (!user || isEmpty(user)) throw new HttpException('Credentials missing', HttpStatus.BAD_REQUEST);
        if (!user.email) throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
        if (!user.password) throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
        return await this.authService.login(user);
    }

    // @ApiResponse(swaggerUsersDoc.res.user_get_only_res)
    // @ApiBody(swaggerUsersDoc.req.auth_reg_post_req)
    // @SetMetadata('roles', 'admin')
    // @ApiOperation(swaggerUsersDoc.req.onlyAdmin)
    // @UseGuards(AuthGuard('jwt'))
    // @ApiBearerAuth('JWT')
    // @Post('/reg')
    // async registere(
    //     @Body() user: User,
    //     @Request() req,
    // ) {
    //     return await this.operationsService.post_reg(user, req)
    // }

    // @SetMetadata('roles', 'admin')
    // @UseGuards(AuthGuard('jwt'))
    // @ApiBearerAuth('JWT')
    // @Get('/check-token')
    // async checkToken(
    //     @Request() req: any
    // ) {
    //     return await this.authService.getUserById(req.user.id)
    // }

    // @Public()
    // @Post('/login')
    // async login(@Body() body) {
    //     console.log('AUTH');
    //     if (!body || isEmpty(body)) throw new MessageCodeError('user:login:missingInformation');
    //     if (!body.email) throw new MessageCodeError('user:login:missingEmail');
    //     if (!body.password) throw new MessageCodeError('user:login:missingPassword');
    //     return await this.authService.sign(body);
    // }

    // @Public()
    // @Post('/register')
    // async register(@Body() user: User) {
    //     let added = await saveUser(user);
    //     if (!user || isEmpty(user)) throw new MessageCodeError('user:create:missingInformation');
    //     return {
    //         user: added,
    //         message: 'User registered!'
    //     }
    // }

    // @Get('/verify')
    // async verify(@Request() req) {
    //     if (req.user) return await findUserById(req.user._id);
    // }


}


