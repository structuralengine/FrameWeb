import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  isContentsDailogShow: boolean;
  loginUserName: string;
  loginPassword: string;
  user_id: number;
  purchase_value: number;
  loggedIn: boolean;
  active:boolean;

  constructor() { 
    this.clear();
  }

  clear(): void{
    this.loginUserName = '';
    this.loginPassword = '';
    this.user_id = -1;
    this.purchase_value = -1;
    this.loggedIn = false;
    this.active = false;
  }

  // 計算結果情報から ユーザーポイントを更新する
  public loadResultData(jsonData: object): void {
    if ('new_points' in jsonData) {
      this.purchase_value = jsonData['new_points'];
    }
  }
}
