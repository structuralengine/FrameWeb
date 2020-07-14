import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class InputCombineService {

  public combine: any[];

  constructor(private helper: DataHelperModule) {
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

  public getCombineJson() {

    const jsonData = {};
    for (let i = 0; i < this.combine.length; i++) {
      const data = {};
      const row = this.combine[i];
      const id = row['row'];
      let flg = false;
      for (let key in row) {
        if (key === 'row' || key === 'name') {
          data[key] = row[key];
        } else {
          const value = row[key];
          const num = this.helper.toNumber(value);
          if (num != null) {
            flg = true;
            data[key] = value;
          }
        }
      }
      if (flg === true) {
        jsonData[id] = data;
      }
    }
    return jsonData;
  }

  // 補助関数 ///////////////////////////////////////////////////////////////

  // 有効な COMBINE ケース数を調べる
  public getCombineCaseCount(): number {
    const dict = this.getCombineJson();
    return Object.keys(dict).length;
  }

  // COMBINE ケース名を取得する
  public getCombineName(currentPage: number): string {

    if (currentPage < 1) {
      return '';
    }
    if (currentPage > this.combine.length) {
      return '';
    }

    const i = currentPage - 1;
    const tmp = this.combine[i];

    let result = '';
    if ('name' in tmp) {
      result = tmp['name'];
    }
    return result;
  }
}
