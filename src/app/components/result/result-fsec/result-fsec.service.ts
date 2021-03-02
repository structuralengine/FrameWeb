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

  public getFsecColumns(typNo: number): any {

    let target2: any = null;

    // タイプ番号を探す
    if (typNo in this.fsec) {
      target2 = this.fsec[typNo];
    } else {
      target2 = new Array();
    }

    // 行を探す
    const result: any[] = new Array();
    let m: string = null;
    const old = {};
    for (const target3 of target2) {
      const item = {
        m: (m === target3['m']) ? '' : target3['m'],
        n: ('n' in target3) ? target3['n'] : '',
        l: target3['l'].toFixed(3),
        fx: (Math.round(target3.fx * 100) / 100).toFixed(2),
        fy: (Math.round(target3.fy * 100) / 100).toFixed(2),
        fz: (Math.round(target3.fz * 100) / 100).toFixed(2),
        mx: (Math.round(target3.mx * 100) / 100).toFixed(2),
        my: (Math.round(target3.my * 100) / 100).toFixed(2),
        mz: (Math.round(target3.mz * 100) / 100).toFixed(2)
      };
      // 同一要素内の着目点で、直前の断面力と同じ断面力だったら 読み飛ばす
      if (old['n'] !== item['n'] || old['fx'] !== item['fx'] || old['fy'] !== item['fy'] || old['fz'] !== item['fz']
          || old['mx'] !== item['mx'] || old['my'] !== item['my'] || old['mz'] !== item['mz']) {
        result.push(item);
        m = target3['m'];
        Object.assign(old, item);
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

          row++;
          result['row'] = row;
          target.push(result);

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
