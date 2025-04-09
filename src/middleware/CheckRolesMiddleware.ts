import { NextFunction, Request, Response } from "express";
import { AuthError } from "../error/AuthError";
import { IUser, Role, User } from "../models";
import { DatabaseError } from "../error/DatabaseError";

type TRoles = 'admin' | 'moderator'

export function CheckRolesMiddleware(roles: TRoles[]){
    return async function(req: Request, res: Response, next: NextFunction){
        const reqUser = req.body as Request & {user: IUser}
        const user = reqUser.user;
        if(!user) return next(AuthError.UnauthorizedError())
        const data: any = await User.findOne({where: {phone: user.phone}, include: Role})
        const userData: User & {Roles: Role[]} = data
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