import { DatabaseError } from "../error/DatabaseError"
import { UserRole } from "../models"
import { roleService } from "./RoleService"

class UserRoleService {

    async create(MyUserId: number, RoleId: number){
        await UserRole.create({MyUserId, RoleId}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }
    
    async updateAll(MyUserId: number, oldRoles: string[], newRoles: string[]){
        const deleteRoles = oldRoles.filter(oldR => !newRoles.includes(oldR))
        const createRoles = newRoles.filter(newR => !oldRoles.includes(newR))
        await Promise.all(createRoles.map(async (role) => {
            const roleData = await roleService.get(role)
            if(!roleData) throw DatabaseError.NotFound(`Роль ${role} не найдена`)
            await this.create(MyUserId, roleData.id)
        }))
        await Promise.all(deleteRoles.map(async (role) => {
            const roleData = await roleService.get(role)
            if(!roleData) throw DatabaseError.NotFound(`Роль ${role} не найдена`)
            await UserRole.destroy({where: {MyUserId, RoleId: roleData.id}})
        }))
    }

}

export const userRoleService = new UserRoleService()