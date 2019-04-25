import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ResultDataService {

  public DISG_ROWS_COUNT: number;
  public REAC_ROWS_COUNT: number;
  public FSEC_ROWS_COUNT: number;

  public disg: any;
  public reac: any;
  public fsec: any;
  
  public disgCombine: any;
  public reacCombine: any;
  public fsecCombine: any;

  public disgPickup: any;
  public reacPickup: any;
  public fsecPickup: any;

  constructor() {
    this.clear();
  }

  public clear(): void {
    this.disg = {};
    this.reac = {};
    this.fsec = {};

    this.disgCombine = {};
    this.reacCombine = {};
    this.fsecCombine = {};
    
    this.disgPickup = {};
    this.reacPickup = {};
    this.fsecPickup = {};
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
  
  public getCombineDisgColumns(combNo: number, index: number, mode: string): any {

    // 組み合わせを探す
    let target1: any = null;
    if (!this.disgCombine[combNo]) {
      target1 = new Array();
    } else {
      target1 = this.disgCombine[combNo];
    }

    // 着目項目を探す
    let target2: any = null;
    if (!target1[mode]) {
      target2 = new Array();
    } else {
      target2 = target1[mode];
    }

    let result = target2[index];
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