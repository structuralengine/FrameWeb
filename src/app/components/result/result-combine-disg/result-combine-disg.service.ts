import { Injectable } from '@angular/core';
import { ResultDisgService } from '../result-disg/result-disg.service';
import { ResultPickupDisgService } from '../result-pickup-disg/result-pickup-disg.service';

@Injectable({
  providedIn: 'root'
})
export class ResultCombineDisgService {

  public disgCombine: any;
  public isCalculated: boolean;
  private worker1: Worker;
  private worker2: Worker;
  public disgKeys = [
    "dx_max",
    "dx_min",
    "dy_max",
    "dy_min",
    "dz_max",
    "dz_min",
    "rx_max",
    "rx_min",
    "ry_max",
    "ry_min",
    "rz_max",
    "rz_min",
  ];
  public titles = [
    "x方向の移動量 最大",
    "x方向の移動量 最小",
    "y方向の移動量 最大",
    "y方向の移動量 最小",
    "z方向の移動量 最大",
    "Z方向の移動量 最小",
    "x軸回りの回転角 最大",
    "x軸回りの回転角 最小",
    "y軸回りの回転角 最大",
    "y軸回りの回転角 最小",
    "z軸回りの回転角 最大",
    "Z軸回りの回転角 最小",
  ];

  private columns: any;

  constructor(private pickdisg: ResultPickupDisgService) {
    this.clear();
    this.isCalculated = false;
    this.worker1 = new Worker('./result-combine-disg1.worker', { name: 'combine-disg1', type: 'module' });
    this.worker2 = new Worker('./result-combine-disg2.worker', { name: 'combine-disg2', type: 'module' });
  }

  public clear(): void {
    this.disgCombine = {};
  }

  // three.js で必要
  public getDisgJson(): object {
    return this.disgCombine;
  }

  public getCombineDisgColumns(combNo: number, mode: string): any {
    return this.columns[combNo][mode];
  }

  public setDisgCombineJson(disg: any, defList: any, combList: any, pickList: any): void {

    const postData = {
      defList,
      combList,
      disg
    };

    const startTime = performance.now(); // 開始時間
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker1.onmessage = ({ data }) => {
        this.disgCombine = data.disgCombine;
        console.log('変位disg の 組み合わせ Combine 集計が終わりました', performance.now() - startTime);

        // ピックアップの集計処理を実行する
        this.pickdisg.setDisgPickupJson(pickList, this.disgCombine);

        // 断面力テーブルの集計
        this.worker2.onmessage = ({ data }) => {
          console.log('変位disg の 組み合わせ Combine テーブル集計が終わりました', performance.now() - startTime);
          this.columns = data.result;
          this.isCalculated = true;
        };
        this.worker2.postMessage({ disgCombine: this.disgCombine });

      };
      // this.disgCombine = this.worker1_test(defList, combList, disg, this.disgKeys );
      this.worker1.postMessage({ defList, combList, disg, disgKeys: this.disgKeys });
    } else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }

  }

  private worker1_test(defList: any, combList: any, disg: any, disgKeys: string[]) {
  
    // defineのループ
    const disgDefine = {};
    for(const defNo of Object.keys(defList)) {
      const temp = {};
      //
      for(const caseInfo of defList[defNo]) {
        const baseNo: string = Math.abs(caseInfo).toString();
        const coef: number = Math.sign(caseInfo);
  
        if (!(baseNo in disg)) {
          if(caseInfo === 0 ){
            // 値が全て0 の case 0 という架空のケースを用意する
            // 値は coef=0 であるため 0 となる
            disg['0'] = Object.values(disg)[0];
          } else {
            continue;
          }
        }
  
        // カレントケースを集計する
        for (const key of disgKeys) {
          // 節点番号のループ
          const obj = {};
          for (const d of disg[baseNo]) {
            obj[d.id] = {
              dx: coef * d.dx,
              dy: coef * d.dy,
              dz: coef * d.dz,
              rx: coef * d.rx,
              ry: coef * d.ry,
              rz: coef * d.rz,
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
      disgDefine[defNo] = temp;
    }
  
  
    // combineのループ
    const disgCombine = {};
    for (const combNo of Object.keys(combList)) {
      const temp = {};
      //
      for (const caseInfo of combList[combNo]) {
        const caseNo = Number(caseInfo.caseNo);
        const defNo: string = caseInfo.caseNo.toString();
        const coef: number = caseInfo.coef;
  
        if (!(defNo in disgDefine)) {
          continue;
        }
        if (coef === 0) {
          continue;
        }
  
        const disgs = disgDefine[defNo];
        // カレントケースを集計する
        const c2 = Math.abs(caseNo).toString().trim();
        for (const key of disgKeys){
          // 節点番号のループ
          const obj = {};
          for (const nodeNo of Object.keys(disgs[key])) {
            const d = disgs[key][nodeNo];
            const c1 = Math.sign(coef) < 0 ? -1 : 1 * d.case;
            let caseStr = '';
            if (c1 !== 0){
              caseStr = (c1 < 0 ? "-" : "+") + c2;
            }
            obj[nodeNo] = {
              dx: coef * d.dx,
              dy: coef * d.dy,
              dz: coef * d.dz,
              rx: coef * d.rx,
              ry: coef * d.ry,
              rz: coef * d.rz,
              case: caseStr,
            };
          }
  
          if (key in temp) {
            for (const nodeNo of Object.keys(disgs[key])) {
                for(const k of Object.keys(obj[nodeNo])){
                  temp[key][nodeNo][k] += obj[nodeNo][k];
                }
            }
          } else {
            temp[key] = obj;
          }
        }
      }
      disgCombine[combNo] = temp;
    }
  
    return{ disgCombine };
  }

}
