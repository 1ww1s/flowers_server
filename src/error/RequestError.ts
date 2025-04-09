
interface IRequestError {
    status: number;
    message: string;
}


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


}