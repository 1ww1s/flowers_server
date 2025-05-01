import { NextFunction, Request, Response } from "express";
import { AuthError } from "../error/AuthError";
import { DatabaseError } from "../error/DatabaseError";
import { MyUser, Role } from "../models";

type TRoles = 'admin' | 'moderator'

export function CheckRolesMiddleware(roles: TRoles[]){
    return async function(req: Request, res: Response, next: NextFunction){
        const user = req.myUser;
        if(!user) return next(AuthError.UnauthorizedError())
        const data: any = await MyUser.findOne({where: {phone: user.phone}, include: Role})
        const userData: MyUser & {Roles: Role[]} = data
        if(!userData) throw DatabaseError.NotFound('Пользователь не найден')
        const userRoles = userData.Roles.map(role => role.role)
        let thereIsAccess = false;
        userRoles.map(role => {
            if(roles.includes(role as TRoles)) thereIsAccess = true
        })
        if(!thereIsAccess) return next(AuthError.Forbidden('Нет прав'))
        next()
    }
}