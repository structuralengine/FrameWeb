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

      };
      this.worker1.postMessage({ defList, combList, disg, disgKeys: this.disgKeys });
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

  }

}
