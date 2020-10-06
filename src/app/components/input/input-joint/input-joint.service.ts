import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class InputJointService {
  public joint: any;

  constructor(private helper: DataHelperModule) {
    this.clear();
  }

  public clear(): void {
    this.joint = {};
  }

  public getJointColumns(typNo: number, row: number): any {

    let target: any = null;
    let result: any = null;

    // タイプ番号を探す
    if (!this.joint[typNo]) {
      target = new Array();
    } else {
      target = this.joint[typNo];
    }

    // 行を探す
    for (let i = 0; i < target.length; i++) {
      const tmp = target[i];
      if (tmp['row'] === row) {
        result = tmp;
        break;
      }
    }

    // 対象行が無かった時に処理
    if (result == null) {
      result = { row: row, m: '', xi: '', yi: '', zi: '', xj: '', yj: '', zj: '' };
      target.push(result);
      this.joint[typNo] = target;
    }

    return result;
  }
  
  public setJointJson(jsonData: {}): void {
    if (!('joint' in jsonData)) {
      return;
    }
    const json: {} = jsonData['joint'];
    for (const typNo of Object.keys(json)) {
      const js: any[] = json[typNo];
      const target = new Array();
      for (let i = 0; i < js.length; i++) {
        const item = js[i];
        const row: string = ('row' in item) ? item['row'] : (i + 1).toString();
        const result = {
          row: row,
          m: (item.m === null) ? '' : item.m.toString(),
          xi: (item.xi === null) ? '' : item.xi.toFixed(0),
          yi: (item.yi === null) ? '' : item.yi.toFixed(0),
          zi: (item.zi === null) ? '' : item.zi.toFixed(0),
          xj: (item.xj === null) ? '' : item.xj.toFixed(0),
          yj: (item.yj === null) ? '' : item.yj.toFixed(0),
          zj: (item.zj === null) ? '' : item.zj.toFixed(0)
        };
        target.push(result);
      }
      this.joint[typNo] = target;
    }
  }

  public getJointJson(empty: number = null, targetCase: string = '') {

    const result = {};

    for (const typNo of Object.keys(this.joint)) {

      // ケースの指定がある場合、カレントケース以外は無視する
      if (targetCase.length > 0 && typNo !== targetCase) {
        continue;
      }

      const jsonData = new Array();

      for ( const row of this.joint[typNo]) {

        const r = row['row'];
        const m = this.helper.toNumber(row['m']);
        const xi = this.helper.toNumber(row['xi']);
        const yi = this.helper.toNumber(row['yi']);
        const zi = this.helper.toNumber(row['zi']);
        const xj = this.helper.toNumber(row['xj']);
        const yj = this.helper.toNumber(row['yj']);
        const zj = this.helper.toNumber(row['zj']);
        
        if (m == null && xi == null && yi == null && zi == null
          && xj == null && yj == null && zj == null) {
          continue;
        }

        jsonData.push({ 
          row: r,
          m: row.m,
          xi: (xi == null) ? empty : xi, 
          yi: (yi == null) ? empty : yi, 
          zi: (zi == null) ? empty : zi, 
          xj: (xj == null) ? empty : xj, 
          yj: (yj == null) ? empty : yj, 
          zj: (zj == null) ? empty : zj 
        });

      }
      if (jsonData.length > 0) {
        result[typNo] = jsonData;
      }
    }
    return result;
  }
  
}
