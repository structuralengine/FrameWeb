import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultPickupReacService {

  public reacPickup: any;
  public isCalculated : boolean;
  private worker1: Worker;
  private worker2: Worker;
  private columns: any;

  constructor() { 
    this.clear();
    this.isCalculated  = false;
    this.worker1 = new Worker('./result-pickup-reac1.worker', { name: 'pickup-reac1', type: 'module' });
    this.worker2 = new Worker('./result-pickup-reac2.worker', { name: 'pickup-reac2', type: 'module' });
  }

  public clear(): void {
    this.reacPickup = {};
  }

  // three.js で必要
  public getReacJson(): object {
    return this.reacPickup;
  }

  public getPickupReacColumns(combNo: number, mode: string): any {
    return this.columns[combNo][mode];
  }

  public setReacPickupJson(pickList: any, reacCombine: any): void {

    this.isCalculated = false;
    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker1.onmessage = ({ data }) => {
        this.reacPickup = data.reacPickup;
        console.log('反力reac の ピックアップ PickUp 集計が終わりました', performance.now() - startTime);

        // 断面力テーブルの集計
        this.worker2.onmessage = ({ data }) => {
          console.log('反力reac の ピックアップ PickUp テーブル集計が終わりました', performance.now() - startTime);
          this.columns = data.result;
          this.isCalculated = true;
        };
        this.worker2.postMessage({ reacPickup: this.reacPickup });
        //this.columns = this.work2_test({ reacPickup: this.reacPickup });

      };
      this.worker1.postMessage({ pickList, reacCombine });
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

  }

}
