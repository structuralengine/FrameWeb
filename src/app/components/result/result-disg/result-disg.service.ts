import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class ResultDisgService {

  public DISG_ROWS_COUNT: number;
  public disg: any;

  constructor(private helper: DataHelperModule) {
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
    const item = target[index];
    const dx = Math.round(10000 * item['dx']) / 10000;
    const dy = Math.round(10000 * item['dy']) / 10000;
    const dz = Math.round(10000 * item['dz']) / 10000;
    const rx = Math.round(10000 * item['rx']) / 10000;
    const ry = Math.round(10000 * item['ry']) / 10000;
    const rz = Math.round(10000 * item['rz']) / 10000;

    const result = {
      id: item['n'],
      dx: dx.toFixed(4),
      dy: dy.toFixed(4),
      dz: dz.toFixed(4),
      rx: rx.toFixed(4),
      ry: ry.toFixed(4),
      rz: rz.toFixed(4)
    };
    return result;
  }

  public getDisgJson(): object {
    return this.disg;
  }

  public getMaxDisg(): number {
    // dic型の中にarr型が入っている状態をarr型の中にarr型が入る状態へ変形
    let arryDisg2D = Object.keys(this.disg).map((key) => { return this.disg[key] });

    // 2次元のarr型を1次元へ変形
    let arryDisg1D = arryDisg2D.reduce((pre, current) => { pre.push(...current); return pre }, []);

    // 最大値を含む配列要素を取得
    let m = arryDisg1D.reduce((pre, current) => Math.max(pre.dx, pre.dy, pre.dz) > Math.max(current.dx, current.dy, current.dz) ? pre : current);

    // 最大値を返却
    return Math.max(m.dx, m.dy, m.dz);
  }

  public setDisgJson(jsonData: {}): void {

    let max_row = 0;

    let max_d = 0;
    let max_r = 0;

    for (const caseNo of Object.keys(jsonData)) {
      const target = new Array();
      const caseData: {} = jsonData[caseNo];

      // 存在チェック
      if (typeof (caseData) !== 'object') {
        continue;
      }
      if (!('disg' in caseData)) {
        continue;
      }
      const json: {} = caseData['disg'];

      for (const n of Object.keys(json)) {

        const item: {} = json[n];

        let dx: number = this.helper.toNumber(item['dx']);
        let dy: number = this.helper.toNumber(item['dy']);
        let dz: number = this.helper.toNumber(item['dz']);
        let rx: number = this.helper.toNumber(item['rx']);
        let ry: number = this.helper.toNumber(item['ry']);
        let rz: number = this.helper.toNumber(item['rz']);
        dx = (dx == null) ? 0 : dx * 1000;
        dy = (dy == null) ? 0 : dy * 1000;
        dz = (dz == null) ? 0 : dz * 1000;
        rx = (rx == null) ? 0 : rx * 1000;
        ry = (ry == null) ? 0 : ry * 1000;
        rz = (rz == null) ? 0 : rz * 1000;
        const result = {
          id: n.replace('node', ''),
          dx: dx,
          dy: dy,
          dz: dz,
          rx: rx,
          ry: ry,
          rz: rz
        };
        target.push(result);

        // 最大値を記録する
        for (const v of [dx, dy, dz]) {
          if (Math.abs(max_d) < Math.abs(v)) {
            max_d = v;
          }
        }
        for (const v of [rx, ry, rz]) {
          if (Math.abs(max_r) < Math.abs(v)) {
            max_r = v;
          }
        }


      }
      this.disg[caseNo.replace('Case', '')] = target;
      max_row = Math.max(max_row, target.length);
    }
    this.DISG_ROWS_COUNT = max_row;

    this.disg['max_value'] = Math.abs(max_d); // Math.max(Math.abs(max_d), Math.abs(max_r));

  }


}
