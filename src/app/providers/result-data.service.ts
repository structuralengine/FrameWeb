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

@Injectable({
  providedIn: 'root'
})
export class ResultDataService {

  public isCombinePickupChenge: boolean;
  constructor(
    private combine: InputCombineService,
    private define: InputDefineService,
    private load: InputLoadService,
    private pickup: InputPickupService,

    private disg: ResultDisgService,
    private reac: ResultReacService,
    private fsec: ResultFsecService,
    private combdisg: ResultCombineDisgService,
    private combreac: ResultCombineReacService,
    private combfsec: ResultCombineFsecService,
    private pickdisg: ResultPickupDisgService,
    private pickreac: ResultPickupReacService,
    private pickfsec: ResultPickupFsecService) {
  
      this.isCombinePickupChenge = false;
  }

  // 計算結果 テキスト形式
  public getResultText(): string {

    const jsonData = {};

    jsonData['disg'] = this.disg.getDisgJson();
    jsonData['reac'] = this.reac.getReacJson();
    jsonData['fsec'] = this.fsec.getFsecJson();

    const result: string = JSON.stringify(jsonData);
    return result;
  }

  // 計算結果を読み込む 
  public loadResultData(resultText: string): boolean {
    this.disg.clear();
    this.reac.clear();
    this.fsec.clear();

    let jsonData: {} = null;
    try {
      jsonData = JSON.parse(resultText);
      // 基本ケース
      this.disg.setDisgJson(jsonData);
      this.reac.setReacJson(jsonData);
      this.fsec.setFsecJson(jsonData);
      // 組み合わせケース
      this.CombinePickup();
    } catch (e) {
      return false;
    }
    return true;
  }

  public CombinePickup(): void {

    if (this.isCombinePickupChenge = false) {
      return;
    }
    const load = this.load.getLoadNameJson('calc');
    const define = this.define.getDefineJson('calc');
    const combine = this.combine.getCombineJson('calc');
    const pickup = this.pickup.getPickUpJson('calc');

    // define を集計
    const defList = {};
    if (Object.keys(define).length > 0) {
      for (const defNo of Object.keys(define)) {
        const d: object = define[defNo];
        const defines = new Array();
        for (const dKey of Object.keys(d)) {
          defines.push(d[dKey]);
        }
        defList[defNo] = defines;
      }
    } else {
      for (const caseNo of Object.keys(load)) {
        defList[caseNo] = new Array(caseNo);
      }
    }

    // combine を集計
    const combList = {};
    for (const combNo of Object.keys(combine)) {
      const target: object = combine[combNo];
      const combines = new Array([]);
      for (const defNo of Object.keys(target)) {
        if (!(defNo in defList)) {
          continue; // なければ飛ばす
        }
        const def = defList[defNo];
        const defKeys = Object.keys(def);
        // defineNo が複数あった場合に配列を複製する
        if (defKeys.length > 1) {
          const count: number = combines.length;
          for (let i = 0; i < count; i++) {
            const base = combines[i];
            for (let j = 1; j < defKeys.length; j++) {
              combines.push(base.slice(0, base.length));
            }
          }
        }
        // 組み合わせにケース番号を登録する
        let coef = target[defNo]
        let j = 0;
        for (let i = 0; i < combines.length; i++) {
          let caseNo: string = def[defKeys[j]];
          if (caseNo.indexOf('-') >= 0) {
            caseNo = caseNo.replace('-', '');
            coef = -1 * coef;
          }
          combines[i].push({ caseNo: caseNo, coef: coef });
          j++;
          if (j === defKeys.length) {
            j = 0;
          }
        }
      }
      combList[combNo] = combines;
    }


    // pickup を集計
    const pickList = {};
    for (const pickNo of Object.keys(pickup)) {
      const p: object = pickup[pickNo];
      const combines = new Array();
      for (const pKey of Object.keys(p)) {
        const comNo: string = p[pKey];
        if (!(comNo in combList)) {
          continue; // なければ飛ばす
        }
        combines.push(comNo);
      }
      pickList[pickNo] = combines;
    }

    this.combdisg.setDisgCombineJson(combList);
    this.combreac.setReacCombineJson(combList);
    this.combfsec.setFsecCombineJson(combList);
    this.pickdisg.setDisgPickupJson(pickList);
    this.pickreac.setReacPickupJson(pickList);
    this.pickfsec.setFsecPickupJson(pickList);

    this.isCombinePickupChenge = false;
  }

}
