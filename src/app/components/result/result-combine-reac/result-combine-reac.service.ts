import { Injectable } from '@angular/core';
import { ResultReacService } from '../result-reac/result-reac.service';
import { ResultPickupReacService } from '../result-pickup-reac/result-pickup-reac.service';

@Injectable({
  providedIn: 'root'
})
export class ResultCombineReacService {

  public reacCombine: any;
  public isCalculated: boolean;
  private worker1: Worker;
  private worker2: Worker;
  public reacKeys = [
    "tx_max",
    "tx_min",
    "ty_max",
    "ty_min",
    "tz_max",
    "tz_min",
    "mx_max",
    "mx_min",
    "my_max",
    "my_min",
    "mz_max",
    "mz_min",
  ];
  public titles = [
    "x方向の支点反力 最大",
    "x方向の支点反力 最小",
    "y方向の支点反力 最大",
    "y方向の支点反力 最小",
    "z方向の支点反力 最大",
    "Z方向の支点反力 最小",
    "x軸回りの回転反力 最大",
    "x軸回りの回転反力 最小",
    "y軸回りの回転反力 最大",
    "y軸回りの回転反力 最小",
    "z軸回りの回転反力 最大",
    "Z軸回りの回転反力 最小",
  ];
  
  private columns: any;

  constructor( private pickreac: ResultPickupReacService) {
    this.clear();
    this.isCalculated = false;
    this.worker1 = new Worker('./result-combine-reac1.worker', { name: 'combine-reac1', type: 'module' });
    this.worker2 = new Worker('./result-combine-reac2.worker', { name: 'combine-reac2', type: 'module' });
  }

  public clear(): void {
    this.reacCombine = {};
  }
  
  // three.js で必要
  public getReacJson(): object {
    return this.reacCombine;
  }

  public getCombineReacColumns(combNo: number, mode: string): any {
    return this.columns[combNo][mode];
  }

  public setReacCombineJson(reac: any, defList: any, combList: any, pickList: any): void {

    const postData = {
      defList,
      combList,
      reac
    };

    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker1.onmessage = ({ data }) => {
        this.reacCombine = data.reacCombine;
        console.log('反力reac の 組み合わせ Combine 集計が終わりました', performance.now() - startTime);

        // ピックアップの集計処理を実行する
        this.pickreac.setReacPickupJson(pickList, this.reacCombine);

        // 反力テーブルの集計
        this.worker2.onmessage = ({ data }) => {
          console.log('反力reac の 組み合わせ Combine テーブル集計が終わりました', performance.now() - startTime);
          this.columns = data.result;
          this.isCalculated = true;
        };
        this.worker2.postMessage({ reacCombine: this.reacCombine });
      };
      this.worker1.postMessage({ defList, combList, reac, reacKeys: this.reacKeys });
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

  }



}
