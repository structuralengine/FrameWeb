import { Injectable } from '@angular/core';
import { ResultDisgService } from '../result-disg/result-disg.service';
import { ResultPickupDisgService } from '../result-pickup-disg/result-pickup-disg.service';

@Injectable({
  providedIn: 'root'
})
export class ResultCombineDisgService {

  public disgCombine: any;
  public isCalculated: boolean;
  private worker1: Worker;
  private worker2: Worker;
  public disgKeys = [
    "dx_max",
    "dx_min",
    "dy_max",
    "dy_min",
    "dz_max",
    "dz_min",
    "rx_max",
    "rx_min",
    "ry_max",
    "ry_min",
    "rz_max",
    "rz_min",
  ];
  public titles = [
    "x方向の移動量 最大",
    "x方向の移動量 最小",
    "y方向の移動量 最大",
    "y方向の移動量 最小",
    "z方向の移動量 最大",
    "Z方向の移動量 最小",
    "x軸回りの回転角 最大",
    "x軸回りの回転角 最小",
    "y軸回りの回転角 最大",
    "y軸回りの回転角 最小",
    "z軸回りの回転角 最大",
    "Z軸回りの回転角 最小",
  ];

  private columns: any;

  constructor(private pickdisg: ResultPickupDisgService) {
    this.clear();
    this.isCalculated = false;
    this.worker1 = new Worker('./result-combine-disg1.worker', { name: 'combine-disg1', type: 'module' });
    this.worker2 = new Worker('./result-combine-disg2.worker', { name: 'combine-disg2', type: 'module' });
  }

  public clear(): void {
    this.disgCombine = {};
  }

  // three.js で必要
  public getDisgJson(): object {
    return this.disgCombine;
  }

  public getCombineDisgColumns(combNo: number, mode: string): any {
    return this.columns[combNo][mode];

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

  public setDisgCombineJson(disg: any, defList: any, combList: any, pickList: any): void {

    const postData = {
      defList,
      combList,
      disg
    };

    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker1.onmessage = ({ data }) => {
        this.disgCombine = data.disgCombine;
        console.log('変位disg の 組み合わせ Combine 集計が終わりました', performance.now() - startTime);

        // ピックアップの集計処理を実行する
        this.pickdisg.setDisgPickupJson(pickList, this.disgCombine);

        // 断面力テーブルの集計
        this.worker2.onmessage = ({ data }) => {
          console.log('変位disg の 組み合わせ Combine テーブル集計が終わりました', performance.now() - startTime);
          this.columns = data.result;
          this.isCalculated = true;
        };
        this.worker2.postMessage({ disgCombine: this.disgCombine });
        // this.columns = this.test_worker2({ disgCombine: this.disgCombine, combList });
        // this.isCalculated = true;

      };
      this.worker1.postMessage({ defList, combList, disg, disgKeys: this.disgKeys });
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

  }


  private test_worker2(data) {

    const disgCombine = data.disgCombine;
    const combList = data.combList

    const result = {};
    for (const combNo of Object.keys(combList)) {

      // 組み合わせを探す
      let target1: any[] = disgCombine[combNo];

      const result2 = {};
      for (const mode of Object.keys(target1)) {

        // 着目項目を探す
        const target2 = (mode in target1) ? target1[mode] : [];
        const result3: any[] = new Array();

        for (const id of Object.keys(target2)) {
          const item = target2[id];
          const dx = item.dx === null ? 0 : Math.round(10000 * item.dx) / 10000;
          const dy = item.dy === null ? 0 : Math.round(10000 * item.dy) / 10000;
          const dz = item.dz === null ? 0 : Math.round(10000 * item.dz) / 10000;
          const rx = item.rx === null ? 0 : Math.round(10000 * item.rx) / 10000;
          const ry = item.ry === null ? 0 : Math.round(10000 * item.ry) / 10000;
          const rz = item.rz === null ? 0 : Math.round(10000 * item.rz) / 10000;
          result3.push({
            id: id,
            dx: dx.toFixed(4),
            dy: dy.toFixed(4),
            dz: dz.toFixed(4),
            rx: rx.toFixed(4),
            ry: ry.toFixed(4),
            rz: rz.toFixed(4),
          });
        }
        result2[mode] = result3;
      }
      result[combNo] = result2;
    }
    return result;
  }

}
