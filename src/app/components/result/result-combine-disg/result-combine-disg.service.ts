import { Injectable } from '@angular/core';
import { ResultDisgService } from '../result-disg/result-disg.service';
import { ResultPickupDisgService } from '../result-pickup-disg/result-pickup-disg.service';

@Injectable({
  providedIn: 'root'
})
export class ResultCombineDisgService {

  public disgCombine: any;
  public isChange: boolean;
  private worker: Worker;

  constructor(private disg: ResultDisgService,
              private pickdisg: ResultPickupDisgService) {
    this.clear();
    this.isChange = true;
    this.worker = new Worker('./result-combine-disg.worker', { name: 'combine-disg', type: 'module' });
  }

  public clear(): void {
    this.disgCombine = {};
  }


  public getCombineDisgColumns(combNo: number, mode: string): any {

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

  public setDisgCombineJson(defList: any, combList: any, pickList: any): void {

    const postData = {
      defList,
      combList,
      disg: this.disg.disg
    };

    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker.onmessage = ({ data }) => {
        this.disgCombine = data.disgCombine;
        this.isChange = false;
        console.log('変位disg の 組み合わせ Combine 集計が終わりました', performance.now() - startTime);
        this.pickdisg.setDisgPickupJson(pickList, this.disgCombine);
      };
      this.worker.postMessage(postData);
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

  }

}
