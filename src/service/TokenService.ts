import {sign, verify} from 'jsonwebtoken'
import { IUserDto, RefreshToken } from '../models'
import { DatabaseError } from '../error/DatabaseError'

const secretDefault = "GKRTYNDLTRSNGGMY"

class TokenService {

    createTokens(userDto: IUserDto){
        const access = sign({...userDto}, process.env.JWT_ACCESS_SECRET || secretDefault, {expiresIn: '1m'})
        const refresh = sign({...userDto}, process.env.JWT_REFRESH_SECRET || secretDefault, {expiresIn: '1d'})
        return {access, refresh}
    }   

    async saveRefreshToken(UserId: number, token: string){
        try{
            const tokenData = await RefreshToken.findOne({where: {UserId}})
            if(tokenData){
                return await RefreshToken.update({token}, {where: {UserId}})
            }
            else{
                return await RefreshToken.create({UserId, token})
            }
        }
        catch(e: any){
           throw DatabaseError.Conflict(e.message)
        }
    }

    validateAccessToken(token: string){
        try {   
            const user = verify(token, process.env.JWT_ACCESS_SECRET || '') as IUserDto | undefined
            return user
        }
        catch{
            return null
        }
    }

    async validateRefreshToken(token: string){
        try {   
            const user = verify(token, process.env.JWT_REFRESH_SECRET || '') as IUserDto | undefined
            return user
        }
        catch{
            return null
        }
    }

}

export const tokenService = new TokenService()