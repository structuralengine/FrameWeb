import { Injectable } from '@angular/core';
import { ResultReacService } from '../result-reac/result-reac.service';
import { ResultPickupReacService } from '../result-pickup-reac/result-pickup-reac.service';
import { DataHelperModule } from 'src/app/providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class ResultCombineReacService {

  public reacCombine: any;
  public isCalculated: boolean;
  private worker1: Worker;
  private worker2: Worker;
  public reacKeys3D = [
    "tx_max",
    "tx_min",
    "ty_max",
    "ty_min",
    "tz_max",
    "tz_min",
    "mx_max",
    "mx_min",
    "my_max",
    "my_min",
    "mz_max",
    "mz_min",
  ];
  public reacKeys2D = [
    "tx_max",
    "tx_min",
    "ty_max",
    "ty_min",
    "mz_max",
    "mz_min",
  ];
  public titles3D = [
    "x方向の支点反力 最大",
    "x方向の支点反力 最小",
    "y方向の支点反力 最大",
    "y方向の支点反力 最小",
    "z方向の支点反力 最大",
    "Z方向の支点反力 最小",
    "x軸回りの回転反力 最大",
    "x軸回りの回転反力 最小",
    "y軸回りの回転反力 最大",
    "y軸回りの回転反力 最小",
    "z軸回りの回転反力 最大",
    "Z軸回りの回転反力 最小",
  ];
  public titles2D = [
    "x方向の支点反力 最大",
    "x方向の支点反力 最小",
    "y方向の支点反力 最大",
    "y方向の支点反力 最小",
    "z軸回りの回転反力 最大",
    "Z軸回りの回転反力 最小",
  ];
  public reacKeys = this.reacKeys3D || this.reacKeys2D;
  public titles = this.titles3D || this.titles2D
  
  private columns: any;

  constructor(private pickreac: ResultPickupReacService,
              private helper: DataHelperModule) {
    this.clear();
    this.isCalculated = false;
    this.worker1 = new Worker('./result-combine-reac1.worker', { name: 'combine-reac1', type: 'module' });
    this.worker2 = new Worker('./result-combine-reac2.worker', { name: 'combine-reac2', type: 'module' });
  }

  public clear(): void {
    this.reacCombine = {};
  }
  
  // three.js で必要
  public getReacJson(): object {
    return this.reacCombine;
  }

  public getCombineReacColumns(combNo: number, mode: string): any {
    return this.columns[combNo][mode];
  }

  public setReacCombineJson(reac: any, defList: any, combList: any, pickList: any): void {

    this.reacKeys = (this.helper.dimension === 3) ? this.reacKeys3D : this.reacKeys2D ;
    this.titles = (this.helper.dimension === 3) ? this.titles3D : this.titles2D ;

    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker1.onmessage = ({ data }) => {
        this.reacCombine = data.reacCombine;
        console.log('反力reac の 組み合わせ Combine 集計が終わりました', performance.now() - startTime);

        // ピックアップの集計処理を実行する
        this.pickreac.setReacPickupJson(pickList, this.reacCombine);

        // 反力テーブルの集計
        this.worker2.onmessage = ({ data }) => {
          console.log('反力reac の 組み合わせ Combine テーブル集計が終わりました', performance.now() - startTime);
          this.columns = data.result;
          this.isCalculated = true;
        };
        this.worker2.postMessage({ reacCombine: this.reacCombine });
      };
      this.worker1.postMessage({ defList, combList, reac, reacKeys: this.reacKeys });
      // this.worker1_test({ defList, combList, reac, reacKeys: this.reacKeys });
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

  }


  private worker1_test( data ) {
    const defList = data.defList;
    const combList = data.combList;
    const reac = data.reac;
    const reacKeys = data.reacKeys;
    
    // defineのループ
    const reacDefine = {};
    for(const defNo of Object.keys(defList)) {
      const temp = {};
      //
      for(const caseInfo of defList[defNo]) {
        const baseNo: string = Math.abs(caseInfo).toString();
        const coef: number = Math.sign(caseInfo);
  
        if (!(baseNo in reac)) {
          if(caseInfo === 0 ){
            // 値が全て0 の case 0 という架空のケースを用意する
            // 値は coef=0 であるため 0 となる
            reac['0'] = Object.values(reac)[0];
          } else {
            continue;
          }
        }
  
        // カレントケースを集計する
        for (const key of reacKeys) {
          // 節点番号のループ
          const obj = {};
          for (const d of reac[baseNo]) {
            obj[d.id] = {
              tx: coef * d.tx,
              ty: coef * d.ty,
              tz: coef * d.tz,
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
            for (const nodeNo of Object.keys(temp[key])) {
              if(k2==='max'){
                if(temp[key][nodeNo][k1] < obj[nodeNo][k1]){
                  temp[key][nodeNo] = obj[nodeNo];
                }
              } else if (k2==='min'){
                if(temp[key][nodeNo][k1] > obj[nodeNo][k1]){
                  temp[key][nodeNo] = obj[nodeNo];
                }
              }
            }
  
          } else {
            temp[key] = obj;
          }
        }
      }
      reacDefine[defNo] = temp;
    }
  
  
    // combineのループ
    const reacCombine = {};
    for (const combNo of Object.keys(combList)) {
      const temp = {};
      //
      for (const caseInfo of combList[combNo]) {
        const caseNo = Number(caseInfo.caseNo);
        const defNo: string = caseInfo.caseNo.toString();
        const coef: number = caseInfo.coef;
  
        if (!(defNo in reacDefine)) {
          continue;
        }
        if (coef === 0) {
          continue;
        }
  
        const reacs = reacDefine[defNo];
        if(Object.keys(reacs).length < 1) continue;
  
        // カレントケースを集計する
        const c2 = Math.abs(caseNo).toString().trim();
        for (const key of reacKeys){
          // 節点番号のループ
          const obj = {};
          for (const nodeNo of Object.keys(reacs[key])) {
            const d = reacs[key][nodeNo];
            const c1 = Math.sign(coef) < 0 ? -1 : 1 * d.case;
            let caseStr = '';
            if (c1 !== 0){
              caseStr = (c1 < 0 ? "-" : "+") + c2;
            }
            obj[nodeNo] = {
              tx: coef * d.tx,
              ty: coef * d.ty,
              tz: coef * d.tz,
              mx: coef * d.mx,
              my: coef * d.my,
              mz: coef * d.mz,
              case: caseStr
            };
          }
  
          if (key in temp) {
            for (const nodeNo of Object.keys(reacs[key])) {
              if(!(nodeNo in temp[key])){
                temp[key][nodeNo] = { tx: 0, ty: 0, tz: 0,
                  mx: 0, my: 0, mz: 0, case: '' };
              }
              for(const k of Object.keys(obj[nodeNo])){
                  temp[key][nodeNo][k] += obj[nodeNo][k];
                }
                temp[key][nodeNo]['comb']= combNo;
              }
          } else {
            for (const nodeNo of Object.keys(obj)) {
              obj[nodeNo]['comb']= combNo;
            }
            temp[key] = obj;
          }
        }
      }
      reacCombine[combNo] = temp;
    }

    return { reacCombine };
  }



}
