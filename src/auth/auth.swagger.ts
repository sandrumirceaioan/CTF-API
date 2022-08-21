import { ApiProperty } from "@nestjs/swagger";
import { User } from "../users/users.schema";

export class LoginRequest {
    @ApiProperty({ example: 'user@email.com' })
    email: string;

    @ApiProperty({ example: '12345' })
    password: string;

    @ApiProperty({ example: 'true/false' })
    remember: boolean;
}

export class LoginResponse {
    @ApiProperty()
    user: User;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' })
    token: string;
}

export class ResetPasswordInitRequest {
    @ApiProperty({ example: 'user@email.com' })
    email: string;
}

export class ResetPasswordRequest {
    @ApiProperty({ example: '12345' })
    password: string;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' })
    token: string;
}

export class ResetResponse {
    @ApiProperty({ example: 200 })
    status: number;

    @ApiProperty({ example: 'example@domain.mailgun.org' })
    id: string;

    @ApiProperty({ example: 'Queued. Thank you.' })
    message: string;
}


export class AuthUser extends User {
    @ApiProperty()
    _id: string;
}

export const authSwagger = {
    login: {
        req: {
            type: LoginRequest,
        },
        res: {
            status: 200,
            type: LoginResponse,
        }
    },
    register: {
        req: {
            type: User,
        },
        res: {
            type: User
        }
    },
    resetinit: {
        req: {
            type: ResetPasswordInitRequest,
        },
        res: {
            status: 200,
            type: ResetResponse
        }
    },
    reset: {
        req: {
            type: ResetPasswordRequest,
        },
        res: {
            status: 200,
            type: Boolean
        }
    },
    verify: {
        res: {
            type: User
        }
    }
}