import { Injectable } from '@angular/core';
import { ThreeReactService } from '../../three/geometry/three-react.service';
import { ResultCombineReacService } from '../result-combine-reac/result-combine-reac.service';

@Injectable({
  providedIn: 'root'
})
export class ResultReacService {

  public isCalculated: boolean;
  public reac: any;
  private worker1: Worker;
  private worker2: Worker;
  private columns: any; // 表示用

  constructor(private comb: ResultCombineReacService,
              private three: ThreeReactService) {
    this.clear();
    this.worker1 = new Worker('./result-reac1.worker', { name: 'result-reac1', type: 'module' });
    this.worker2 = new Worker('./result-reac2.worker', { name: 'result-reac2', type: 'module' });
  }

  public clear(): void {
    this.reac = {};
    this.isCalculated = false;
  }

  public getReacColumns(typNo: number): any {
    const key: string = typNo.toString();
    return (key in this.columns) ? this.columns[key] : new Array();
}

  // three-section-force.service から呼ばれる
  public getReacJson(): object {
    return this.reac;
  }
  
  // サーバーから受領した 解析結果を集計する
  public setReacJson(jsonData: {}, defList: any, combList: any, pickList: any): void {

    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new

      this.worker1.onmessage = ({ data }) => {
        if (data.error === null) {
          console.log('反力の集計が終わりました', performance.now() - startTime);
          this.reac = data.reac;

          // 組み合わせの集計処理を実行する
          this.comb.setReacCombineJson(this.reac, defList, combList, pickList);

          // 反力テーブルの集計
          this.worker2.onmessage = ({ data }) => {
            if (data.error === null) {
              console.log('反力テーブルの集計が終わりました', performance.now() - startTime);
              this.columns = data.table;
              this.isCalculated = true;
            } else {
              console.log('反力テーブルの集計に失敗しました', data.error);
            }
          };
          this.worker2.postMessage({ reac: this.reac });
          this.three.setResultData(this.reac);

        } else {
          console.log('反力の集計に失敗しました', data.error);
        }
      };
      this.worker1.postMessage({ jsonData });

    } else {
      console.log('反力の生成に失敗しました');
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

}
