import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class ResultReacService {

  public REAC_ROWS_COUNT: number;
  public reac: any;

  constructor(private helper: DataHelperModule) {
    this.clear();
  }

  public clear(): void {
    this.reac = {};
  }

  public getReacColumns(typNo: number, index: number): any {

    let target: any = null;

    // タイプ番号を探す
    if (!this.reac[typNo]) {
      target = new Array();
    } else {
      target = this.reac[typNo];
    }
    const result = target[index];
    return result;
  }

  public getReacJson(): object {
    return this.reac;
  }
  
  public setReacJson(jsonData: {}): void {
    let max_row = 0;
    for (const caseNo of Object.keys(jsonData)) {
      const target = new Array();
      const caseData: {} = jsonData[caseNo];

      // 存在チェック
      if (typeof (caseData) !== 'object') {
        continue;
      }
      if (!('reac' in caseData)) {
        continue;
      }
      const json: {} = caseData['reac'];
      if (json === null) {
        continue;
      }

      for (const n of Object.keys(json)) {
        const item: {} = json[n];

        let tx: number = this.helper.toNumber(item['tx']);
        let ty: number = this.helper.toNumber(item['ty']);
        let tz: number = this.helper.toNumber(item['tz']);
        let mx: number = this.helper.toNumber(item['mx']);
        let my: number = this.helper.toNumber(item['my']);
        let mz: number = this.helper.toNumber(item['mz']);

        tx = (tx == null) ? 0 : tx;
        ty = (ty == null) ? 0 : ty;
        tz = (tz == null) ? 0 : tz;
        mx = (mx == null) ? 0 : mx;
        my = (my == null) ? 0 : my;
        mz = (mz == null) ? 0 : mz;

        const result = {
          id: n.replace('node', ''),
          tx: tx.toFixed(2),
          ty: ty.toFixed(2),
          tz: tz.toFixed(2),
          mx: mx.toFixed(2),
          my: my.toFixed(2),
          mz: mz.toFixed(2)
        };
        target.push(result);
      }
      this.reac[caseNo.replace('Case', '')] = target;
      max_row = Math.max(max_row, target.length);
    }
    this.REAC_ROWS_COUNT = max_row;
  }

}
