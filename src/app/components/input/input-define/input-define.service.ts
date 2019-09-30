import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class InputDefineService {

  public define: any[];

  constructor(private helper: DataHelperModule) {
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

  public getDefineJson(mode: string = 'file') {

    const jsonData = {};
    for (let i = 0; i < this.define.length; i++) {
      const data = {};
      const row = this.define[i];
      const id = row['row'];
      let flg = false;
      for (let key in row) {
        if (key === 'row' || key === 'name') {
          if (mode === 'file') {
            data[key] = row[key];
          }
        } else {
          const value = row[key];
          if (this.helper.toNumber(value) != null) {
            flg = true;
            if (mode !== 'file') {
              key = key.replace('C', '').replace('D', '');
            }
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
  // 有効な DEFINEケース数を調べる
  public getDefineCaseCount(): number {
    const dict = this.getDefineJson();
    return Object.keys(dict).length;
  }

  
}
