import { Injectable } from "@angular/core";
import { ThreeDisplacementService } from "../../three/geometry/three-displacement.service";
import { ResultCombineDisgService } from "../result-combine-disg/result-combine-disg.service";

@Injectable({
  providedIn: "root",
})
export class ResultDisgService {

  public isCalculated: boolean;
  public disg: any;
  private worker1: Worker;
  private worker2: Worker;
  private columns: any; // 表示用

  constructor(private comb: ResultCombineDisgService,
              private three: ThreeDisplacementService
              ){
    this.clear();
    this.worker1 = new Worker('./result-disg1.worker', { name: 'result-disg1', type: 'module' });
    this.worker2 = new Worker('./result-disg2.worker', { name: 'result-disg2', type: 'module' });
  }

  public clear(): void {
    this.disg = {};
    this.isCalculated = false;
  }

  public getDisgColumns(typNo: number): any {
    const key: string = typNo.toString();
    return (key in this.columns) ? this.columns[key] : new Array();
  }

  public setDisgJson(jsonData: {}, defList: any, combList: any, pickList: any): void {

    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new

      this.worker1.onmessage = ({ data }) => {
        if (data.error === null) {
          console.log('変位量の集計が終わりました', performance.now() - startTime);
          this.disg = data.disg;

          // 組み合わせの集計処理を実行する
          this.comb.setDisgCombineJson(this.disg, defList, combList, pickList);
          
          // 変位量テーブルの集計
          this.worker2.onmessage = ({ data }) => {
            if (data.error === null) {
              console.log('変位量テーブルの集計が終わりました', performance.now() - startTime);
              this.columns = data.table;
              this.isCalculated = true;
            } else {
              console.log('変位量テーブルの集計に失敗しました', data.error);
            }
          };
          this.worker2.postMessage({ disg: this.disg });
          this.three.setResultData(this.disg);

        } else {
          console.log('変位量の集計に失敗しました', data.error);
        }
      };
      this.worker1.postMessage({ jsonData });

    } else {
      console.log('変位量の生成に失敗しました');
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

  }

  private worker_test(data) {

    const disg = data.disg;
    const table = {};
    let error: any = null;

    // html table 用の変数を用意する
    try {

      for (const typNo of Object.keys(disg)) {
        if(typNo === 'max_value'){
          continue;
        }
        // タイプ番号を探す
        const target = disg[typNo];

        // 行を探す
        const result: any[] = new Array();
        for (const item of target) {
          const dx = item.dx === null ? 0 : Math.round(10000 * item.dx) / 10000;
          const dy = item.dy === null ? 0 : Math.round(10000 * item.dy) / 10000;
          const dz = item.dz === null ? 0 : Math.round(10000 * item.dz) / 10000;
          const rx = item.rx === null ? 0 : Math.round(10000 * item.rx) / 10000;
          const ry = item.ry === null ? 0 : Math.round(10000 * item.ry) / 10000;
          const rz = item.rz === null ? 0 : Math.round(10000 * item.rz) / 10000;
          result.push({
            id: item.id,
            dx: dx.toFixed(4),
            dy: dy.toFixed(4),
            dz: dz.toFixed(4),
            rx: rx.toFixed(4),
            ry: ry.toFixed(4),
            rz: rz.toFixed(4),
          });
        }
        table[typNo] = result;
      }
    } catch (e) {
      error = e;
    }

    return { table, error };
  }

}
