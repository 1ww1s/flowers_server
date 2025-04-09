import { NextFunction, Request, Response } from "express";
import { RequestError } from "../error/RequestError";
import { DatabaseError } from "../error/DatabaseError";
import { AuthError } from "../error/AuthError";



export function ErrorMiddleware(err: Error, req: Request, res: Response, next: NextFunction){

    if(err instanceof RequestError){
        res.status(err.status).json({message: err.message})
        return
    }

    if(err instanceof DatabaseError){
        res.status(err.status).json({message: err.message})
        return
    }

    if(err instanceof AuthError){
        res.status(err.status).json({message: err.message})
        return
    }

    console.log(err)
    res.status(500).json({message: 'Непредвиденная ошибка'})
}