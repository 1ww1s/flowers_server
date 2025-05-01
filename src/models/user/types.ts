export interface IMyUser {
    id?: number;
    vk_id: string;
    name: string;
    phone: string;
    password: string;
}

export interface IMyUserAuth {
    phone: string;
    password: string;
}

export interface IMyUserDto{
    name: string;
    phone: string;
    roles: string[];
}

export class MyUserDto {
    name: string;
    phone: string;
    roles: string[];
    constructor(user: IMyUser, roles: string[]){
        this.name=user.name;
        this.phone=user.phone;
        this.roles=roles;
    }
}

export interface IUserVkInfo { // есть еще
    user_id: string;
    first_name: string;
    last_name: string;
    phone: string;
}


export interface ITokenVk {
    refresh_token: string;
    access_token: string;
    id_token: string;
    token_type: string;
    expires_in: number;
    user_id: number;
    state: string;
    scope: string;
    error?: string;
    error_description?: string;
}