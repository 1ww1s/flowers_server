import { NextFunction, Request, Response } from "express";
import { AuthError } from "../error/AuthError";
import { tokenService } from "../service/TokenService";
import { IMyUserDto } from "../models";


declare module 'express' {
  interface Request {
    myUser?: IMyUserDto;
  }
}

export function AuthMiddleware(req: Request, _: Response, next: NextFunction){
    const authorization = req.headers.authorization;
    console.log(authorization)
    if(!authorization) throw AuthError.UnauthorizedError()
      const token = authorization.split(' ')[1]
    if(!token) throw AuthError.UnauthorizedError()
      const user = tokenService.validateAccessToken(token)
    if(!user) throw AuthError.UnauthorizedError()
    req.myUser = user;
    next()
}