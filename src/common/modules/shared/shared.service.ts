import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Mailgun = require('mailgun.js');
const formData = require('form-data');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require("path");


@Injectable()
export class SharedService {
    private mailGun: any;

    constructor(
        private configService: ConfigService
    ) {
        this.mailGun = {
            key: this.configService.get('MAILGUN_API_KEY'),
            domain: this.configService.get('MAILGUN_DOMAIN'),
            sender: `mailgun@${this.configService.get('MAILGUN_DOMAIN')}`
        }

    }

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

    public async sendMail(recipient, token): Promise<any> {
        console.log('MAILGUN: ', this.mailGun);
        console.log('RECIPIENT: ', recipient);
        console.log('TOKEN: ', token);

        const source = fs.readFileSync(path.resolve(__dirname, '../../../assets/templates/reset-password.template.hbs'), 'utf8');
        const template = Handlebars.compile(source);
        const resetTemplate = template({
            "logoImg": `${this.configService.get('API_URL')}/ctf-logo-white-medium.png`,
            "resetUrl": `${this.configService.get('APP_URL')}/reset/${token}`,
        });

        const mailgun = new Mailgun(formData);
        const client = mailgun.client({ username: 'api', key: this.mailGun.key, url: `https://api.mailgun.net` });

        
        const messageData = {
            from: `CTF APP ${this.mailGun.sender}`,
            to: `${recipient}`,
            subject: "Reset password",
            text: "Use generated token below to reset your password",
            html: resetTemplate
        };

        return client.messages.create(this.mailGun.domain, messageData);
    }

    // function to encode file data to base64 encoded string
    public async base64_encode(file) {
        // read binary data
        return fs.readFileSync(path.resolve(__dirname, file), 'base64');
    }

}
