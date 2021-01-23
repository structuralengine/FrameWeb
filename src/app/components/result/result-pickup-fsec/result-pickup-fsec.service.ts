import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultPickupFsecService {

  public fsecPickup: any;
  public isChange: boolean;
  private worker: Worker;

  constructor() {
    this.clear();
    this.isChange = true;
    this.worker = new Worker('./result-pickup-fsec.worker', { name: 'pickup-fsec', type: 'module' });
  }

  public clear(): void {
    this.fsecPickup = {};
  }

  public getPickupFsecColumns(combNo: number, mode: string): any {

    // 組み合わせを探す
    let target1: object[] = new Array();
    if (combNo in this.fsecPickup) {
      target1 = this.fsecPickup[combNo];
    }

    // 着目項目を探す
    let target2 = {};
    if (mode in target1) {
      target2 = target1[mode];
    }

    const result: any[] = new Array();
    let m: string = null;
    for (const k of Object.keys(target2)) {
      const target3 = target2[k];
      const item = {
        m: (m === target3['m']) ? '' : target3['m'],
        n: ('n' in target3) ? target3['n'] : '',
        l: target3['l'].toFixed(3),
        fx: target3['fx'].toFixed(2),
        fy: target3['fy'].toFixed(2),
        fz: target3['fz'].toFixed(2),
        mx: target3['mx'].toFixed(2),
        my: target3['my'].toFixed(2),
        mz: target3['mz'].toFixed(2),
        case: target3['case']
      };
      result.push(item);
      m = target3['m'];
    }
    return result;
  }

  public setFsecPickupJson(pickList: any, fsecCombine: any): void {

    const postData = {
      pickList,
      fsecCombine
    };

    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker.onmessage = ({ data }) => {
        this.fsecPickup = data.fsecPickup;
        this.isChange = false;
        console.log('断面力fsec の ピックアップ PickUp 集計が終わりました', performance.now() - startTime);
      };
      this.worker.postMessage(postData);
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }


    /*
    try {
      // pickupのループ

      for (const pickNo of Object.keys(pickList)) {
        const combines: any[] = pickList[pickNo];
        let tmp: {} = null;
        for (let i = 0; i < combines.length; i++) {
          const combNo: string = combines[i];
          const com = this.fsec.fsecCombine[combNo];
          if (tmp == null) {
            tmp = com;

            continue;
          }
          for (const k of Object.keys(com)) {
            const key = k.split('_');
            const target = com[k];
            const comparison = tmp[k];
            for (const id of Object.keys(comparison)) {
              const a = comparison[id];
              const b = target[id];
              if (key[1] === 'max') {
                if (b[key[0]] > a[key[0]]) {
                  tmp[k] = com[k];
                }
              } else {
                if (b[key[0]] < a[key[0]]) {
                  tmp[k] = com[k];
                }
              }
            }
          }
        }
        this.fsecPickup[pickNo] = tmp;
      }
      this.isChange = false;
    } catch (e) {
      console.log(e);
    }
    */
  }

  public getFsecJson(): object {
    return this.fsecPickup;
  }

}
