import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputCombineService {

  public combine: any[];

  constructor() {
    this.clear();
  }

  public clear(): void {
    this.combine = new Array();
  }

  public getCombineDataColumns(row: number, col: number): any {

    let result: any = null;

    for (let i = 0; i < this.combine.length; i++) {
      const tmp = this.combine[i];
      if (tmp['row'] === row) {
        result = tmp;
        break;
      }
    }

    // 対象データが無かった時に処理
    if (result == null) {
      result = { row: row };
      for (let i = 1; i < col; i++) {
        result['C' + i] = '';
      }
      this.combine.push(result);
    }
    return result;
  }

  public setCombineJson(jsonData: {}): void {
    if (!('combine' in jsonData)) {
      return;
    }
    const json: {} = jsonData['combine'];
    for (const index of Object.keys(json)) {
      if (index == null) {
        continue;
      }
      const result: {} = json[index];
      this.combine.push(result);
    }
  }
  
}
