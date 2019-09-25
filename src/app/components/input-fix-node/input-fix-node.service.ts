import { Injectable } from '@angular/core';
import { DataHelperService } from '../../providers/data-helper.service';

@Injectable({
  providedIn: 'root'
})
export class InputFixNodeService extends DataHelperService {
  public fix_node: any;

  constructor() {
    super();
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

  private getFixNodeJson(mode: string = 'file') {

    const result = {};
    let targetCase = '0';
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('fix_nodes') < 0) {
      return result;
    } else {
      targetCase = mode.replace('unity-fix_nodes:', '');
    }

    for (const typNo of Object.keys(this.fix_node)) {
      // unity-fix_nodes モードは カレントのケースのみデータを生成する
      if (targetCase !== mode) {
        if (typNo !== targetCase) {
          continue;
        }
      }
      const fix_node = this.fix_node[typNo];
      const jsonData = new Array();
      for (let i = 0; i < fix_node.length; i++) {
        const row: {} = fix_node[i];
        let n = this.toNumber(row['n']);
        let tx = this.toNumber(row['tx']);
        let ty = this.toNumber(row['ty']);
        let tz = this.toNumber(row['tz']);
        let rx = this.toNumber(row['rx']);
        let ry = this.toNumber(row['ry']);
        let rz = this.toNumber(row['rz']);
        if (n == null && tx == null && ty == null && tz == null
          && rx == null && ry == null && rz == null) {
          continue;
        }
        if (mode === 'calc') {
          n = (n == null) ? 0 : n;
          tx = (tx == null) ? 0 : tx;
          ty = (ty == null) ? 0 : ty;
          tz = (tz == null) ? 0 : tz;
          rx = (rx == null) ? 0 : rx;
          ry = (ry == null) ? 0 : ry;
          rz = (rz == null) ? 0 : rz;
          const item = { n: n, tx: tx, ty: ty, tz: tz, rx: rx, ry: ry, rz: rz };
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
