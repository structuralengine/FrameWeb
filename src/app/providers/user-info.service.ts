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

  // 計算結果情報から ユーザーポイントを更新する
  public loadResultData(resultText: string): void {
    const jsonData: {} = JSON.parse(resultText);
    if ('new_points' in jsonData) {
      this.purchase_value = jsonData['new_points'];
    }
  }

}
