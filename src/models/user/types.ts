export interface IUser {
    id?: number;
    name: string;
    phone: string;
    password: string;
}

export interface IUserAuth {
    phone: string;
    password: string;
}

export interface IUserDto{
    name: string;
    phone: string;
    roles: string[];
}


export class UserDto {
    name: string;
    phone: string;
    roles: string[];
    constructor(user: IUser, roles: string[]){
        this.name=user.name;
        this.phone=user.phone;
        this.roles=roles;
    }
}