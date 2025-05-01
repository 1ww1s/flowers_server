

export class RequestError extends Error {
    status
    constructor(status: number, message: string){
        super()
        this.message = message
        this.status = status
    }

    static BadRequest(message: string){
        return new RequestError(400, message)
    }

    static Timeout(message?: string){
        return new RequestError(408, message || 'Истекло время ожидания')
    }
}