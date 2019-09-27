import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultFsecService {

  public fsec: any;

  constructor() {    
     this.clear();
  }

  public clear(): void {
    this.fsec = {};
  }

  public getFsecColumns(typNo: number, row: number): any {

    let target: any = null;
    let result: any = null;

    // タイプ番号を探す
    if (!this.fsec[typNo]) {
      target = new Array();
    } else {
      target = this.fsec[typNo];
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
      result = { row: row, m: '', n: '', l: '', fx: '', fy: '', fz: '', mx: '', my: '', mz: '' };
      target.push(result);
      this.fsec[typNo] = target;
    }

    return result;
  }

}
