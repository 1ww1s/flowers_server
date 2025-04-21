import { NextFunction, Request, Response } from "express";
import { AuthError } from "../error/AuthError";
import { tokenService } from "../service/TokenService";
import { IUserDto } from "../models";


declare module 'express' {
  interface Request {
    user?: IUserDto;
  }
}

export function AuthMiddleware(req: Request, _: Response, next: NextFunction){
    const authorization = req.headers.authorization;
    if(!authorization) throw AuthError.UnauthorizedError()
      const token = authorization.split(' ')[1]
    if(!token) throw AuthError.UnauthorizedError()
      const user = tokenService.validateAccessToken(token)
    if(!user) throw AuthError.UnauthorizedError()
    req.user = user;
    next()
}