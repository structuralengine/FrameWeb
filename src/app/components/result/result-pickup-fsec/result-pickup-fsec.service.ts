import { Injectable } from '@angular/core';
import { ResultCombineFsecService } from '../result-combine-fsec/result-combine-fsec.service';

@Injectable({
  providedIn: 'root'
})
export class ResultPickupFsecService {

  public fsecPickup: any;

  constructor(private fsec: ResultCombineFsecService) { 
    this.clear();
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

  public setFsecPickupJson(pickList: any): void {
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
    } catch (e) {
      console.log(e);
    }
  }

  public getFsecJson(): object {
    return this.fsecPickup;
  }

}
