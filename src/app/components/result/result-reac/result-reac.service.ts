import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultReacService {

  public reac: any;

  constructor() {   
      this.clear();
  }

  public clear(): void {
    this.reac = {};
  }


  public getReacColumns(typNo: number, index: number): any {

    let target: any = null;

    // タイプ番号を探す
    if (!this.reac[typNo]) {
      target = new Array();
    } else {
      target = this.reac[typNo];
    }
    const result = target[index];
    return result;
  }
}
