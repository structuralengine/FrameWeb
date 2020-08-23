import { Injectable } from '@angular/core';
import { ResultReacService } from '../result-reac/result-reac.service';

@Injectable({
  providedIn: 'root'
})
export class ResultCombineReacService {

  public reacCombine: any;

  constructor(private reac: ResultReacService) {
    this.clear();
  }

  public clear(): void {
    this.reacCombine = {};
  }
  
  public getCombineReacColumns(combNo: number, mode: string): any {

    // 組み合わせを探す
    let target1: any[] = new Array();
    if (combNo in this.reacCombine) {
      target1 = this.reacCombine[combNo];
    }

    // 着目項目を探す
    let target2 = {};
    if (mode in target1) {
      target2 = target1[mode];
    }

    const result: any[] = new Array();
    for (const k of Object.keys(target2)) {
      const target3 = target2[k];
      const item = {
        id: target3['id'],
        tx: target3['tx'].toFixed(2),
        ty: target3['ty'].toFixed(2),
        tz: target3['tz'].toFixed(2),
        mx: target3['mx'].toFixed(2),
        my: target3['my'].toFixed(2),
        mz: target3['mz'].toFixed(2),
        case: target3['case']
      };
      result.push(item);
    }

    return result;
  }

  public setReacCombineJson(combList: any): void {

    try {

      // combineのループ
      for (const combNo of Object.keys(combList)) {
        const resultReac = {
          tx_max: {}, tx_min: {}, ty_max: {}, ty_min: {}, tz_max: {}, tz_min: {},
          mx_max: {}, mx_min: {}, my_max: {}, my_min: {}, mz_max: {}, mz_min: {}
        };

        // defineのループ
        const combines: any[] = combList[combNo];
        for (let i = 0; i < combines.length; i++) {
          const combineReac = { tx: {}, ty: {}, tz: {}, mx: {}, my: {}, mz: {} };

          // 基本ケースのループ
          const com = combines[i];
          let caseStr: string = '';
          for (let j = 0; j < com.length; j++) {
            const caseInfo = com[j];
            if (caseInfo.coef >= 0) {
              caseStr += '+' + caseInfo.caseNo.toString();
            } else {
              caseStr += '-' + caseInfo.caseNo.toString();
            }

            if (!(caseInfo.caseNo in this.reac.reac)) {
              for (const key1 of Object.keys(combineReac)) {
                for (const key2 of Object.keys(combineReac[key1])){
                  combineReac[key1][key2].case = caseStr;
                }
              }
              continue;
            }
            // 節点番号のループ
            const Reacs: any[] = this.reac.reac[caseInfo.caseNo];
            for (let n = 0; n < Reacs.length; n++) {
              const result: {} = Reacs[n];
              const id = result['id'];

              // dx, dy … のループ
              for (const key1 of Object.keys(combineReac)) {
                const value = combineReac[key1];
                const temp: {} = (id in value) ? value[id] : { id: id, tx: 0, ty: 0, tz: 0, mx: 0, my: 0, mz: 0, case: '' };

                // x, y, z, 変位, 回転角 のループ
                for (const key2 in result) {
                  if (key2 === 'id') {
                    continue;
                  }
                  temp[key2] += caseInfo.coef * result[key2];
                }
                temp['case'] = caseStr;
                value[id] = temp;
                combineReac[key1] = value;
              }
            }
          }

          // dx, dy … のループ
          const k: string[] = ['_max', '_min'];
          for (const key1 of Object.keys(combineReac)) {
            for (let n = 0; n < k.length; n++) {
              let key2: string;
              key2 = key1 + k[n];
              const old = resultReac[key2];
              const current = combineReac[key1];
              // 節点番号のループ
              for (const id of Object.keys(current)) {
                if (!(id in old)) {
                  old[id] = current[id];
                  resultReac[key2] = old;
                  continue;
                }
                const target = current[id];
                const comparison = old[id]
                if ((n === 0 && comparison[key1] < target[key1])
                  || (n > 0 && comparison[key1] > target[key1])) {
                  old[id] = target;
                  resultReac[key2] = old;
                }
              }
            }
          }
        }
        this.reacCombine[combNo] = resultReac;
      }
    } catch (e) {
      console.log(e);
    }
  }

}
