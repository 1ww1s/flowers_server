


export class DatabaseError extends Error {
    status

    constructor(status: number, message: string){
        super()
        this.message = message
        this.status = status
    }

    static Conflict(message: string){
        return new DatabaseError(409, message)
    }
    
    static NotFound(message: string){
        return new DatabaseError(404, message)
    }

}