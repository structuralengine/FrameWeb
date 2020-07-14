import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class InputFixMemberService {
  
  public fix_member: any;

  constructor(private helper: DataHelperModule) {
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
        const item = js[i];
        const row: string = ('row' in item) ? item['row'] : (i + 1).toString();
        const result = {
          row: row,
          m: (item.m === null) ? '' : item.m.toFixed(0),
          tx: (item.tx === null) ? '' : item.tx.toString(),
          ty: (item.ty === null) ? '' : item.ty.toString(),
          tz: (item.tz === null) ? '' : item.tz.toString(),
          tr: (item.tr === null) ? '' : item.tr.toString()
        };
        target.push(result);
      }
      this.fix_member[typNo] = target;
    }
  }

  public getFixMemberJson(empty: number = null, targetCase: string = '') {

    const result = {};

    for (const typNo of Object.keys(this.fix_member)) {
      
      // ケースの指定がある場合、カレントケース以外は無視する
      if (targetCase.length > 0 && typNo !== targetCase) {
        continue;
      }

      const jsonData = new Array();

      for ( const row of this.fix_member[typNo]) {

        const r = row['row'];
        let m = this.helper.toNumber(row['m']);
        let tx = this.helper.toNumber(row['tx']);
        let ty = this.helper.toNumber(row['ty']);
        let tz = this.helper.toNumber(row['tz']);
        let tr = this.helper.toNumber(row['tr']);

        if (m == null && tx == null && ty == null && tz == null && tr == null) {
          continue;
        }

        jsonData.push({ 
          row: r, 
          m: (m == null) ? empty : m, 
          tx: (tx == null) ? empty : tx, 
          ty: (ty == null) ? empty : ty, 
          tz: (tz == null) ? empty : tz, 
          tr: (tr == null) ? empty : tr
        });

      }

      if (jsonData.length > 0) {
        result[typNo] = jsonData;
      }

    }
    return result;
  }

}
