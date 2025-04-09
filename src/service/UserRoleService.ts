import { DatabaseError } from "../error/DatabaseError"
import { UserRole } from "../models"
import { roleService } from "./RoleService"

class UserRoleService {

    async create(UserId: number, RoleId: number){
        await UserRole.create({UserId, RoleId}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }
    
    async updateAll(UserId: number, oldRoles: string[], newRoles: string[]){
        const deleteRoles = oldRoles.filter(oldR => !newRoles.includes(oldR))
        const createRoles = newRoles.filter(newR => !oldRoles.includes(newR))
        await Promise.all(createRoles.map(async (role) => {
            const roleData = await roleService.get(role)
            if(!roleData) throw DatabaseError.NotFound(`Роль ${role} не найдена`)
            await this.create(UserId, roleData.id)
        }))
        await Promise.all(deleteRoles.map(async (role) => {
            const roleData = await roleService.get(role)
            if(!roleData) throw DatabaseError.NotFound(`Роль ${role} не найдена`)
            await UserRole.destroy({where: {UserId, RoleId: roleData.id}})
        }))
    }

}

export const userRoleService = new UserRoleService()