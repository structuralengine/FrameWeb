import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputDefineService {

  public define: any[];

  constructor() {
    this.clear();
  }

  public clear(): void {
    this.define = new Array();
  }
  
  public getDefineDataColumns(row: number, col: number): any {

    let result: any = null;

    for (let i = 0; i < this.define.length; i++) {
      const tmp = this.define[i];
      if (tmp['row'] === row) {
        result = tmp;
        break;
      }
    }

    // 対象データが無かった時に処理
    if (result == null) {
      result = { row: row };
      for (let i = 1; i <= col; i++) {
        result['D' + i] = '';
      }
      this.define.push(result);
    }
    return result;
  }

  public setDefineJson(jsonData: {}): void {
    if (!('define' in jsonData)) {
      return;
    }
    const json: {} = jsonData['define'];
    for (const index of Object.keys(json)) {
      if (index == null) {
        continue;
      }
      const result: {} = json[index];
      this.define.push(result);
    }
  }

}
