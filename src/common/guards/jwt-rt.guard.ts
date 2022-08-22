import {ExecutionContext, HttpException, HttpStatus, Injectable,} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class RtGuard extends AuthGuard('jwt-refresh') {
    constructor(
        private reflector: Reflector
    ) {
        super();
    }
}