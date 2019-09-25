import { Injectable } from '@angular/core';
import { FrameDataService } from './frame-data.service';
import { InputDataService } from './input-data.service';
import { ResultDataService } from './result-data.service';

@Injectable({
  providedIn: 'root'
})
export class ReadDataService {

  isCombinePickupChenge: boolean;

  constructor(private frame: FrameDataService,
    private input: InputDataService,
    private result: ResultDataService) {
    }

    public clear(): void {
      this.result.clear();
      this.isCombinePickupChenge = true;
    }

  ////////////////////////////////////////////////////////////////////////////////////
  // ファイルを読み込む ////////////////////////////////////////////////////////////////
  /*
  public loadInputData(inputText: string): void {
    this.input.clear();
    const jsonData: {} = JSON.parse(inputText);
    this.setNodeJson(jsonData);
    this.setFixNodeJson(jsonData);
    this.setMemberJson(jsonData);
    this.setElementJson(jsonData);
    this.setJointJson(jsonData);
    this.setNoticePointsJson(jsonData);
    this.setFixMemberJson(jsonData);
    this.setLoadJson(jsonData);
    this.setDefineJson(jsonData);
    this.setCombineJson(jsonData);
    this.setPickUpJson(jsonData);
  }
  */

  ////////////////////////////////////////////////////////////////////////////////////
  // 計算結果を読み込む ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////
  public loadResultData(resultText: string): boolean {
    this.result.clear();
    let jsonData: {} = null;
    try {
      jsonData = JSON.parse(resultText);
      // 基本ケース
      this.setDisgJson(jsonData);
      this.setReacJson(jsonData);
      this.setFsecJson(jsonData);
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
    const load = this.frame.getLoadNameJson('calc');
    const define = this.frame.getDefineJson('calc');
    const combine = this.frame.getCombineJson('calc');
    const pickup = this.frame.getPickUpJson('calc');

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

    this.setDisgCombineJson(combList);
    this.setReacCombineJson(combList);
    this.setFsecCombineJson(combList);
    this.setDisgPickupJson(pickList);
    this.setReacPickupJson(pickList);
    this.setFsecPickupJson(pickList);

    this.isCombinePickupChenge = false;
  }

  private setDisgJson(jsonData: {}): void {
    let max_row = 0;
    for (const caseNo of Object.keys(jsonData)) {
      const target = new Array();
      const caseData: {} = jsonData[caseNo];
      if (typeof (caseData) !== 'object') {
        continue;
      }
      if (!('disg' in caseData)) {
        continue;
      }
      const json: {} = caseData['disg'];
      for (const n of Object.keys(json)) {
        const item: {} = json[n];

        let dx: number = this.frame.toNumber(item['dx']);
        let dy: number = this.frame.toNumber(item['dy']);
        let dz: number = this.frame.toNumber(item['dz']);
        let rx: number = this.frame.toNumber(item['rx']);
        let ry: number = this.frame.toNumber(item['ry']);
        let rz: number = this.frame.toNumber(item['rz']);
        dx = (dx == null) ? 0 : dx;
        dy = (dy == null) ? 0 : dy;
        dz = (dz == null) ? 0 : dz;
        rx = (rx == null) ? 0 : rx;
        ry = (ry == null) ? 0 : ry;
        rz = (rz == null) ? 0 : rz;
        const result = {
          id: n,
          dx: dx.toFixed(3),
          dy: dy.toFixed(3),
          dz: dz.toFixed(3),
          rx: rx.toFixed(3),
          ry: ry.toFixed(3),
          rz: rz.toFixed(3)
        };
        target.push(result);
      }
      this.result.disg[caseNo] = target;
      max_row = Math.max(max_row, target.length);
    }
    this.result.DISG_ROWS_COUNT = max_row;
  }

  private setReacJson(jsonData: {}): void {
    let max_row = 0;
    for (const caseNo of Object.keys(jsonData)) {
      const target = new Array();
      const caseData: {} = jsonData[caseNo];
      if (typeof (caseData) !== 'object') {
        continue;
      }
      if (!('reac' in caseData)) {
        continue;
      }
      const json: {} = caseData['reac'];
      for (const n of Object.keys(json)) {
        const item: {} = json[n];

        let tx: number = this.frame.toNumber(item['tx']);
        let ty: number = this.frame.toNumber(item['ty']);
        let tz: number = this.frame.toNumber(item['tz']);
        let mx: number = this.frame.toNumber(item['mx']);
        let my: number = this.frame.toNumber(item['my']);
        let mz: number = this.frame.toNumber(item['mz']);

        tx = (tx == null) ? 0 : tx;
        ty = (ty == null) ? 0 : ty;
        tz = (tz == null) ? 0 : tz;
        mx = (mx == null) ? 0 : mx;
        my = (my == null) ? 0 : my;
        mz = (mz == null) ? 0 : mz;

        const result = {
          id: n,
          tx: tx.toFixed(2),
          ty: ty.toFixed(2),
          tz: tz.toFixed(2),
          mx: mx.toFixed(2),
          my: my.toFixed(2),
          mz: mz.toFixed(2)
        };
        target.push(result);
      }
      this.result.reac[caseNo] = target;
      max_row = Math.max(max_row, target.length);
    }
    this.result.REAC_ROWS_COUNT = max_row;
  }

  private setFsecJson(jsonData: {}): void {
    let max_row = 0;

    for (const caseNo of Object.keys(jsonData)) {
      const target = new Array();
      const caseData: {} = jsonData[caseNo];
      if (typeof (caseData) !== 'object') {
        continue;
      }
      if (!('fsec' in caseData)) {
        continue;
      }
      const json: {} = caseData['fsec'];
      let row = 0;
      let memberNo = '';
      for (const m of Object.keys(json)) {

        let noticePoint = 0.0;
        memberNo = m;
        const js: {} = json[m];

        let result = {};
        const old = {};
        const node = this.frame.getNodeNo(memberNo)
        let ni: string = node['ni'];
        let nj = '';
        let counter = 0;
        const data_length: number = Object.keys(js).length;
        for (const p of Object.keys(js)) {
          counter++;
          const item: {} = js[p];
          let fxi: number = this.frame.toNumber(item['fxi']);
          let fyi: number = this.frame.toNumber(item['fyi']);
          let fzi: number = this.frame.toNumber(item['fzi']);
          let mxi: number = this.frame.toNumber(item['mxi']);
          let myi: number = this.frame.toNumber(item['myi']);
          let mzi: number = this.frame.toNumber(item['mzi']);
          fxi = (fxi == null) ? 0 : fxi;
          fyi = (fyi == null) ? 0 : fyi;
          fzi = (fzi == null) ? 0 : fzi;
          mxi = (mxi == null) ? 0 : mxi;
          myi = (myi == null) ? 0 : myi;
          mzi = (mzi == null) ? 0 : mzi;
          result = {
            m: memberNo,
            n: ni,
            l: noticePoint.toFixed(3),
            fx: fxi.toFixed(2),
            fy: fyi.toFixed(2),
            fz: fzi.toFixed(2),
            mx: mxi.toFixed(2),
            my: myi.toFixed(2),
            mz: mzi.toFixed(2)
          };
          if (!this.objectEquals(old, result)) {
            Object.assign(old, result);
            row++;
            result['row'] = row;
            target.push(result);
          }

          memberNo = '';
          ni = '';
          if (counter === data_length) {
            nj = node['nj'];
          }
          noticePoint += this.frame.toNumber(item['L']);
          let fxj: number = this.frame.toNumber(item['fxj']);
          let fyj: number = this.frame.toNumber(item['fyj']);
          let fzj: number = this.frame.toNumber(item['fzj']);
          let mxj: number = this.frame.toNumber(item['mxj']);
          let myj: number = this.frame.toNumber(item['myj']);
          let mzj: number = this.frame.toNumber(item['mzj']);
          fxj = (fxj == null) ? 0 : fxj;
          fyj = (fyj == null) ? 0 : fyj;
          fzj = (fzj == null) ? 0 : fzj;
          mxj = (mxj == null) ? 0 : mxj;
          myj = (myj == null) ? 0 : myj;
          mzj = (mzj == null) ? 0 : mzj;
          result = {
            m: '',
            n: nj,
            l: noticePoint.toFixed(3),
            fx: fxj.toFixed(2),
            fy: fyj.toFixed(2),
            fz: fzj.toFixed(2),
            mx: mxj.toFixed(2),
            my: myj.toFixed(2),
            mz: mzj.toFixed(2)
          };
          if (!this.objectEquals(old, result)) {
            Object.assign(old, result);
            row++;
            result['row'] = row;
            target.push(result);
          }

        }
      }
      this.result.fsec[caseNo] = target;
      max_row = Math.max(max_row, target.length);
    }
    this.result.FSEC_ROWS_COUNT = max_row;
  }

  private setDisgCombineJson(combList: any): void {

    try {

      // combineのループ
      for (const combNo of Object.keys(combList)) {
        const resultDisg = {
          dx_max: {}, dx_min: {}, dy_max: {}, dy_min: {}, dz_max: {}, dz_min: {},
          rx_max: {}, rx_min: {}, ry_max: {}, ry_min: {}, rz_max: {}, rz_min: {}
        };

        // defineのループ
        const combines: any[] = combList[combNo];
        for (let i = 0; i < combines.length; i++) {
          const combineDisg = { dx: {}, dy: {}, dz: {}, rx: {}, ry: {}, rz: {} };

          // 基本ケースのループ
          const com = combines[i];
          for (let j = 0; j < com.length; j++) {
            const caseInfo = com[j];

            if (!(caseInfo.caseNo in this.result.disg)) {
              continue;
            }
            // 節点番号のループ
            const disgs: any[] = this.result.disg[caseInfo.caseNo];
            for (let n = 0; n < disgs.length; n++) {
              const result: {} = disgs[n];
              const id = result['id'];

              // dx, dy … のループ
              for (const key1 of Object.keys(combineDisg)) {
                const value = combineDisg[key1];
                const temp: {} = (id in value) ? value[id] : { id: id, dx: 0, dy: 0, dz: 0, rx: 0, ry: 0, rz: 0, case: '' };

                // x, y, z, 変位, 回転角 のループ
                for (const key2 in result) {
                  if (key2 === 'id') {
                    continue;
                  }
                  temp[key2] += caseInfo.coef * result[key2];
                }
                temp['case'] += '+' + caseInfo.caseNo.toString();
                value[id] = temp;
                combineDisg[key1] = value;
              }
            }
          }

          // dx, dy … のループ
          const k: string[] = ['_max', '_min'];
          for (const key1 of Object.keys(combineDisg)) {
            for (let n = 0; n < k.length; n++) {
              let key2: string;
              key2 = key1 + k[n];
              const old = resultDisg[key2];
              const current = combineDisg[key1];
              // 節点番号のループ
              for (const id of Object.keys(current)) {
                if (!(id in old)) {
                  old[id] = current[id];
                  resultDisg[key2] = old;
                  continue;
                }
                const target = current[id];
                const comparison = old[id]
                if ((n === 0 && comparison[key1] < target[key1])
                  || (n > 0 && comparison[key1] > target[key1])) {
                  old[id] = target;
                  resultDisg[key2] = old;
                }
              }
            }
          }
        }
        this.result.disgCombine[combNo] = resultDisg;
      }
    } catch (e) {
      console.log(e);
    }
  }

  private setReacCombineJson(combList: any): void {

    try {

      // combineのループ
      for (const combNo of Object.keys(combList)) {
        const resultReac = {
          tx_max: {}, tx_min: {}, ty_max: {}, ty_min: {}, tz_max: {}, tz_min: {},
          mx_max: {}, mx_min: {}, my_max: {}, my_min: {}, mz_max: {}, mz_min: {}
        };

        // defineのループ
        const combines: any[] = combList[combNo];
        for (let i = 0; i < combines.length; i++) {
          const combineReac = { tx: {}, ty: {}, tz: {}, mx: {}, my: {}, mz: {} };

          // 基本ケースのループ
          const com = combines[i];
          for (let j = 0; j < com.length; j++) {
            const caseInfo = com[j];

            if (!(caseInfo.caseNo in this.result.disg)) {
              continue;
            }
            // 節点番号のループ
            const Reacs: any[] = this.result.reac[caseInfo.caseNo];
            for (let n = 0; n < Reacs.length; n++) {
              const result: {} = Reacs[n];
              const id = result['id'];

              // dx, dy … のループ
              for (const key1 of Object.keys(combineReac)) {
                const value = combineReac[key1];
                const temp: {} = (id in value) ? value[id] : { id: id, tx: 0, ty: 0, tz: 0, mx: 0, my: 0, mz: 0, case: '' };

                // x, y, z, 変位, 回転角 のループ
                for (const key2 in result) {
                  if (key2 === 'id') {
                    continue;
                  }
                  temp[key2] += caseInfo.coef * result[key2];
                }
                temp['case'] += '+' + caseInfo.caseNo.toString();
                value[id] = temp;
                combineReac[key1] = value;
              }
            }
          }

          // dx, dy … のループ
          const k: string[] = ['_max', '_min'];
          for (const key1 of Object.keys(combineReac)) {
            for (let n = 0; n < k.length; n++) {
              let key2: string;
              key2 = key1 + k[n];
              const old = resultReac[key2];
              const current = combineReac[key1];
              // 節点番号のループ
              for (const id of Object.keys(current)) {
                if (!(id in old)) {
                  old[id] = current[id];
                  resultReac[key2] = old;
                  continue;
                }
                const target = current[id];
                const comparison = old[id]
                if ((n === 0 && comparison[key1] < target[key1])
                  || (n > 0 && comparison[key1] > target[key1])) {
                  old[id] = target;
                  resultReac[key2] = old;
                }
              }
            }
          }
        }
        this.result.reacCombine[combNo] = resultReac;
      }
    } catch (e) {
      console.log(e);
    }
  }

  private setFsecCombineJson(combList: any): void {

    try {

      // combineのループ
      for (const combNo of Object.keys(combList)) {
        const resultFsec = {
          fx_max: {}, fx_min: {}, fy_max: {}, fy_min: {}, fz_max: {}, fz_min: {},
          mx_max: {}, mx_min: {}, my_max: {}, my_min: {}, mz_max: {}, mz_min: {}
        };

        // defineのループ
        const combines: any[] = combList[combNo];
        for (let i = 0; i < combines.length; i++) {
          const combineFsec = { fx: {}, fy: {}, fz: {}, mx: {}, my: {}, mz: {} };

          // 基本ケースのループ
          const com = combines[i];
          for (let j = 0; j < com.length; j++) {
            const caseInfo = com[j];

            if (!(caseInfo.caseNo in this.result.fsec)) {
              continue;
            }
            // 節点番号のループ
            const Fsecs: any[] = this.result.fsec[caseInfo.caseNo];
            for (let n = 0; n < Fsecs.length; n++) {
              const result: {} = Fsecs[n];
              const row = result['row'];

              // dx, dy … のループ
              for (const key1 of Object.keys(combineFsec)) {
                const value = combineFsec[key1];
                const temp: {} = (row in value) ? value[row] : { row: row, fx: 0, fy: 0, fz: 0, mx: 0, my: 0, mz: 0, case: '' };

                // x, y, z, 変位, 回転角 のループ
                for (const key2 in result) {
                  if (key2 === 'row') {
                    continue;
                  }
                  if (key2 === 'm' || key2 === 'n' || key2 === 'l') {
                    temp[key2] = result[key2];
                    continue;
                  }
                  temp[key2] += caseInfo.coef * result[key2];
                }
                temp['case'] += '+' + caseInfo.caseNo.toString();
                value[row] = temp;
                combineFsec[key1] = value;
              }
            }
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
                const comparison = old[id]
                if ((n === 0 && comparison[key1] < target[key1])
                  || (n > 0 && comparison[key1] > target[key1])) {
                  old[id] = target;
                  resultFsec[key2] = old;
                }
              }
            }
          }

        }
        this.result.fsecCombine[combNo] = resultFsec;
      }
    } catch (e) {
      console.log(e);
    }
  }

  private setDisgPickupJson(pickList: any): void {
    try {
      // pickupのループ
      for (const pickNo of Object.keys(pickList)) {
        const combines: any[] = pickList[pickNo];
        let tmp: {} = null;
        for (let i = 0; i < combines.length; i++) {
          const combNo: string = combines[i];
          const com = this.result.disgCombine[combNo];
          if (tmp == null) {
            tmp = com;
            continue;
          }
          for (const k of Object.keys(com)) {
            const key = k.split('_');
            const target = com[k];
            const comparison = tmp[k];
            for (const id of Object.keys(comparison)) {
              const a = comparison[id];
              const b = target[id];
              if (key[1] === 'max') {
                if (b[key[0]] > a[key[0]]) {
                  tmp[k] = com[k];
                }
              } else {
                if (b[key[0]] < a[key[0]]) {
                  tmp[k] = com[k];
                }
              }
            }
          }
        }
        this.result.disgPickup[pickNo] = tmp;
      }
    } catch (e) {
      console.log(e);
    }
  }

  private setReacPickupJson(pickList: any): void {
    try {
      // pickupのループ
      for (const pickNo of Object.keys(pickList)) {
        const combines: any[] = pickList[pickNo];
        let tmp: {} = null;
        for (let i = 0; i < combines.length; i++) {
          const combNo: string = combines[i];
          const com = this.result.reacCombine[combNo];
          if (tmp == null) {
            tmp = com;
            continue;
          }
          for (const k of Object.keys(com)) {
            const key = k.split('_');
            const target = com[k];
            const comparison = tmp[k];
            for (const id of Object.keys(comparison)) {
              const a = comparison[id];
              const b = target[id];
              if (key[1] === 'max') {
                if (b[key[0]] > a[key[0]]) {
                  tmp[k] = com[k];
                }
              } else {
                if (b[key[0]] < a[key[0]]) {
                  tmp[k] = com[k];
                }
              }
            }
          }
        }
        this.result.reacPickup[pickNo] = tmp;
      }
    } catch (e) {
      console.log(e);
    }
  }

  private setFsecPickupJson(pickList: any): void {
    try {
      // pickupのループ

      for (const pickNo of Object.keys(pickList)) {
        const combines: any[] = pickList[pickNo];
        let tmp: {} = null;
        for (let i = 0; i < combines.length; i++) {
          const combNo: string = combines[i];
          const com = this.result.fsecCombine[combNo];
          if (tmp == null) {
            tmp = com;

            continue;
          }
          for (const k of Object.keys(com)) {
            const key = k.split('_');
            const target = com[k];
            const comparison = tmp[k];
            for (const id of Object.keys(comparison)) {
              const a = comparison[id];
              const b = target[id];
              if (key[1] === 'max') {
                if (b[key[0]] > a[key[0]]) {
                  tmp[k] = com[k];
                }
              } else {
                if (b[key[0]] < a[key[0]]) {
                  tmp[k] = com[k];
                }
              }
            }
          }
        }
        this.result.fsecPickup[pickNo] = tmp;
      }
    } catch (e) {
      console.log(e);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////
  // Helper 関数 /////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////
  private objectEquals(a: any, b: any): boolean {

    if (a === b) {
      // 同一インスタンスならtrueを返す
      return true;
    }

    // 比較対象双方のキー配列を取得する（順番保証のためソートをかける）
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();

    // 比較対象同士のキー配列を比較する
    if (aKeys.toString() !== bKeys.toString()) {
      // キーが違う場合はfalse
      return false;
    }

    // 値をすべて調べる。
    const wrongIndex = aKeys.findIndex(function (value) {
      // 注意！これは等価演算子で正常に比較できるもののみを対象としています。
      // つまり、ネストされたObjectやArrayなどには対応していないことに注意してください。
      return a[value] !== b[value];
    });

    // 合致しないvalueがなければ、trueを返す。
    return wrongIndex === -1;
  }
}
