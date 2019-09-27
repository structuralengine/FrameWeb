import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultDisgService {

  public disg: any;

  constructor() {   
      this.clear();
  }

  public clear(): void {
    this.disg = {};
  }

  public getDisgColumns(typNo: number, index: number): any {

    let target: any = null;

    // タイプ番号を探す
    if (!this.disg[typNo]) {
      target = new Array();
    } else {
      target = this.disg[typNo];
    }
    const result = target[index];
    return result;
  }

}
