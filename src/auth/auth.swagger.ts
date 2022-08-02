import { ApiProperty } from "@nestjs/swagger";
import { User } from "../users/users.schema";

export class LoginRequest {
    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;
}

export class LoginResponse {
    @ApiProperty()
    user: User;

    @ApiProperty()
    token: string;
}

export class AuthUser extends User {
    @ApiProperty()
    _id: string;
}

export const authSwagger = {
    req: {
        login_req: {
            type: LoginRequest,
        },
    },
    res: {
        login_res: {
            status: 200,
            type: LoginResponse,
        },
    }
}