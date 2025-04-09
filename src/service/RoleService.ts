import { DatabaseError } from "../error/DatabaseError";
import { Role, UserRole } from "../models";


class RoleService {

    async create(role: string){
        return await Role.create({role}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async update(id: number, role: string){
        return await Role.update(
            {role}, {where: {id}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async get(role: string){
        return await Role.findOne(
            {where: {role}}
        ).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async getUserRoles(UserId: number){
        const userRoleData = await UserRole.findAll({where: {UserId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        const roles = await Promise.all(
            userRoleData.map(async userRole => {
                const role = await Role.findOne({where: {id: userRole.RoleId}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
                if(!role) throw DatabaseError.NotFound(`id (${userRole.RoleId}) роли не найден`)
                return role
            })
        )
        return roles
    }

    async getAll(){
        const roles = await Role.findAll().catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        return roles.map(role => role.role).filter(role => (role !== 'admin' && role !== 'user'))
    }
}

export const roleService = new RoleService()