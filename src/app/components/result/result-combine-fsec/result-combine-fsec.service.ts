import { Injectable } from '@angular/core';

import { ResultPickupFsecService } from '../result-pickup-fsec/result-pickup-fsec.service';
import { InputMembersService } from '../../input/input-members/input-members.service';
import { InputNoticePointsService } from '../../input/input-notice-points/input-notice-points.service';
import { ThreeSectionForceService } from '../../three/geometry/three-section-force/three-section-force.service';
import { DataHelperModule } from 'src/app/providers/data-helper.module';

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
 

  constructor(private pickfsec: ResultPickupFsecService,
              private three: ThreeSectionForceService,
              private helper: DataHelperModule) {
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
        console.log('断面fsec の 組み合わせ Combine 集計が終わりました', performance.now() - startTime);
        this.fsecCombine = data.fsecCombine;
        const max_values = data.max_values;

        // ピックアップの集計処理を実行する
        this.pickfsec.setFsecPickupJson(pickList, this.fsecCombine);

        // 断面力テーブルの集計
        this.worker2.onmessage = ({ data }) => {
          console.log('断面fsec の 組み合わせ Combine テーブル集計が終わりました', performance.now() - startTime);
          this.columns = data.result;
          this.isCalculated = true;
        };
        this.worker2.postMessage({fsecCombine: this.fsecCombine});
        this.three.setCombResultData(this.fsecCombine, max_values);

      };
      //this.fsecCombine = this.worker1_test({ defList, combList, fsec, fsecKeys: this.fsecKeys});
      this.worker1.postMessage({ defList, combList, fsec, fsecKeys: this.fsecKeys});

    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }


  }



  private worker1_test(data){

    const defList = data.defList;
    const combList = data.combList;
    const fsec = data.fsec;
    const fsecKeys = data.fsecKeys;
  
    // 全ケースに共通する着目点のみ対象とするために削除する id を記憶
    const delList = [];
  
    // defineのループ
    const fsecDefine = {};
    for (const defNo of Object.keys(defList)) {
      const temp = {};
      //
      for (const caseInfo of defList[defNo]) {
        const baseNo: string = Math.abs(caseInfo).toString();
        const coef: number = Math.sign(caseInfo);
  
        if (!(baseNo in fsec)) {
          if(caseInfo === 0 ){
            // 値が全て0 の case 0 という架空のケースを用意する
            // 値は coef=0 であるため 0 となる
            fsec['0'] = Object.values(fsec)[0];
          } else {
            continue;
          }
        }
  
        // カレントケースを集計する
        for (const key of fsecKeys) {
          // 節点番号のループ
          const obj = {};
          let m: string;
          for (const d of fsec[baseNo]) {
            if(d.m.length> 0){
              m = d.m;
            }
            let id = m + '-' + d.l.toFixed(3);
            obj[id] = {
              m: d.m,
              l: d.l,
              n: d.n,
              fx: coef * d.fx,
              fy: coef * d.fy,
              fz: coef * d.fz,
              mx: coef * d.mx,
              my: coef * d.my,
              mz: coef * d.mz,
              case: caseInfo,
            };
          }
  
          if (key in temp) {
            // 大小を比較する
            const kk = key.split('_');
            const k1 = kk[0]; // dx, dy, dz, rx, ry, rz
            const k2 = kk[1]; // max, min
  
            for (const id of Object.keys(temp[key])) {
              if (!(id in obj)) {
                delList.push(id);
                continue;
              }
              if (k2 === 'max') {
                if (temp[key][id][k1] < obj[id][k1]) {
                  temp[key][id] = obj[id];
                }
              } else if (k2 === 'min') {
                if (temp[key][id][k1] > obj[id][k1]) {
                  temp[key][id] = obj[id];
                }
              }
            }
          } else {
            temp[key] = obj;
          }
        }
      }
      fsecDefine[defNo] = temp;
    }
  
    // 全ケースに共通する着目点のみ対象とするため
    // 削除する
    for (const id of Array.from(new Set(delList))) {
      for (const defNo of Object.keys(fsecDefine)) {
        for (const temp of fsecDefine[defNo]) {
          for (const key of Object.keys(temp)) {
            const obj = temp[key];
            delete obj[id];
          }
        }
      }
    }
  
    // combineのループ
    const max_values = {};
    const fsecCombine = {};
    for (const combNo of Object.keys(combList)) {
      const max_value = {
        fx: 0, fy: 0, fz: 0,
        mx: 0, my: 0, mz: 0
      }
      const temp = {};
      //
      for (const caseInfo of combList[combNo]) {
        const caseNo = Number(caseInfo.caseNo);
        const defNo: string = caseInfo.caseNo.toString();
        const coef: number = caseInfo.coef;
  
        if (!(defNo in fsecDefine)) {
          continue;
        }
        if (coef === 0) {
          continue;
        }
  
        const fsecs = fsecDefine[defNo];
        // カレントケースを集計する
        const c2 = Math.abs(caseNo).toString().trim();
        for (const key of fsecKeys) {
          // 節点番号のループ
          const obj1 = [];
          for (const id of Object.keys(fsecs[key])) {
            const d = fsecs[key][id];
            const c1 = Math.sign(coef) < 0 ? -1 : 1 * d.case;
            let caseStr = '';
            if (c1 !== 0){
              caseStr = (c1 < 0 ? "-" : "+") + c1;
            }
            obj1.push({
              m: d.m,
              l: d.l,
              n: d.n,
              fx: coef * d.fx,
              fy: coef * d.fy,
              fz: coef * d.fz,
              mx: coef * d.mx,
              my: coef * d.my,
              mz: coef * d.mz,
              case: caseStr
            });
          }
          if (key in temp) {
            for (let row = 0; row < obj1.length; row++) {
              for (const k of Object.keys(obj1[row])) {
                const value = obj1[row][k];
                if (k === 'm' || k === 'l') {
                  temp[key][row][k] = value;
                } else if (k === 'n') {
                  temp[key][row][k] = (this.helper.toNumber(value) !== null) ? value : '';
                } else {
                  temp[key][row][k] += value;
                }
              }
              temp[key][row]['comb']= combNo;
            }
          } else {
            for (const obj of obj1) {
              obj['comb']= combNo;
            }
            temp[key] = obj1;
          }
  
          // 最大値を 集計する
          for (const value of temp[key]) {
            max_value.fx = Math.max(Math.abs(value.fx), max_value.fx);
            max_value.fy = Math.max(Math.abs(value.fy), max_value.fy);
            max_value.fz = Math.max(Math.abs(value.fz), max_value.fz);
            max_value.mx = Math.max(Math.abs(value.mx), max_value.mx);
            max_value.my = Math.max(Math.abs(value.my), max_value.my);
            max_value.mz = Math.max(Math.abs(value.mz), max_value.mz);
          }        
        }
      }
      fsecCombine[combNo] = temp;
      max_values[combNo] = max_value;
    }
  
    return { fsecCombine, max_values };
  
  
  }

}
