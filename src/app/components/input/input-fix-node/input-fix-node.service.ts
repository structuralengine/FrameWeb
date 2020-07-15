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

  public setFixNodeJson(jsonData: object): void {

    if (!('fix_node' in jsonData)) {
      return;
    }

    const json: object = jsonData['fix_node'];

    for (const typNo of Object.keys(json)) {

      const js: any[] = json[typNo];

      const target = new Array();

      for (let i = 0; i < js.length; i++) {

        const row: number = ('row' in js[i]) ? js[i].row : (i + 1).toString();
        const item = this.convertNumber(js[i]);

        const result = {
          row: row,
          n: (item.n === null) ? '' : item.n.toFixed(0),
          tx: (item.tx === null) ? '' : item.tx.toString(),
          ty: (item.ty === null) ? '' : item.ty.toString(),
          tz: (item.tz === null) ? '' : item.tz.toString(),
          rx: (item.rx === null) ? '' : item.rx.toString(),
          ry: (item.ry === null) ? '' : item.ry.toString(),
          rz: (item.rz === null) ? '' : item.rz.toString()
        };

        target.push(result);
      }
      this.fix_node[typNo] = target;
    }
  }

  public getFixNodeJson(empty: number = null, targetCase: string = ''): object {

    const result = {};

    for (const typNo of Object.keys(this.fix_node)) {
      
      // ケースの指定がある場合、カレントケース以外は無視する
      if (targetCase.length > 0 && typNo !== targetCase) {
        continue;
      }

      const jsonData = new Array();

      for ( const row of this.fix_node[typNo]) {

        const r = row['row'];
        const item = this.convertNumber(row);

        if (item.n == null && item.tx == null && item.ty == null && item.tz == null
          && item.rx == null && item.ry == null && item.rz == null) {
          continue;
        }

        jsonData.push({ 
          row: r, 
          n: row.n,
          tx: (item.tx == null) ? empty : item.tx, 
          ty: (item.ty == null) ? empty : item.ty, 
          tz: (item.tz == null) ? empty : item.tz, 
          rx: (item.rx == null) ? empty : item.rx, 
          ry: (item.ry == null) ? empty : item.ry, 
          rz: (item.rz == null) ? empty : item.rz 
        });

      }

      if (jsonData.length > 0) {
        result[typNo] = jsonData;
      }

    }

    return result;

  }

  private convertNumber(item: object): any {

    const n = this.helper.toNumber(item['n']);
    const tx = this.helper.toNumber(item['tx']);
    const ty = this.helper.toNumber(item['ty']);
    const tz = this.helper.toNumber(item['tz']);
    const rx = this.helper.toNumber(item['rx']);
    const ry = this.helper.toNumber(item['ry']);
    const rz = this.helper.toNumber(item['rz']);

    return {
          n,
          tx,
          ty,
          tz,
          rx,
          ry,
          rz
        };
  }
}
