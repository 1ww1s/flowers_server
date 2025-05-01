import {sign, verify} from 'jsonwebtoken'
import { IMyUserDto, RefreshToken } from '../models'
import { DatabaseError } from '../error/DatabaseError'

const secretDefault = "GKRTYNDLTRSNGGMY"

class TokenService {

    createTokens(userDto: IMyUserDto){
        const access = sign({...userDto}, process.env.JWT_ACCESS_SECRET || secretDefault, {expiresIn: '5m'})
        const refresh = sign({...userDto}, process.env.JWT_REFRESH_SECRET || secretDefault, {expiresIn: '1d'})
        return {access, refresh}
    }   

    async removeToken(token: string){
        await RefreshToken.destroy({where: {token}}).catch((e: Error) => {throw DatabaseError.Conflict(e.message)})
    }

    async saveRefreshToken(MyUserId: number, token: string){
        try{
            const tokenData = await RefreshToken.findOne({where: {MyUserId}})
            if(tokenData){
                return await RefreshToken.update({token}, {where: {MyUserId}})
            }
            else{
                return await RefreshToken.create({MyUserId, token})
            }
        }
        catch(e: any){
           throw DatabaseError.Conflict(e.message)
        }
    }

    validateAccessToken(token: string){
        try {   
            const user = verify(token, process.env.JWT_ACCESS_SECRET || '') as IMyUserDto | undefined
            return user
        }
        catch{
            return null
        }
    }

    async validateRefreshToken(token: string){
        try {   
            const user = verify(token, process.env.JWT_REFRESH_SECRET || '') as IMyUserDto | undefined
            return user
        }
        catch{
            return null
        }
    }

}

export const tokenService = new TokenService()