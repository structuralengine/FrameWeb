import { Injectable } from '@angular/core';
import { ThreeSectionForceService } from '../../three/geometry/three-section-force/three-section-force.service';

@Injectable({
  providedIn: 'root'
})
export class ResultPickupFsecService {

  public fsecPickup: any;
  public isCalculated: boolean;
  private worker1: Worker;
  private worker2: Worker;
  private columns: any;

  constructor(private three: ThreeSectionForceService) {
    this.clear();
    this.isCalculated = false;
    this.worker1 = new Worker('./result-pickup-fsec1.worker', { name: 'pickup-fsec1', type: 'module' });
    this.worker2 = new Worker('./result-pickup-fsec2.worker', { name: 'pickup-fsec2', type: 'module' });
  }

  public clear(): void {
    this.fsecPickup = {};
  }

  // three.js から呼ばれる
  public getFsecJson(): object {
    return this.fsecPickup;
  }

  public getPickupFsecColumns(combNo: number, mode: string): any {
    return this.columns[combNo][mode];
  }

  public setFsecPickupJson(pickList: any, fsecCombine: any): void {

    this.isCalculated = false;
    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker1.onmessage = ({ data }) => {
        console.log('断面力fsec の ピックアップ PickUp 集計が終わりました', performance.now() - startTime);
        this.fsecPickup = data.fsecPickup;
        const max_values = data.max_values;

        // 断面力テーブルの集計
        this.worker2.onmessage = ({ data }) => {
          console.log('断面fsec の ピックアップ PickUp テーブル集計が終わりました', performance.now() - startTime);
          this.columns = data.result;
          this.isCalculated = true;
        };
        // this.columns = this.worker2_test(this.fsecPickup );
        this.worker2.postMessage({ fsecPickup: this.fsecPickup });
        this.three.setPickupResultData(this.fsecPickup, max_values);

      };
      this.worker1.postMessage({ pickList, fsecCombine });
      // this.worker1_test({ pickList, fsecCombine });
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

  }

  private worker1_test( data ) {

    const pickList = data.pickList;
    const fsecCombine = data.fsecCombine;
    const fsecPickup = {};
    const max_values = {};
  
    // pickupのループ
    for (const pickNo of Object.keys(pickList)) {
      const max_value = {
        fx: 0, fy: 0, fz: 0,
        mx: 0, my: 0, mz: 0
      }
  
      const combines: any[] = pickList[pickNo];
      let tmp: {} = null;
      for (const combNo of combines) {
        const com = fsecCombine[combNo];
        if (tmp == null) {
          tmp = com;
  
          continue;
        }
        for (const k of Object.keys(com)) {
          if(k ==='mz_min'){
            console.log()
          }
          const key = k.split('_');
          const target = com[k];
          const comparison = tmp[k];
          for (const id of Object.keys(comparison)) {
            const a = comparison[id];
            if (!(id in target)) {
              continue;
            }
            const b = target[id];
            if (key[1] === 'max') {
              if (b[key[0]] > a[key[0]]) {
                tmp[k][id] = com[k][id];
              }
            } else {
              if (b[key[0]] < a[key[0]]) {
                tmp[k][id] = com[k][id];
              }
            }
          }
  
          // 最大値を 集計する
          for (const value of tmp[k]) {
            max_value.fx = Math.max(Math.abs(value.fx), max_value.fx);
            max_value.fy = Math.max(Math.abs(value.fy), max_value.fy);
            max_value.fz = Math.max(Math.abs(value.fz), max_value.fz);
            max_value.mx = Math.max(Math.abs(value.mx), max_value.mx);
            max_value.my = Math.max(Math.abs(value.my), max_value.my);
            max_value.mz = Math.max(Math.abs(value.mz), max_value.mz);
          }  
        }
      }
      fsecPickup[pickNo] = tmp;
      max_values[pickNo] = max_value;
    }
    return this.worker2_test({ fsecPickup, max_values });
  }



  private worker2_test(fsecPickup: any) {

  const result = {};
  for(const combNo of Object.keys(fsecPickup)){
    // 組み合わせを探す
    const target1: object[] = fsecPickup[combNo];

    if (target1 === null) {
      continue;
    }

    const result2 = {};
    for(const mode of Object.keys(target1)){
      // 着目項目を探す
      let target2 = {};
      if (mode in target1) {
        target2 = target1[mode];
      }

      const result3: any[] = new Array();
      let m: string = null;
      const old = {};
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
        // 同一要素内の着目点で、直前の断面力と同じ断面力だったら 読み飛ばす
        if (old['n'] !== item['n'] || old['fx'] !== item['fx'] || old['fy'] !== item['fy'] || old['fz'] !== item['fz']
            || old['mx'] !== item['mx'] || old['my'] !== item['my'] || old['mz'] !== item['mz']) {
          result3.push(item);
          m = target3['m'];
          Object.assign(old, item);
        }
      }
      result2[mode] = result3;
    }
    result[combNo] = result2;
  }
  return { result };

  }

}
