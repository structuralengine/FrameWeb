import { Injectable } from '@angular/core';
import { ResultReacService } from '../result-reac/result-reac.service';
import { ResultPickupReacService } from '../result-pickup-reac/result-pickup-reac.service';

@Injectable({
  providedIn: 'root'
})
export class ResultCombineReacService {

  public reacCombine: any;
  public isChange: boolean;
  private worker: Worker;

  constructor( private pickreac: ResultPickupReacService) {
    this.clear();
    this.isChange = true;
    this.worker = new Worker('./result-combine-reac.worker', { name: 'combine-reac', type: 'module' });
  }

  public clear(): void {
    this.reacCombine = {};
  }
  
  public getCombineReacColumns(combNo: number, mode: string): any {

    // 組み合わせを探す
    let target1: any[] = new Array();
    if (combNo in this.reacCombine) {
      target1 = this.reacCombine[combNo];
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
        tx: target3['tx'].toFixed(2),
        ty: target3['ty'].toFixed(2),
        tz: target3['tz'].toFixed(2),
        mx: target3['mx'].toFixed(2),
        my: target3['my'].toFixed(2),
        mz: target3['mz'].toFixed(2),
        case: target3['case']
      };
      result.push(item);
    }

    return result;
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
      this.worker.onmessage = ({ data }) => {
        this.reacCombine = data.reacCombine;
        this.isChange = false;
        console.log('反力reac の 組み合わせ Combine 集計が終わりました', performance.now() - startTime);
        this.pickreac.setReacPickupJson(pickList, this.reacCombine);
      };
      this.worker.postMessage(postData);
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

  }
}
