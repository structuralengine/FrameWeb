import { Injectable } from '@angular/core';
import { ResultCombineDisgService } from '../result-combine-disg/result-combine-disg.service';

@Injectable({
  providedIn: 'root'
})
export class ResultPickupDisgService {

  public disgPickup: any;

  constructor(private disg: ResultCombineDisgService) { 
    this.clear();
  }

  public clear(): void {
    this.disgPickup = {};
  }
  
  public getPickupDisgColumns(combNo: number, index: number, mode: string): any {

    // 組み合わせを探す
    let target1: any = null;
    if (!this.disgPickup[combNo]) {
      target1 = new Array();
    } else {
      target1 = this.disgPickup[combNo];
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

  public setDisgPickupJson(pickList: any): void {
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
    } catch (e) {
      console.log(e);
    }
  }
}
