


export class AuthError extends Error {
    status: number;
    
    constructor(status: number, message: string){
        super(message)
        this.status = status;
    }

    static UnauthorizedError(){
        return new AuthError(401, 'Пользователь не авторизован')
    }
    
    static Forbidden(message: string){
        return new AuthError(403, message)
    }

    static BadRequest(message: string){
        return new AuthError(400, message)
    }
}