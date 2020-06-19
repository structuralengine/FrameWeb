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
    if (!this.fsec[typNo]) {
      target = new Array();
    } else {
      target = this.fsec[typNo];
    }

    // 行を探す
    for (let i = 0; i < target.length; i++) {
      const tmp = target[i];
      if (tmp['row'] === row) {
        result = tmp;
        break;
      }
    }

    // 対象行が無かった時に処理
    if (result == null) {
      result = { row: row, m: '', n: '', l: '', fx: '', fy: '', fz: '', mx: '', my: '', mz: '' };
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
        const node = this.member.getNodeNo(memberNo);
        let ni: string = node['ni'];
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
            fx: (Math.round(fxi/100) * 100).toFixed(2),
            fy: (Math.round(fyi / 100) * 100).toFixed(2),
            fz: (Math.round(fzi / 100) * 100).toFixed(2),
            mx: (Math.round(mxi / 100) * 100).toFixed(2),
            my: (Math.round(myi / 100) * 100).toFixed(2),
            mz: (Math.round(mzi / 100) * 100).toFixed(2)
          };

          // 同一要素内の着目点で、直前の断面力と同じ断面力だったら 読み飛ばす
          if (old['n'] !== result['n'] || old['fx'] !== result['fx'] || old['fy'] !== result['fy'] || old['fz'] !== result['fz']
            || old['mx'] !== result['mx'] || old['my'] !== result['my'] || old['mz'] !== result['mz'] ) {
            row++;
            result['row'] = row;
            target.push(result);
          }

          memberNo = '';
          ni = '';
          if (counter === data_length) {
            nj = node['nj'];
          }
          noticePoint = this.helper.toNumber(item['L']);
          let fxj: number = this.helper.toNumber(item['fxj']);
          let fyj: number = this.helper.toNumber(item['fyj']);
          let fzj: number = this.helper.toNumber(item['fzj']);
          let mxj: number = this.helper.toNumber(item['mxj']);
          let myj: number = this.helper.toNumber(item['myj']);
          let mzj: number = this.helper.toNumber(item['mzj']);
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
            fx: (Math.round(fxj / 100) * 100).toFixed(2),
            fy: (Math.round(fyj / 100) * 100).toFixed(2),
            fz: (Math.round(fzj / 100) * 100).toFixed(2),
            mx: (Math.round(mxj / 100) * 100).toFixed(2),
            my: (Math.round(myj / 100) * 100).toFixed(2),
            mz: (Math.round(mzj / 100) * 100).toFixed(2)
          };
          Object.assign(old, result);
          row++;
          result['row'] = row;
          target.push(result);
          counter++;
        }
      }
      this.fsec[caseNo.replace('Case', '')] = target;
      max_row = Math.max(max_row, target.length);
    }
    this.FSEC_ROWS_COUNT = max_row;
  }

}
