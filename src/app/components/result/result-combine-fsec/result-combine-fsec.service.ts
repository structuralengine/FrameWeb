import { Injectable } from '@angular/core';
import { ResultFsecService } from '../result-fsec/result-fsec.service';
import { ResultPickupFsecService } from '../result-pickup-fsec/result-pickup-fsec.service';

import { InputMembersService } from '../../input/input-members/input-members.service';
import { InputNoticePointsService } from '../../input/input-notice-points/input-notice-points.service';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class ResultCombineFsecService {

  public fsecCombine: any;
  public isChange: boolean;
  private worker: Worker;

  constructor(private fsec: ResultFsecService,
              private pickfsec: ResultPickupFsecService,
              private member: InputMembersService,
              private notice: InputNoticePointsService,
              private helper: DataHelperModule) {
    this.clear();
    this.isChange = true;
    this.worker = new Worker('./result-combine-fsec.worker', { name: 'combine-fsec', type: 'module' });
  }

  public clear(): void {
    this.fsecCombine = {};
  }

  public getCombineFsecColumns(combNo: number, mode: string): any {

    // 組み合わせを探す
    let target1: any[] = new Array();
    if (combNo in this.fsecCombine) {
      target1 = this.fsecCombine[combNo];
    }

    // 着目項目を探す
    let target2 = {};
    if (mode in target1) {
      target2 = target1[mode];
    }

    const result: any[] = new Array();
    let m: string = null;
    const old = {};
    for (const k of Object.keys(target2)) {
      const target3 = target2[k];
      const item = {
        m: (m === target3['m']) ? '' : target3['m'],
        n: ('n' in target3) ? target3['n'] : '',
        l: target3['l'].toFixed(3),
        fx: target3['fx'].toFixed(2),
        fy: target3['fy'].toFixed(2),
        fz: target3['fz'].toFixed(2),
        mx: target3['mx'].toFixed(2),
        my: target3['my'].toFixed(2),
        mz: target3['mz'].toFixed(2),
        case: target3['case']
      };
      // 同一要素内の着目点で、直前の断面力と同じ断面力だったら 読み飛ばす
      if (old['n'] !== item['n'] || old['fx'] !== item['fx'] || old['fy'] !== item['fy'] || old['fz'] !== item['fz']
          || old['mx'] !== item['mx'] || old['my'] !== item['my'] || old['mz'] !== item['mz']) {
        result.push(item);
        m = target3['m'];
        Object.assign(old, item);
      }
    }
    return result;

  }

  public setFsecCombineJson(defList: any, combList: any, pickList: any): void {

    // 全ケースで共通する着目点のみ対象とする
    const noticePoints = {};
    const np = this.notice.getNoticePointsJson();
    const membData = this.member.getMemberJson(0);
    const membKeys = Object.keys(membData);
    for(const key of membKeys){
      const m = membData[key];
      const Length: number = this.member.getMemberLength(key);
      const notice = np.find((data) => {
        return data.m === key;
      })
      const points: number[] = new Array();
      points.push(0);
      if (notice !== undefined) {
        for ( const p of notice.Points){
          points.push(p);
        }
      }
      points.push(Length);
      noticePoints[key] = points;
    }


    const postData = {
      defList,
      combList,
      fsec: this.fsec.fsec,
      noticePoints
    };

    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker.onmessage = ({ data }) => {
        this.fsecCombine = data.fsecCombine;
        this.isChange = false;
        console.log('断面fsec の 組み合わせ Combine 集計が終わりました', performance.now() - startTime);
        this.pickfsec.setFsecPickupJson(pickList, this.fsecCombine);
      };
      this.worker.postMessage(postData);
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }


  }

  public getFsecJson(): object {
    return this.fsecCombine;
  }

}
