import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class SharedService {

    constructor() { }

    public validateOptions(options) {
        return {
            limit: options && options.limit || null,
            skip: options && options.skip || 0,
            sort: options && options.sort || {},
            select: options && options.select || '',
            upsert: options && options.upsert || false,
            new: options && options.new || true
        }
    }

    checkParam(param) {
        if (!param) {
            throw new HttpException(`${param} is required`, HttpStatus.BAD_REQUEST)
        }
    }
    
}
