import { Injectable } from '@angular/core';
import { DataHelperService } from '../../providers/data-helper.service';

@Injectable({
  providedIn: 'root'
})
export class InputJointService extends DataHelperService {
  public joint: any;

  constructor() {
    super();
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
        const item: {} = js[i];
        const row: string = ('row' in item) ? item['row'] : (i + 1).toString();
        const result = {
          row: row, m: item['m'],
          xi: item['xi'], yi: item['yi'], zi: item['zi'],
          xj: item['xj'], yj: item['yj'], zj: item['zj']
        };
        target.push(result);
      }
      this.joint[typNo] = target;
    }
  }

  public getJointJson(mode: string = 'file') {

    const result = {};
    let targetCase = '0';
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('joints') < 0) {
      return result;
    } else {
      targetCase = mode.replace('unity-joints:', '');
    }

    for (const typNo of Object.keys(this.joint)) {
      // unity-joints モードは カレントのケースのみデータを生成する
      if (targetCase !== mode) {
        if (typNo !== targetCase) {
          continue;
        }
      }
      const joint = this.joint[typNo];
      const jsonData = new Array();
      for (let i = 0; i < joint.length; i++) {
        const row: {} = joint[i];
        const r = row['row'];
        let m = this.toNumber(row['m']);
        let xi = this.toNumber(row['xi']);
        let yi = this.toNumber(row['yi']);
        let zi = this.toNumber(row['zi']);
        let xj = this.toNumber(row['xj']);
        let yj = this.toNumber(row['yj']);
        let zj = this.toNumber(row['zj']);
        if (m == null && xi == null && yi == null && zi == null
          && xj == null && yj == null && zj == null) {
          continue;
        }
        let item = {};
        if (mode === 'calc') {
          m = (m == null) ? 0 : m;
          xi = (xi == null) ? 0 : xi;
          yi = (yi == null) ? 0 : yi;
          zi = (zi == null) ? 0 : zi;
          xj = (xj == null) ? 0 : xj;
          yj = (yj == null) ? 0 : yj;
          zj = (zj == null) ? 0 : zj;
          item = { m: m, xi: xi, yi: yi, zi: zi, xj: xj, yj: yj, zj: zj };
          jsonData.push(item);
        } else {
          jsonData.push(row);
        }
      }
      if (jsonData.length > 0) {
        result[typNo] = jsonData;
      }
    }
    return result;
  }
  
}
