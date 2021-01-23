import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultPickupReacService {

  public reacPickup: any;
  public isChenge: boolean;
  private worker: Worker;

  constructor() { 
    this.clear();
    this.isChenge = true;
    this.worker = new Worker('./result-pickup-reac.worker', { name: 'pickup-reac', type: 'module' });
  }

  public clear(): void {
    this.reacPickup = {};
  }


  public getPickupReacColumns(combNo: number, mode: string): any {

    // 組み合わせを探す
    let target1: any[] = new Array();
    if (combNo in this.reacPickup) {
      target1 = this.reacPickup[combNo];
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

  public setReacPickupJson(pickList: any, reacCombine: any): void {

    const postData = {
      pickList,
      reacCombine
    };

    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker.onmessage = ({ data }) => {
        this.reacPickup = data.reacPickup;
        this.isChenge = false;
        console.log('反力reac の ピックアップ PickUp 集計が終わりました', performance.now() - startTime);
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
          const com = this.reac.reacCombine[combNo];
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
              if ( !(id in target) ){
                continue;
              }
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
        this.reacPickup[pickNo] = tmp;
      }
      this.isChenge = false;
    } catch (e) {
      console.log(e);
    }
    */
  }

}
