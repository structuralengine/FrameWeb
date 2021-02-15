import { Injectable } from '@angular/core';

import { InputCombineService } from '../components/input/input-combine/input-combine.service';
import { InputDefineService } from '../components/input/input-define/input-define.service';
import { InputLoadService } from '../components/input/input-load/input-load.service';
import { InputPickupService } from '../components/input/input-pickup/input-pickup.service';

import { ResultDisgService } from '../components/result/result-disg/result-disg.service';
import { ResultReacService } from '../components/result/result-reac/result-reac.service';
import { ResultFsecService } from '../components/result/result-fsec/result-fsec.service';
import { ResultCombineDisgService } from '../components/result/result-combine-disg/result-combine-disg.service';
import { ResultCombineReacService } from '../components/result/result-combine-reac/result-combine-reac.service';
import { ResultCombineFsecService } from '../components/result/result-combine-fsec/result-combine-fsec.service';
import { ResultPickupDisgService } from '../components/result/result-pickup-disg/result-pickup-disg.service';
import { ResultPickupReacService } from '../components/result/result-pickup-reac/result-pickup-reac.service';
import { ResultPickupFsecService } from '../components/result/result-pickup-fsec/result-pickup-fsec.service';

import { ThreeSectionForceService } from '../components/three/geometry/three-section-force.service';
import { ThreeReactService } from '../components/three/geometry/three-react.service';
import { ThreeDisplacementService } from '../components/three/geometry/three-displacement.service';

