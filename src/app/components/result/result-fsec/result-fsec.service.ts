import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { InputMembersService } from '../../input/input-members/input-members.service';
import { ThreeSectionForceService } from '../../three/geometry/three-section-force/three-section-force.service';
import { ResultCombineFsecService } from '../result-combine-fsec/result-combine-fsec.service';

@Injectable({
  providedIn: 'root'
})
export class ResultFsecService {

  public isCalculated: boolean;
  private fsec: any;
  private worker1: Worker;
  private worker2: Worker;
  private columns: any;

  constructor(public member: InputMembersService,
              public comb: ResultCombineFsecService,
              private three: ThreeSectionForceService,
              private helper: DataHelperModule) {
    this.clear();
    this.worker1 = new Worker('./result-fsec1.worker', { name: 'result-fsec1', type: 'module' });
    this.worker2 = new Worker('./result-fsec2.worker', { name: 'result-fsec2', type: 'module' });
  }

  public clear(): void {
    this.fsec = {};
    this.isCalculated = false;
  }

  public getFsecColumns(typNo: number): any {
    const key: string = typNo.toString();
    return (key in this.columns) ? this.columns[key] : new Array();
  }

  // three-section-force.service から呼ばれる
  public getFsecJson(): object {
    return this.fsec;
  }

  // サーバーから受領した 解析結果を集計する
  public setFsecJson(jsonData: {}, defList: any, combList: any, pickList: any): void {

    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new

      this.worker1.onmessage = ({ data }) => {
        if (data.error === null) {
          console.log('断面力の集計が終わりました', performance.now() - startTime);
          this.fsec = data.fsec;
          const max_values = data.max_values;
          // 組み合わせの集計処理を実行する
          this.comb.setFsecCombineJson(this.fsec, defList, combList, pickList);

          // 断面力テーブルの集計
          this.worker2.onmessage = ({ data }) => {
            if (data.error === null) {
              console.log('断面力テーブルの集計が終わりました', performance.now() - startTime);
              this.columns = data.table;
              this.isCalculated = true;
            } else {
              console.log('断面力テーブルの集計に失敗しました', data.error);
            }
          };
          this.worker2.postMessage({fsec: this.fsec});
          this.three.setResultData(this.fsec, max_values);

        } else {
          console.log('断面力の集計に失敗しました', data.error);
        }
      };

      this.worker1.postMessage({ jsonData, member: this.member.member, dimension: this.helper.dimension });

    } else {
      console.log('断面力の生成に失敗しました');
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

  }

}
