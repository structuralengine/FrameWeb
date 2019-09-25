import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputPickupService {

  public pickup: any[];

  constructor() {
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

}
