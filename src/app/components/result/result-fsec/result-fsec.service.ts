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
    for (const tmp of target) {
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
          fxi = (fxi == null) ? 0 : Math.round(fxi * 100) / 100;
          fyi = (fyi == null) ? 0 : Math.round(fyi * 100) / 100;
          fzi = (fzi == null) ? 0 : Math.round(fzi * 100) / 100;
          mxi = (mxi == null) ? 0 : Math.round(mxi * 100) / 100;
          myi = (myi == null) ? 0 : Math.round(myi * 100) / 100;
          mzi = (mzi == null) ? 0 : Math.round(mzi * 100) / 100;

          result = {
            m: memberNo,
            n: ni,
            l: noticePoint,
            fx: fxi,
            fy: fyi,
            fz: fzi,
            mx: mxi,
            my: myi,
            mz: mzi
          };

          // 同一要素内の着目点で、直前の断面力と同じ断面力だったら 読み飛ばす
          //if (old['n'] !== result['n'] || old['fx'] !== result['fx'] || old['fy'] !== result['fy'] || old['fz'] !== result['fz']
          //  || old['mx'] !== result['mx'] || old['my'] !== result['my'] || old['mz'] !== result['mz']) {
          row++;
          result['row'] = row;
          target.push(result);
          //}

          memberNo = '';
          ni = '';
          if (counter === data_length) {
            nj = memb.nj;
          }

          const l = this.helper.toNumber(item['L']);
          let fxj: number = this.helper.toNumber(item['fxj']);
          let fyj: number = this.helper.toNumber(item['fyj']);
          let fzj: number = this.helper.toNumber(item['fzj']);
          let mxj: number = this.helper.toNumber(item['mxj']);
          let myj: number = this.helper.toNumber(item['myj']);
          let mzj: number = this.helper.toNumber(item['mzj']);
          noticePoint += Math.round(l * 1000) / 1000;
          fxj = (fxj == null) ? 0 : Math.round(fxj * 100) / 100;
          fyj = (fyj == null) ? 0 : Math.round(fyj * 100) / 100;
          fzj = (fzj == null) ? 0 : Math.round(fzj * 100) / 100;
          mxj = (mxj == null) ? 0 : Math.round(mxj * 100) / 100;
          myj = (myj == null) ? 0 : Math.round(myj * 100) / 100;
          mzj = (mzj == null) ? 0 : Math.round(mzj * 100) / 100;

          result = {
            m: '',
            n: nj,
            l: noticePoint,
            fx: fxj,
            fy: fyj,
            fz: fzj,
            mx: mxj,
            my: myj,
            mz: mzj
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
