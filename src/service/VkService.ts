import { RequestError } from "../error/RequestError";
import { ITokenVk, IUserVkInfo } from "../models";

class VkService {

    async tokenExchange(code: string, code_verifier: string, device_id: string, state: string){
        const response = await fetch('https://id.vk.com/oauth2/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.VK_CLIENT_ID || '',
                code,
                grant_type: 'authorization_code',
                code_verifier,
                device_id,
                redirect_uri: process.env.VK_CALLBACK || '',
                state
            }),
        });
        const tokenData: ITokenVk = await response.json();
        if(tokenData.error){
            throw RequestError.BadRequest(`error: ${tokenData.error}, description: ${tokenData.error_description}`)
        }
        return tokenData
    }

    async getUserInfo(access_token: string){
        const responseInfo = await fetch('https://id.vk.com/oauth2/user_info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.VK_CLIENT_ID || '',
                access_token: access_token,
            }),
        });
        const user_info: {user: IUserVkInfo} = await responseInfo.json();
        return user_info
    }
}

export const vkService = new VkService()