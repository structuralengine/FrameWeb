
import { Injectable } from '@angular/core';
import { DataHelperService } from '../../../providers/data-helper.service';

@Injectable({
  providedIn: 'root'
})
export class InputPickupService {

  public pickup: any[];

  constructor(private helper: DataHelperService) {
    this.clear();
  }

  public clear(): void {
    this.pickup = new Array();
  }
  
  public getPickUpDataColumns(row: number, col: number): any {

    let result: any = null;

    for (let i = 0; i < this.pickup.length; i++) {
      const tmp = this.pickup[i];
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
      this.pickup.push(result);
    }
    return result;
  }

  public setPickUpJson(jsonData: {}): void {
    if (!('pickup' in jsonData)) {
      return;
    }
    const json: {} = jsonData['pickup'];
    for (const index of Object.keys(json)) {
      if (index == null) {
        continue;
      }
      const result: {} = json[index];
      this.pickup.push(result);
    }
  }


  // PICKUPケース 組合せ
  public getPickUpJson(mode: string = 'file') {

    const jsonData = {};
    for (let i = 0; i < this.pickup.length; i++) {
      const data = {};
      const row = this.pickup[i];
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

  // PICKUP ケース名を取得する
  public getPickUpName(currentPage: number): string {

    if (currentPage < 1) {
      return '';
    }
    if (currentPage > this.pickup.length) {
      return '';
    }

    const i = currentPage - 1;
    const tmp = this.pickup[i];

    let result = '';
    if ('name' in tmp) {
      result = tmp['name'];
    }
    return result;
  }

  // 有効な PICKUP ケース数を調べる
  public getPickupCaseCount(): number {
    const dict = this.getPickUpJson();
    return Object.keys(dict).length;
  }

}
