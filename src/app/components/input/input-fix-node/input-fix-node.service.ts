import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class InputFixNodeService  {
  public fix_node: any;

  constructor(private helper: DataHelperModule) {
    this.clear();
  }

  public clear(): void { 
    this.fix_node = {};
  }
  
  public getFixNodeColumns(typNo: number, row: number): any {

    let target: any = null;
    let result: any = null;

    // タイプ番号を探す
    if (!this.fix_node[typNo]) {
      target = new Array();
    } else {
      target = this.fix_node[typNo];
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
      result = { row: row, n: '', tx: '', ty: '', tz: '', rx: '', ry: '', rz: '' };
      target.push(result);
      this.fix_node[typNo] = target;
    }

    return result;
  }

  public setFixNodeJson(jsonData: {}): void {
    if (!('fix_node' in jsonData)) {
      return;
    }
    const json: {} = jsonData['fix_node'];
    for (const typNo of Object.keys(json)) {
      const js: any[] = json[typNo];
      const target = new Array();
      for (let i = 0; i < js.length; i++) {
        const item: {} = js[i];
        const row: string = ('row' in item) ? item['row'] : (i + 1).toString();
        const result = {
          row: row, n: item['n'],
          tx: item['tx'], ty: item['ty'], tz: item['tz'],
          rx: item['rx'], ry: item['ry'], rz: item['rz']
        };
        target.push(result);
      }
      this.fix_node[typNo] = target;
    }
  }

  public getFixNodeJson(empty: number = null, targetCase: string = '') {

    const result = {};

    for (const typNo of Object.keys(this.fix_node)) {
      
      // ケースの指定がある場合、カレントケース以外は無視する
      if (targetCase.length > 0 && typNo !== targetCase) {
        continue;
      }

      const jsonData = new Array();

      for ( const row of this.fix_node[typNo]) {

        const r = row['row'];
        let n = this.helper.toNumber(row['n']);
        let tx = this.helper.toNumber(row['tx']);
        let ty = this.helper.toNumber(row['ty']);
        let tz = this.helper.toNumber(row['tz']);
        let rx = this.helper.toNumber(row['rx']);
        let ry = this.helper.toNumber(row['ry']);
        let rz = this.helper.toNumber(row['rz']);

        if (n == null && tx == null && ty == null && tz == null
          && rx == null && ry == null && rz == null) {
          continue;
        }

        jsonData.push({ 
          row: r, 
          n: (n == null) ? empty : n,
          tx: (tx == null) ? empty : tx, 
          ty: (ty == null) ? empty : ty, 
          tz: (tz == null) ? empty : tz, 
          rx: (rx == null) ? empty : rx, 
          ry: (ry == null) ? empty : ry, 
          rz: (rz == null) ? empty : rz 
        });

      }

      if (jsonData.length > 0) {
        result[typNo] = jsonData;
      }

    }

    return result;

  }

}
