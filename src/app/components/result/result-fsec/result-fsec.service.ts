import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { InputMembersService } from '../../input/input-members/input-members.service';

@Injectable({
  providedIn: 'root'
})
export class ResultFsecService {

  public FSEC_ROWS_COUNT: number;
  public fsec: any;

  constructor(private member: InputMembersService,
              private helper: DataHelperModule) {
    this.clear();
  }

  public clear(): void {
    this.fsec = {};
  }

  public getFsecColumns(typNo: number, row: number): any {

    let target: any = null;
    let result: any = null;

    // タイプ番号を探す
    if (typNo in this.fsec) {
      target = this.fsec[typNo];
    } else {
      target = new Array();
    }

    // 行を探す
    for (let i = 0; i < target.length; i++) {
      const tmp = target[i];
      if (tmp.row === row) {
        result = {
          row: tmp.row,
          m: tmp.m,
          n: tmp.n,
          l: tmp.l.toFixed(3),
          fx: (Math.round(tmp.fx * 100) / 100).toFixed(2),
          fy: (Math.round(tmp.fy * 100) / 100).toFixed(2),
          fz: (Math.round(tmp.fz * 100) / 100).toFixed(2),
          mx: (Math.round(tmp.mx * 100) / 100).toFixed(2),
          my: (Math.round(tmp.my * 100) / 100).toFixed(2),
          mz: (Math.round(tmp.mz * 100) / 100).toFixed(2)
        };
        break;
      }
    }

    // 対象行が無かった時に処理
    if (result == null) {
      result = {
        row: row,
        m: '',
        n: '',
        l: '',
        fx: '',
        fy: '',
        fz: '',
        mx: '',
        my: '',
        mz: ''
      };
      target.push(result);
      this.fsec[typNo] = target;
    }

    return result;
  }

  public getFsecJson(): object {
    return this.fsec;
  }

  public setFsecJson(jsonData: {}): void {
    let max_row = 0;

    let max_f = 0;
    let max_m = 0;

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
        memberNo = m.replace('member', '');
        const js: {} = json[m];

        let result = {};
        const old = {};
        const memb = this.member.getMember(memberNo);
        let ni: string = memb.ni;
        let nj = '';
        let counter = 1;
        const data_length: number = Object.keys(js).length;
        while (counter <= data_length) {
          const p = 'P' + counter.toString();
          if (!(p in js)) {
            break;
          }
          const item: {} = js[p];
          let fxi: number = this.helper.toNumber(item['fxi']);
          let fyi: number = this.helper.toNumber(item['fyi']);
          let fzi: number = this.helper.toNumber(item['fzi']);
          let mxi: number = this.helper.toNumber(item['mxi']);
          let myi: number = this.helper.toNumber(item['myi']);
          let mzi: number = this.helper.toNumber(item['mzi']);
          result = {
            m: memberNo,
            n: ni,
            l: noticePoint,
            fx: (fxi == null) ? 0 : fxi,
            fy: (fyi == null) ? 0 : fyi,
            fz: (fzi == null) ? 0 : fzi,
            mx: (mxi == null) ? 0 : mxi,
            my: (myi == null) ? 0 : myi,
            mz: (mzi == null) ? 0 : mzi
          };

          // 同一要素内の着目点で、直前の断面力と同じ断面力だったら 読み飛ばす
          if (old['n'] !== result['n'] || old['fx'] !== result['fx'] || old['fy'] !== result['fy'] || old['fz'] !== result['fz']
            || old['mx'] !== result['mx'] || old['my'] !== result['my'] || old['mz'] !== result['mz']) {
            row++;
            result['row'] = row;
            target.push(result);

            //　最大値を記録する
            for (const v of [fxi, fyi, fzi]) {
              if (Math.abs(max_f) < Math.abs(v)) {
                max_f = v;
              }
            }
            for (const v of [mxi, myi, mzi]) {
              if (Math.abs(max_m) < Math.abs(v)) {
                max_m = v;
              }
            }
          }

          memberNo = '';
          ni = '';
          if (counter === data_length) {
            nj = memb.nj;
          }

          noticePoint = this.helper.toNumber(item['L']);
          let fxj: number = this.helper.toNumber(item['fxj']);
          let fyj: number = this.helper.toNumber(item['fyj']);
          let fzj: number = this.helper.toNumber(item['fzj']);
          let mxj: number = this.helper.toNumber(item['mxj']);
          let myj: number = this.helper.toNumber(item['myj']);
          let mzj: number = this.helper.toNumber(item['mzj']);

          result = {
            m: '',
            n: nj,
            l: noticePoint,
            fx: (fxj == null) ? 0 : fxj,
            fy: (fyj == null) ? 0 : fyj,
            fz: (fzj == null) ? 0 : fzj,
            mx: (mxj == null) ? 0 : mxj,
            my: (myj == null) ? 0 : myj,
            mz: (mzj == null) ? 0 : mzj
          };

          Object.assign(old, result);
          row++;
          result['row'] = row;
          target.push(result);
          counter++;

          //　最大値を記録する
          for (const v of [fxj, fyj, fzj]) {
            if (Math.abs(max_f) < Math.abs(v)) {
              max_f = v;
            }
          }
          for (const v of [mxj, myj, mzj]) {
            if (Math.abs(max_m) < Math.abs(v)) {
              max_m = v;
            }
          }

        }
      }
      this.fsec[caseNo.replace('Case', '')] = target;
      max_row = Math.max(max_row, target.length);
    }

    // three のスケールを決定するのに最大値をストックする
    this.fsec['max_value'] = Math.max(Math.abs(max_f), Math.abs(max_m));
    this.fsec['max_f_value'] = max_f;
    this.fsec['max_m_value'] = max_m;


    this.FSEC_ROWS_COUNT = max_row;
  }

}
