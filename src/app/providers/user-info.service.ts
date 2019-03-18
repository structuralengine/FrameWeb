import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  loginUserName: string;
  loginPassword: string;
  user_id: number;
  purchase_value: number;
  loggedIn: boolean;

  constructor() { 
    this.clear();
  }

  clear(): void{
    this.loginUserName = '';
    this.loginPassword = '';
    this.user_id = -1;
    this.purchase_value = -1;
    this.loggedIn = false;
  }
}
