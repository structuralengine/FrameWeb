import { Injectable } from '@angular/core';

import { ResultPickupFsecService } from '../result-pickup-fsec/result-pickup-fsec.service';
import { InputMembersService } from '../../input/input-members/input-members.service';
import { InputNoticePointsService } from '../../input/input-notice-points/input-notice-points.service';

@Injectable({
  providedIn: 'root'
})
export class ResultCombineFsecService {

  public fsecCombine: any;
  public isCalculated: boolean;
  private worker1: Worker;
  private worker2: Worker;
  public fsecKeys = [
    "fx_max",
    "fx_min",
    "fy_max",
    "fy_min",
    "fz_max",
    "fz_min",
    "mx_max",
    "mx_min",
    "my_max",
    "my_min",
    "mz_max",
    "mz_min",
  ];
  public titles = [
    "軸方向力 最大",
    "軸方向力 最小",
    "y方向のせん断力 最大",
    "y方向のせん断力 最小",
    "z方向のせん断力 最大",
    "z方向のせん断力 最小",
    "ねじりモーメント 最大",
    "ねじりモーメント 最小",
    "y軸回りの曲げモーメント 最大",
    "y軸回りの曲げモーメント力 最小",
    "z軸回りの曲げモーメント 最大",
    "z軸回りの曲げモーメント 最小",
  ];

  private columns: any;
 

  constructor(private pickfsec: ResultPickupFsecService) {
    this.clear();
    this.isCalculated = false;
    this.worker1 = new Worker('./result-combine-fsec1.worker', { name: 'combine-fsec1', type: 'module' });
    this.worker2 = new Worker('./result-combine-fsec2.worker', { name: 'combine-fsec2', type: 'module' });
  }

  public clear(): void {
    this.fsecCombine = {};
  }
  
  // three.js で必要
  public getFsecJson(): object {
    return this.fsecCombine;
  }

  public getCombineFsecColumns(combNo: number, mode: string): any {
    return this.columns[combNo][mode];
  }

  public setFsecCombineJson(fsec: any, defList: any, combList: any, pickList: any): void {

    this.isCalculated = false;
    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker1.onmessage = ({ data }) => {
        this.fsecCombine = data.fsecCombine;
        console.log('断面fsec の 組み合わせ Combine 集計が終わりました', performance.now() - startTime);

        // ピックアップの集計処理を実行する
        this.pickfsec.setFsecPickupJson(pickList, this.fsecCombine);

        // 断面力テーブルの集計
        this.worker2.onmessage = ({ data }) => {
          console.log('断面fsec の 組み合わせ Combine テーブル集計が終わりました', performance.now() - startTime);
          this.columns = data.result;
          this.isCalculated = true;
        };
        this.worker2.postMessage({fsecCombine: this.fsecCombine});
        
      };
      this.worker1.postMessage({ defList, combList, fsec, fsecKeys: this.fsecKeys});

    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }


  }

}
