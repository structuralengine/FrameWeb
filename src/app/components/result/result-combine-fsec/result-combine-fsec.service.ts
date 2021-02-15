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
      result.push(item);
      m = target3['m'];
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
      combList,
      fsec: this.fsec.fsec,
      noticePoints
    };
    /*
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
    */

   const fsec = this.fsec.fsec; 
    // defineのループ
    for(const defNo of Object.keys(defList)){
      const resultFsec = {
        fx_max: {}, fx_min: {}, fy_max: {}, fy_min: {}, fz_max: {}, fz_min: {},
        mx_max: {}, mx_min: {}, my_max: {}, my_min: {}, mz_max: {}, mz_min: {}
      };
      const defines: any[] = defList[defNo];
      for (const caseNo of defines) {
        const force = fsec[caseNo];
        for( const point of force){
          if(point.m.trim().length > 0){
            console.log();
          }
        }
      }
    }

    // combineのループ
    for (const combNo of Object.keys(combList)) {
      const resultFsec = {
        fx_max: {}, fx_min: {}, fy_max: {}, fy_min: {}, fz_max: {}, fz_min: {},
        mx_max: {}, mx_min: {}, my_max: {}, my_min: {}, mz_max: {}, mz_min: {}
      };

      // defineのループ
      const combines: any[] = combList[combNo];
      for (const com of combines) {
        const combineFsec = { fx: {}, fy: {}, fz: {}, mx: {}, my: {}, mz: {} };

        let row: number = 0;
        for (const m of Object.keys(noticePoints)) {
          for (const point of noticePoints[m]) {

            let caseStr: string = '';
            for (const caseInfo of com) {
              if (caseInfo.coef >= 0) {
                caseStr += '+' + caseInfo.caseNo.toString();
              } else {
                caseStr += '-' + caseInfo.caseNo.toString();
              }
              if (!(caseInfo.caseNo in fsec)) {
                for (const key1 of Object.keys(combineFsec)) {
                  for (const key2 of Object.keys(combineFsec[key1])) {
                    combineFsec[key1][key2].case = caseStr;
                  }
                }
                continue;
              }

              const Fsecs: any[] = fsec[caseInfo.caseNo];

              // 同じ部材の同じ着目点位置の断面力を探す
              let f: Object = undefined;
              let mm: string;
              for (const result of Fsecs) {
                mm = result.m.length > 0 ? result.m : mm;
                if (mm === m && point === result.l) {
                  f = result;
                  break;
                }
              }
              if (f === undefined) {
                break;
              }

              // fx, fy … のループ
              for (const key1 of Object.keys(combineFsec)) {
                const value = combineFsec[key1];
                const temp: {} = (row.toString() in value) ? value[row.toString()] : { row, fx: 0, fy: 0, fz: 0, mx: 0, my: 0, mz: 0, case: '' };

                // x, y, z, 変位, 回転角 のループ
                for (const key2 in f) {
                  if (key2 === 'row') {
                    continue;
                  } else if (key2 === 'm') {
                    temp[key2] = m;
                  } else if (key2 === 'l') {
                    temp[key2] = point;
                  } else if (key2 === 'n') {
                    if (this.helper.toNumber(f[key2]) !== null) {
                      temp[key2] = f[key2];
                    }
                  } else {
                    temp[key2] += caseInfo.coef * f[key2];
                  }
                }
                temp['case'] = caseStr;
                value[row.toString()] = temp;
                combineFsec[key1] = value;
                // end key1
              }
              // end caseInfo
            }
            row++;
            // end point
          }
          // end m
        }

        // dx, dy … のループ
        const k: string[] = ['_max', '_min'];
        for (const key1 of Object.keys(combineFsec)) {
          for (let n = 0; n < k.length; n++) {
            let key2: string;
            key2 = key1 + k[n];
            const old = resultFsec[key2];
            const current = combineFsec[key1];
            // 節点番号のループ
            for (const id of Object.keys(current)) {
              if (!(id in old)) {
                old[id] = current[id];
                resultFsec[key2] = old;
                continue;
              }
              const target = current[id];
              const comparison = old[id];
              if ((n === 0 && comparison[key1] < target[key1])
                || (n > 0 && comparison[key1] > target[key1])) {
                old[id] = target;
                resultFsec[key2] = old;
              }
            }
          }
        }

      }
      // fsecCombine[combNo] = resultFsec;
    }

  }

  public getFsecJson(): object {
    return this.fsecCombine;
  }

}