import { DataHelperModule } from './data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class ResultDataService {

  public isCombinePickupChange: boolean;
  constructor(
    private combine: InputCombineService,
    private define: InputDefineService,
    private load: InputLoadService,
    private pickup: InputPickupService,

    public disg: ResultDisgService,
    public reac: ResultReacService,
    public fsec: ResultFsecService,
    public combdisg: ResultCombineDisgService,
    public combreac: ResultCombineReacService,
    public combfsec: ResultCombineFsecService,
    public pickdisg: ResultPickupDisgService,
    public pickreac: ResultPickupReacService,
    public pickfsec: ResultPickupFsecService,

    private three_fsec: ThreeSectionForceService,
    private three_reac: ThreeReactService,
    private three_disg: ThreeDisplacementService,

    private helper: DataHelperModule) {
    this.clear();
  }

  // データをクリアする ///////////////////////////////////////////////////////////////
  public clear(): void {
    this.disg.clear();
    this.reac.clear();
    this.fsec.clear();
    this.combdisg.clear();
    this.combreac.clear();
    this.combfsec.clear();
    this.pickdisg.clear();
    this.pickreac.clear();
    this.pickfsec.clear();
    this.isCombinePickupChange = true;

    // 図をクリアする
    this.three_fsec.ClearData();
    this.three_reac.ClearData();
    this.three_disg.ClearData();
  }


  // 計算結果を読み込む
  public loadResultData(jsonData: object): boolean {

    if ( 'error' in jsonData){
      return false;
    }

    try {
      // 基本ケース
      this.disg.setDisgJson(jsonData);
      this.reac.setReacJson(jsonData);
      this.fsec.setFsecJson(jsonData);

    } catch (e) {
      return false;
    }
    return true;
  }


  public CombinePickup(): void {
    if (this.isCombinePickupChange === false) {
      return;
    }
    const load = this.load.getLoadNameJson(1);
    const define = this.define.getDefineJson();
    const combine = this.combine.getCombineJson();
    const pickup = this.pickup.getPickUpJson();

    // define を集計
    const defList = {};
    if (Object.keys(define).length > 0) {
      // define データが あるとき
      for (const defNo of Object.keys(define)) {
        const d: object = define[defNo];
        const defines = new Array();
        for (const dKey of Object.keys(d)) {
          if( dKey === 'row'){ 
            continue;
          }
          defines.push(d[dKey]);
        }
        defList[defNo] = defines;
      }
    } else {
      // define データがない時は基本ケース＝defineケースとなる
      for (const caseNo of Object.keys(load)) {
        const n: number = this.helper.toNumber(caseNo);
        defList[caseNo] = (n === null) ? [] : new Array(n);
      }
    }
    /*
    // combine を集計
    const combList = {};
    for (const combNo of Object.keys(combine)) {
      const target: object = combine[combNo];
      const combines = new Array([]);
      for (const defKey of Object.keys(target)) {
        if ( defKey === 'row') {
          continue;
        }
        const defNo: string = defKey.replace('C', '').replace('D', '');
        if (!(defNo in defList)) {
          continue; // なければ飛ばす
        }
        const def = defList[defNo];

        // 組み合わせにケース番号を登録する
        let coef: number = this.helper.toNumber(target[defKey]);
        if (coef === null ) {
          continue;
        }

        let count: number = combines.length;
        for (let i = 0; i < count; i++) {
          const base = combines[i];
          console.log("def.length",def.length);

          // defineNo が複数あった場合に配列を複製する
          for (let j = 1; j < def.length; j++)  {
            const oomb = base.slice(0, base.length);

            let caseNo1: string = def[j].toString();
            let coef1: number = coef;
            if ( caseNo1 === '0') {
              combines.push(oomb);
              continue;
            }
            if (caseNo1.indexOf('-') >= 0) {
              caseNo1 = caseNo1.replace('-', '');
              coef1 = -1 * coef1;
            }
            oomb.push({ caseNo: caseNo1, coef: coef1 });
            combines.push(oomb);
          }

          let caseNo: string = def[0].toString();
          if ( caseNo !== '0') { 
            if (caseNo.indexOf('-') >= 0) {
              caseNo = caseNo.replace('-', '');
              coef = -1 * coef;
            }
            base.push({ caseNo, coef });
          }
        }

      }
      combList[combNo] = combines;
    }
    */
    // combine を集計
    const combList = {};
    for (const combNo of Object.keys(combine)) {
      const c: object = combine[combNo];
      const defines = new Array();
      for (const cKey of Object.keys(c)) {
        if( cKey === 'row'){ 
          continue;
        }
        const caseNo: string = cKey.replace('C', '').replace('D', '');
        const coef: number = this.helper.toNumber(c[cKey]);
        if (!(caseNo in defList) || coef === null) {
          continue; // なければ飛ばす
        }
        defines.push({caseNo, coef});
      }
      combList[combNo] = defines;
    }

    // pickup を集計
    const pickList = {};
    for (const pickNo of Object.keys(pickup)) {
      const p: object = pickup[pickNo];
      const combines = new Array();
      for (const pKey of Object.keys(p)) {
        if( pKey === 'row'){ 
          continue;
        }
        const comNo: string = p[pKey];
        if (!(comNo in combList)) {
          continue; // なければ飛ばす
        }
        combines.push(comNo);
      }
      pickList[pickNo] = combines;
    }

    this.combdisg.setDisgCombineJson(defList, combList, pickList);
    this.combreac.setReacCombineJson(defList, combList, pickList);
    this.combfsec.setFsecCombineJson(defList, combList, pickList);
    // this.pickdisg.setDisgPickupJson(pickList);
    // this.pickreac.setReacPickupJson(pickList);
    // this.pickfsec.setFsecPickupJson(pickList);

    this.isCombinePickupChange = false;
  }

  // ピックアップファイル出力
  public GetPicUpText(): string {

    const p = this.pickfsec.fsecPickup;

    let result: string = 'PickUpNo,着目断面力,部材No,最大CaseNo,最小CaseNo,着目点,着目点距離';
    result += ',最大Fx,最大Fy,最大Fz,最大Mx,最大My,最大Mz';
    result += ',最小Fx,最小Fy,最小Fz,最小Mx,最小My,最小Mz';
    result += '\n';

    for (let No = 1; No <= Object.keys(p).length; No++) {

      const c = p[No.toString()];
      const rows: number = Object.keys(c['fx_max']).length;

      for (const symbol of ['fx', 'fy', 'fz', 'mx', 'my', 'mz']) {

        const maxList = c[symbol + '_max'];
        const minList = c[symbol + '_min'];

        let mNo: string;
        let point_counter: number = 0;
        let point_name: string = '';

        for (let row = 1; row <= rows; row++) {
          const r: string = row.toString();
          if ( !(r in maxList) ){
            continue;
          }
          const maxFsec = maxList[row.toString()];
          const minFsec = minList[row.toString()];

          // 部材番号を設定する
          const mm: number = this.helper.toNumber(maxFsec.m);
          if (mm != null) {
            mNo = maxFsec.m;
          } else {
            console.log(mm);
          }

          // 着目点名を設定する
          const nn: number = this.helper.toNumber(maxFsec.n);
          if (nn != null) {
            if ( point_counter === 0 ) {
              point_name = "ITAN";
              point_counter += 1;
            }else {
              point_name = "JTAN";
              point_counter = 0;
            }
          } else {
            point_name = point_counter.toString();
            point_counter += 1;
          }
            

          result += No.toString();
          result += ',';
          result += symbol;
          result += ',';
          result += mNo;
          result += ',';
          result += maxFsec.case;
          result += ',';
          result += minFsec.case;
          result += ',';
          result += point_name;
          result += ',';
          result += maxFsec.l;
          result += ',';

          result += maxFsec.fx;
          result += ',';
          result += maxFsec.fy;
          result += ',';
          result += maxFsec.fz;
          result += ',';

          result += maxFsec.mx;
          result += ',';
          result += maxFsec.my;
          result += ',';
          result += maxFsec.mz;
          result += ',';

          result += minFsec.fx;
          result += ',';
          result += minFsec.fy;
          result += ',';
          result += minFsec.fz;
          result += ',';

          result += minFsec.mx;
          result += ',';
          result += minFsec.my;
          result += ',';
          result += minFsec.mz;

          result += '\n';
        }
      }
    }

    return result;
  }
}
