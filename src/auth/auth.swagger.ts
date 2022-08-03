import { ApiProperty } from "@nestjs/swagger";
import { User } from "../users/users.schema";

export class LoginRequest {
    @ApiProperty({ example: 'user@email.com' })
    email: string;

    @ApiProperty({ example: '12345' })
    password: string;
}

export class LoginResponse {
    @ApiProperty()
    user: User;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' })
    token: string;
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
    verify: {
        res: {
            type: User
        }
    }
}