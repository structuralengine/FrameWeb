import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultPickupDisgService {

  public disgPickup: any;
  public isChange: boolean;
  private worker: Worker;

  constructor() { 
    this.clear();
    this.isChange = true;
    this.worker = new Worker('./result-pickup-disg.worker', { name: 'pickup-disg', type: 'module' });
  }

  public clear(): void {
    this.disgPickup = {};
  }
  
  public getPickupDisgColumns(combNo: number, mode: string): any {

    // 組み合わせを探す
    let target1: any[] = new Array();
    if (combNo in this.disgPickup) {
      target1 = this.disgPickup[combNo];
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

  public setDisgPickupJson(pickList: any, disgCombine: any): void {

    const postData = {
      pickList,
      disgCombine
    };

    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker.onmessage = ({ data }) => {
        this.disgPickup = data.disgPickup;
        this.isChange = false;
        console.log('変位disg の ピックアップ PickUp 集計が終わりました', performance.now() - startTime);
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
          const com = this.disg.disgCombine[combNo];
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
        this.disgPickup[pickNo] = tmp;
      }
      this.isChange = false;
    } catch (e) {
      console.log(e);
    }
    */
  }
}
