import { Injectable } from '@angular/core';
import { ResultDisgService } from '../result-disg/result-disg.service';
import { ResultPickupDisgService } from '../result-pickup-disg/result-pickup-disg.service';

@Injectable({
  providedIn: 'root'
})
export class ResultCombineDisgService {

  public disgCombine: any;
  public isChange: boolean;
  private worker: Worker;

  constructor(private disg: ResultDisgService,
              private pickdisg: ResultPickupDisgService) {
    this.clear();
    this.isChange = true;
    this.worker = new Worker('./result-combine-disg.worker', { name: 'combine-disg', type: 'module' });
  }

  public clear(): void {
    this.disgCombine = {};
  }


  public getCombineDisgColumns(combNo: number, mode: string): any {

    // 組み合わせを探す
    let target1: any[] = new Array();
    if (combNo in this.disgCombine) {
      target1 = this.disgCombine[combNo];
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
        dx: target3['dx'].toFixed(4),
        dy: target3['dy'].toFixed(4),
        dz: target3['dz'].toFixed(4),
        rx: target3['rx'].toFixed(4),
        ry: target3['ry'].toFixed(4),
        rz: target3['rz'].toFixed(4),
        case: target3['case']
      };
      result.push(item);
    }

    return result;
  }

  public setDisgCombineJson(defList: any, combList: any, pickList: any): void {

    const postData = {
      defList,
      combList,
      disg: this.disg.disg
    };

    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker.onmessage = ({ data }) => {
        this.disgCombine = data.disgCombine;
        this.isChange = false;
        console.log('変位disg の 組み合わせ Combine 集計が終わりました', performance.now() - startTime);
        this.pickdisg.setDisgPickupJson(pickList, this.disgCombine);
      };
      this.worker.postMessage(postData);
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }


    /*
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
          let caseStr: string = '';
          for (let j = 0; j < com.length; j++) {
            const caseInfo = com[j];
            if (caseInfo.coef >= 0) {
              caseStr += '+' + caseInfo.caseNo.toString();
            } else {
              caseStr += '-' + caseInfo.caseNo.toString();
            }
            if (!(caseInfo.caseNo in this.disg.disg)) {
              for (const key1 of Object.keys(combineDisg)) {
                for (const key2 of Object.keys(combineDisg[key1])){
                  combineDisg[key1][key2].case = caseStr;
                }
              }
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
                temp['case'] = caseStr;
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
      this.isChange = false;
    } catch (e) {
      console.log(e);
    }
    */

  }

}
