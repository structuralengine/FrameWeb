import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputMembersService {
  public member: any[];

  constructor() {
    this.clear();
  }

  public clear(): void {
    this.member = new Array();
  }
  
  public getMemberColumns(index: number): any {

    let result: any = null;
    for (let i = 0; i < this.member.length; i++) {
      const tmp = this.member[i];
      if (tmp['id'].toString() === index.toString()) {
        result = tmp;
        break;
      }
    }
    // 対象データが無かった時に処理
    if (result == null) {
      result = { id: index, L: '', ni: '', nj: '', e: '', cg: '' };
      this.member.push(result);
    }
    return result;
  }

}
