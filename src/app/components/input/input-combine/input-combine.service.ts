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
//    const temp = [];
//    for (let i = 0; i < this.combine.length; i++) {
      const i = this.combine.findIndex((element) => element.row === row);
      if(i >= 0){
      const line = {row : this.combine[i].row, name : this.combine[i].name}
      for (let j = 1; j <= col; j++) {
        const key = 'C' + j;
        if(key in this.combine[i]){
          line[key] = this.combine[i][key];
        }
      }
      this.combine[i] = line;
    }
//      this.combine[row] = line;
//    }
//    this.combine = temp; 


    console.log(row,col);
    for (let i = 0; i < this.combine.length; i++) {
      const tmp = this.combine[i];
      if (tmp['row'] === row) {
        result = tmp;
        for (let j = 1; j <= col; j++) {
          if(result['C' + j] === 0){
            result['C' + j] = null;
          }
        }
        break;
      }
    }

    // 対象データが無かった時に処理
    if (result == null) {
      result = { row: row };
      result['name'] = this.getCombineName(row);
      for (let i = 1; i <= col; i++) {
        result['C' + i] = null;
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
      for (const key of Object.keys(result)) {
        if (key.charAt(0)!== 'C'){
          continue;
        }
        const value = this.helper.toNumber(result[key]);
        if(value === 0){
          result[key] = null;
        } else { 
          result[key] = value;
        }
      }
      this.combine.push(result);
    }
  }

  public getCombineJson() {

    const jsonData = {};
    for (const row of this.combine) {
      const data = {};
      const id = row['row'];
      let flg = false;
      for (let key in row) {
        if (key === 'row' || key === 'name') {
          data[key] = row[key];
        } else if (key.charAt(0) === 'C'){
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
