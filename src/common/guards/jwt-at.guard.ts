import {ExecutionContext, HttpException, HttpStatus, Injectable,} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class AtGuard extends AuthGuard('jwt') {
    constructor(
        private reflector: Reflector
    ) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // public decorator which will skip JwtAuthGuard
        const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());

        if (isPublic) return true;

        // call canActivate() from inherited method
        return super.canActivate(context);
    }
}