import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputFixNodeService {
  public fix_node: any;

  constructor() {
    this.clear();
  }

  public clear(): void { 
    this.fix_node = {};
  }
  
  public getFixNodeColumns(typNo: number, row: number): any {

    let target: any = null;
    let result: any = null;

    // タイプ番号を探す
    if (!this.fix_node[typNo]) {
      target = new Array();
    } else {
      target = this.fix_node[typNo];
    }

    // 行を探す
    for (let i = 0; i < target.length; i++) {
      const tmp = target[i];
      if (tmp['row'] === row) {
        result = tmp;
        break;
      }
    }

    // 対象行が無かった時に処理
    if (result == null) {
      result = { row: row, n: '', tx: '', ty: '', tz: '', rx: '', ry: '', rz: '' };
      target.push(result);
      this.fix_node[typNo] = target;
    }

    return result;
  }

}
