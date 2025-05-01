import { AuthError } from "../error/AuthError"
import { DatabaseError } from "../error/DatabaseError"
import { IMyUser, MyUser, RefreshToken, Role, MyUserDto, UserRole, IUserVkInfo, ITokenVk } from "../models"
import {hashSync, compareSync} from 'bcrypt'
import { tokenService } from "./TokenService"
import { RequestError } from "../error/RequestError"
import { roleService } from "./RoleService"
import { Op } from "sequelize"
import { userRoleService } from "./UserRoleService"
import { basketService } from "./BasketService"
import { vkService } from "./VkService"

async function createResponse(user: IMyUser, roles: string[], basket: {id: number, count: number}[]){
    if(!user.id) throw RequestError.BadRequest('Нет id у user')
    const userDto = new MyUserDto(user, roles)
    const {access, refresh} = tokenService.createTokens(userDto)
    await tokenService.saveRefreshToken(user.id, refresh)
    const userRes = {
        name: user.name,
        phone: user.phone,
        roles,
        basket,
    }
    return {userRes, access, refresh}
}

class UserService {

    async create(name: string, hashPassword: string, phone: string, vk_id: string){
        return await MyUser.create({name, password: hashPassword, phone, vk_id}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async get(phone: string | null, id?: number){
        const userData = await MyUser.findOne({where: phone ? {phone} : {id}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        if(!userData) throw DatabaseError.NotFound('Пользователь не найден')
        return userData
    }

    async registration(phone: string, password: string, name: string){
        const candidate = await MyUser.findOne({where: {phone}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        if(candidate) throw AuthError.BadRequest('Пользователь уже зарегистрирован')
        const userRole = await Role.findOne({where: {role: 'user'}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        if(!userRole) throw DatabaseError.NotFound('роль user не найдена')
        const hashPassword = hashSync(password, 4)
        const userData = await this.create(name, hashPassword, phone, '')
        await userRoleService.create(userData.id, userRole.id) 
        return await createResponse(userData, ['user'], [])
    }

    async login(phone: string, password: string){
        const userData = await MyUser.findOne({where: {phone}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        if(!userData) throw DatabaseError.NotFound('Пользователь не найден')
        if(userData.vk_id || !userData.password) throw RequestError.BadRequest('Пожалуйста, используйте VK ID для входа')
        const isRightPass = compareSync(password, userData.password)
        if(!isRightPass) throw AuthError.BadRequest('Неверный пароль')
        const roles = await roleService.getUserRoles(userData.id)
        const basket = await basketService.getAllByUser(userData.id)
        return await createResponse(userData, roles.map(role => role.role), basket)
    }

    async vk_login(code: string, code_verifier: string, device_id: string, state: string){
        const tokenData = await vkService.tokenExchange(code, code_verifier, device_id, state)
        const {user: user_info} = await vkService.getUserInfo(tokenData.access_token)

        if(!user_info.phone) throw RequestError.BadRequest('Не указан номер телефона. Измените настройки доступа к телефону в вк или используйте стандартный вход.')
      
        let userData = await MyUser.findOne({where: {phone: user_info.phone}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        let roles = ['user'];
        let basket: {id: number, count: number}[] = []; 
        if(!userData){ 
            const userRole = await Role.findOne({where: {role: 'user'}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
            if(!userRole) throw DatabaseError.NotFound('роль user не найдена')
            userData = await this.create(user_info.first_name, '', user_info.phone, user_info.user_id)
            await userRoleService.create(userData.id, userRole.id) 
        }
        else{
            roles = (await roleService.getUserRoles(userData.id)).map(role => role.role)
            basket = await basketService.getAllByUser(userData.id)
        }
        return await createResponse(userData, roles, basket)

    }

    async refresh(refreshToken: string){
        const userDto = await tokenService.validateRefreshToken(refreshToken)
        if(!userDto) throw AuthError.UnauthorizedError()
        const tokenData = await RefreshToken.findOne({where: {token: refreshToken}}) 
        if(!tokenData) throw AuthError.UnauthorizedError()
        const userData = await this.get(null, tokenData.MyUserId)
        if(!userData) throw DatabaseError.NotFound(`user с ${tokenData.MyUserId} не найден`)
        const roles = await roleService.getUserRoles(userData.id)
        const basket = await basketService.getAllByUser(userData.id)
        return await createResponse(userData, roles.map(role => role.role), basket)
    }

    async getWithRoles(phone: string){
        const userData: any = await MyUser.findOne({
            where: {phone}, 
            include: [
                {
                    model: Role
                }
            ]
        }).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
        if(!userData) throw DatabaseError.NotFound('Пользователь не найден')
        const user: IMyUser & {Roles: Role[]} = userData;
        const roles = user.Roles.map(role => role.role)
        return {
            id: user.id || 0,
            phone: user.phone,
            name: user.name,
            roles: roles
        }
    }

    async getStartsWith(StartsWith: string){
        const users = await MyUser.findAll({
            attributes: ['name', 'phone'],
            where: {
                phone: {[Op.iLike]: StartsWith + '%'}
            }
        }).catch((e: Error ) => {throw DatabaseError.Conflict(e.message)})
        return users.map(user => ({name: user.name, phone: user.phone}))
    }

    async rolesUpdate(phone: string, roles: string[]){
        const verifiedRoles = roles.filter(role => (role !== 'admin' && role !== 'user'))
        const userOld = await this.getWithRoles(phone)
        if(!userOld) throw DatabaseError.NotFound('Пользователь не найден')
        await userRoleService.updateAll(userOld.id, userOld.roles, verifiedRoles)
    }

}

export const userService = new UserService()