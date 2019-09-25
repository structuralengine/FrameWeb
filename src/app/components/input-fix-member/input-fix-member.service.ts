import { Injectable } from '@angular/core';
import { DataHelperService } from '../../providers/data-helper.service';

@Injectable({
  providedIn: 'root'
})
export class InputFixMemberService extends DataHelperService {
  
  public fix_member: any;

  constructor() {
    super();
    this.clear();
  }

  public clear(): void {
    this.fix_member = {};
  }
  
  public getFixMemberColumns(typNo: number, row: number): any {

    let target: any = null;
    let result: any = null;

    // タイプ番号を探す
    if (!this.fix_member[typNo]) {
      target = new Array();
    } else {
      target = this.fix_member[typNo];
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
      result = { row: row, m: '', tx: '', ty: '', tz: '', tr: '' };
      target.push(result);
      this.fix_member[typNo] = target;
    }

    return result;
  }

  public setFixMemberJson(jsonData: {}): void {
    if (!('fix_member' in jsonData)) {
      return;
    }
    const json: {} = jsonData['fix_member'];
    for (const typNo of Object.keys(json)) {
      const js: any[] = json[typNo];
      const target = new Array();
      for (let i = 0; i < js.length; i++) {
        const item: {} = js[i];
        const row: string = ('row' in item) ? item['row'] : (i + 1).toString();
        const result = { row: row, m: item['m'], tx: item['tx'], ty: item['ty'], tz: item['tz'], tr: item['tr'] };
        target.push(result);
      }
      this.fix_member[typNo] = target;
    }
  }

  public getFixMemberJson(mode: string = 'file') {

    const result = {};
    let targetCase = '0';
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('fix_members') < 0) {
      return result;
    } else {
      targetCase = mode.replace('unity-fix_members:', '');
    }

    for (const typNo of Object.keys(this.fix_member)) {
      // unity-fix_members モードは カレントのケースのみデータを生成する
      if (targetCase !== mode) {
        if (typNo !== targetCase) {
          continue;
        }
      }
      const fix_member = this.fix_member[typNo];
      const jsonData = new Array();
      for (let i = 0; i < fix_member.length; i++) {
        const row: {} = fix_member[i];
        let m = this.toNumber(row['m']);
        let tx = this.toNumber(row['tx']);
        let ty = this.toNumber(row['ty']);
        let tz = this.toNumber(row['tz']);
        let tr = this.toNumber(row['tr']);
        if (m == null && tx == null && ty == null && tz == null && tr == null) {
          continue;
        }
        if (mode === 'calc') {
          m = (m == null) ? 0 : m;
          tx = (tx == null) ? 0 : tx;
          ty = (ty == null) ? 0 : ty;
          tz = (tz == null) ? 0 : tz;
          tr = (tr == null) ? 0 : tr;
          const item = { m: m, tx: tx, ty: ty, tz: tz, tr: tr };
          jsonData.push(item);
        } else {
          jsonData.push(row);
        }
      }
      if (jsonData.length > 0) {
        result[typNo] = jsonData;
      }
    }
    return result;
  }

}
