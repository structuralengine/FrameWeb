import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputElementsService {
  public element: any;

  constructor() {
    this.clear();
  }

  public clear(): void { 
    this.element = {};
  }
  
  public getElementColumns(typNo: number, index: number): any {

    let target: any = null;
    let result: any = null;

    // タイプ番号を探す
    if (!this.element[typNo]) {
      target = new Array();
    } else {
      target = this.element[typNo];
    }

    // 行を探す
    for (let i = 0; i < target.length; i++) {
      const tmp = target[i];
      if (tmp['id'].toString() === index.toString()) {
        result = tmp;
        break;
      }
    }

    // 対象行が無かった時に処理
    if (result == null) {
      result = { id: index, E: '', G: '', Xp: '', A: '', J: '', Iy: '', Iz: '' };
      target.push(result);
      this.element[typNo] = target;
    }

    return result;
  }

}
