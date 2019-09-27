import { Injectable } from '@angular/core';
import { ResultDisgService } from '../result-disg/result-disg.service';

@Injectable({
  providedIn: 'root'
})
export class ResultCombineDisgService {

  public disgCombine: any;

  constructor(private disg: ResultDisgService) {
    this.clear();
  }

  public clear(): void {
    this.disgCombine = {};
  }


  public getCombineDisgColumns(combNo: number, index: number, mode: string): any {

    // 組み合わせを探す
    let target1: any = null;
    if (!this.disgCombine[combNo]) {
      target1 = new Array();
    } else {
      target1 = this.disgCombine[combNo];
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

  public setDisgCombineJson(combList: any): void {

    try {

      // combineのループ
      for (const combNo of Object.keys(combList)) {
        const resultDisg = {
          dx_max: {}, dx_min: {}, dy_max: {}, dy_min: {}, dz_max: {}, dz_min: {},
          rx_max: {}, rx_min: {}, ry_max: {}, ry_min: {}, rz_max: {}, rz_min: {}
        };

        // defineのループ
        const combines: any[] = combList[combNo];
        for (let i = 0; i < combines.length; i++) {
          const combineDisg = { dx: {}, dy: {}, dz: {}, rx: {}, ry: {}, rz: {} };

          // 基本ケースのループ
          const com = combines[i];
          for (let j = 0; j < com.length; j++) {
            const caseInfo = com[j];

            if (!(caseInfo.caseNo in this.disg.disg)) {
              continue;
            }
            // 節点番号のループ
            const disgs: any[] = this.disg.disg[caseInfo.caseNo];
            for (let n = 0; n < disgs.length; n++) {
              const result: {} = disgs[n];
              const id = result['id'];

              // dx, dy … のループ
              for (const key1 of Object.keys(combineDisg)) {
                const value = combineDisg[key1];
                const temp: {} = (id in value) ? value[id] : { id: id, dx: 0, dy: 0, dz: 0, rx: 0, ry: 0, rz: 0, case: '' };

                // x, y, z, 変位, 回転角 のループ
                for (const key2 in result) {
                  if (key2 === 'id') {
                    continue;
                  }
                  temp[key2] += caseInfo.coef * result[key2];
                }
                temp['case'] += '+' + caseInfo.caseNo.toString();
                value[id] = temp;
                combineDisg[key1] = value;
              }
            }
          }

          // dx, dy … のループ
          const k: string[] = ['_max', '_min'];
          for (const key1 of Object.keys(combineDisg)) {
            for (let n = 0; n < k.length; n++) {
              let key2: string;
              key2 = key1 + k[n];
              const old = resultDisg[key2];
              const current = combineDisg[key1];
              // 節点番号のループ
              for (const id of Object.keys(current)) {
                if (!(id in old)) {
                  old[id] = current[id];
                  resultDisg[key2] = old;
                  continue;
                }
                const target = current[id];
                const comparison = old[id]
                if ((n === 0 && comparison[key1] < target[key1])
                  || (n > 0 && comparison[key1] > target[key1])) {
                  old[id] = target;
                  resultDisg[key2] = old;
                }
              }
            }
          }
        }
        this.disgCombine[combNo] = resultDisg;
      }
    } catch (e) {
      console.log(e);
    }
  }

}
