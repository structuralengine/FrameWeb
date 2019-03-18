import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultDataService {

  public disg: any;
  public DISG_ROWS_COUNT: number;
  public reac: any;
  public REAC_ROWS_COUNT: number;
  public fsec: any;
  public FSEC_ROWS_COUNT: number;
  
  constructor() {
    this.clear();
  }

  public clear(): void {
    this.disg = {};
    this.reac = {};
    this.fsec = {};
  }


  public getDisgColumns(typNo: number, index: number): any {

    let target: any = null;

    // タイプ番号を探す
    if (!this.disg[typNo]) {
      target = new Array();
    } else {
      target = this.disg[typNo];
    }
    let result = target[index];
    return result;
  }

  public getReacColumns(typNo: number, index: number): any {

    let target: any = null;

    // タイプ番号を探す
    if (!this.reac[typNo]) {
      target = new Array();
    } else {
      target = this.reac[typNo];
    }
    let result = target[index];
    return result;
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
      var tmp = target[i];
      if (tmp['row'] == row) {
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