import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultPickupFsecService {

  public fsecPickup: any;
  public isCalculated: boolean;
  private worker1: Worker;
  private worker2: Worker;
  private columns: any;

  constructor() {
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
        this.fsecPickup = data.fsecPickup;
        console.log('断面力fsec の ピックアップ PickUp 集計が終わりました', performance.now() - startTime);

        // 断面力テーブルの集計
        this.worker2.onmessage = ({ data }) => {
          console.log('断面fsec の ピックアップ PickUp テーブル集計が終わりました', performance.now() - startTime);
          this.columns = data.result;
          this.isCalculated = true;
        };
        this.worker2.postMessage({ fsecPickup: this.fsecPickup });
        
      };
      this.worker1.postMessage({ pickList, fsecCombine });
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

  }

}
