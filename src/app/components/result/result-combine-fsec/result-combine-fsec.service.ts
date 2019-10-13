import { Injectable } from '@angular/core';
import { ResultFsecService } from '../result-fsec/result-fsec.service';

@Injectable({
  providedIn: 'root'
})
export class ResultCombineFsecService {

  public fsecCombine: any;

  constructor(private fsec: ResultFsecService) {
    this.clear();
  }

  public clear(): void {
    this.fsecCombine = {};
  }

  public getCombineFsecColumns(combNo: number, index: number, mode: string): any {

    // 組み合わせを探す
    let target1: any = null;
    if (!this.fsecCombine[combNo]) {
      target1 = new Array();
    } else {
      target1 = this.fsecCombine[combNo];
    }

    // 着目項目を探す
    let target2: any = null;
    if (!target1[mode]) {
      target2 = new Array();
    } else {
      target2 = target1[mode];
    }

    const result = target2[index];
    return result;
  }

  public setFsecCombineJson(combList: any): void {

    try {

      // combineのループ
      for (const combNo of Object.keys(combList)) {
        const resultFsec = {
          fx_max: {}, fx_min: {}, fy_max: {}, fy_min: {}, fz_max: {}, fz_min: {},
          mx_max: {}, mx_min: {}, my_max: {}, my_min: {}, mz_max: {}, mz_min: {}
        };

        // defineのループ
        const combines: any[] = combList[combNo];
        for (let i = 0; i < combines.length; i++) {
          const combineFsec = { fx: {}, fy: {}, fz: {}, mx: {}, my: {}, mz: {} };

          // 基本ケースのループ
          const com = combines[i];
          for (let j = 0; j < com.length; j++) {
            const caseInfo = com[j];

            if (!(caseInfo.caseNo in this.fsec.fsec)) {
              continue;
            }
            // 節点番号のループ
            const Fsecs: any[] = this.fsec.fsec[caseInfo.caseNo];
            for (let n = 0; n < Fsecs.length; n++) {
              const result: {} = Fsecs[n];
              const row = result['row'];

              // dx, dy … のループ
              for (const key1 of Object.keys(combineFsec)) {
                const value = combineFsec[key1];
                const temp: {} = (row in value) ? value[row] : { row: row, fx: 0, fy: 0, fz: 0, mx: 0, my: 0, mz: 0, case: '' };

                // x, y, z, 変位, 回転角 のループ
                for (const key2 in result) {
                  if (key2 === 'row') {
                    continue;
                  }
                  if (key2 === 'm' || key2 === 'n' || key2 === 'l') {
                    temp[key2] = result[key2];
                    continue;
                  }
                  temp[key2] += caseInfo.coef * result[key2];
                }
                temp['case'] += '+' + caseInfo.caseNo.toString();
                value[row] = temp;
                combineFsec[key1] = value;
              }
            }
          }

          // dx, dy … のループ
          const k: string[] = ['_max', '_min'];
          for (const key1 of Object.keys(combineFsec)) {
            for (let n = 0; n < k.length; n++) {
              let key2: string;
              key2 = key1 + k[n];
              const old = resultFsec[key2];
              const current = combineFsec[key1];
              // 節点番号のループ
              for (const id of Object.keys(current)) {
                if (!(id in old)) {
                  old[id] = current[id];
                  resultFsec[key2] = old;
                  continue;
                }
                const target = current[id];
                const comparison = old[id]
                if ((n === 0 && comparison[key1] < target[key1])
                  || (n > 0 && comparison[key1] > target[key1])) {
                  old[id] = target;
                  resultFsec[key2] = old;
                }
              }
            }
          }

        }
        this.fsecCombine[combNo] = resultFsec;
      }
    } catch (e) {
      console.log(e);
    }
  }


}
