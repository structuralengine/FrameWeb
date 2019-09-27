import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultCombineReacService {

  public reacCombine: any;

  constructor() {
    this.clear();
  }

  public clear(): void {
    this.reacCombine = {};
  }
  
  public getCombineReacColumns(combNo: number, index: number, mode: string): any {

    // 組み合わせを探す
    let target1: any = null;
    if (!this.reacCombine[combNo]) {
      target1 = new Array();
    } else {
      target1 = this.reacCombine[combNo];
    }

    // 着目項目を探す
    let target2: any = null;
    if (!target1[mode]) {
      target2 = new Array();
    } else {
      target2 = target1[mode];
    }

    const result = target2[index];
    return result;
  }

}
