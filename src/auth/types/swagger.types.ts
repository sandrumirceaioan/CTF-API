import { User } from "src/users/users.schema";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordInitRequest, ResetPasswordRequest, ResetResponse } from "./auth.types";

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
            type: RegisterRequest,
        },
        res: {
            type: RegisterResponse
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