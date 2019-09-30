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
    const result = target[index];
    return result;
  }

  public getDisgJson(): object {
    return this.disg;
  }

  public setDisgJson(jsonData: {}): void {
    let max_row = 0;
    for (const caseNo of Object.keys(jsonData)) {
      const target = new Array();
      const caseData: {} = jsonData[caseNo];
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
        dx = (dx == null) ? 0 : dx;
        dy = (dy == null) ? 0 : dy;
        dz = (dz == null) ? 0 : dz;
        rx = (rx == null) ? 0 : rx;
        ry = (ry == null) ? 0 : ry;
        rz = (rz == null) ? 0 : rz;
        const result = {
          id: n,
          dx: dx.toFixed(3),
          dy: dy.toFixed(3),
          dz: dz.toFixed(3),
          rx: rx.toFixed(3),
          ry: ry.toFixed(3),
          rz: rz.toFixed(3)
        };
        target.push(result);
      }
      this.disg[caseNo] = target;
      max_row = Math.max(max_row, target.length);
    }
    this.DISG_ROWS_COUNT = max_row;
  }

}
