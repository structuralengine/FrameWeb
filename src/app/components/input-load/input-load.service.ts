import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputLoadService {

  public load_name: any[];
  public load: any[];

  constructor() {
    this.clear();
  }

  public clear(): void {
    this.load_name = new Array();
    this.load = new Array();
  }

  public getLoadNameColumns(index: number): any {

    let result: any = null;
    for (let i = 0; i < this.load_name.length; i++) {
      const tmp = this.load_name[i];
      if (tmp['id'] === index.toString()) {
        result = tmp;
        break;
      }
    }
    // 対象データが無かった時に処理
    if (result == null) {
      result = { id: index, rate: '', symbol: '', name: '', fix_node: '', fix_member: '', element: '', joint: '' };
      this.load_name.push(result);
    }
    return result;
  }
  
  public getLoadColumns(typNo: number, row: number): any {

    let target: any = null;
    let result: any = null;

    // タイプ番号を探す
    if (!this.load[typNo]) {
      target = new Array();
    } else {
      target = this.load[typNo];
    }

    // 行を探す
    for (let i = 0; i < target.length; i++) {
      const tmp = target[i];
      if (tmp['row'] === row) {
        result = tmp;
        break;
      }
    }

    // 対象データが無かった時に処理
    // 対象行が無かった時に処理
    if (result == null) {
      result = {
        row: row, m1: '', m2: '', direction: '', mark: '', L1: '', L2: '', P1: '', P2: '',
        n: '', tx: '', ty: '', tz: '', rx: '', ry: '', rz: ''
      };
      target.push(result);
      this.load[typNo] = target;
    }
    return result;
  }

  public setLoadJson(jsonData: {}): void {

    if (!('load' in jsonData)) {
      return;
    }
    const json: {} = jsonData['load'];

    for (const index of Object.keys(json)) {
      const tmp_load1 = {};
      const tmp_load2 = {};
      const item1: {} = json[index];
      const _rate: string = ('rate' in item1) ? item1['rate'] : '';
      const _symbol: string = ('symbol' in item1) ? item1['symbol'] : '';
      const _name: string = ('name' in item1) ? item1['name'] : '';
      const _fix_node: string = ('fix_node' in item1) ? item1['fix_node'] : '';
      const _fix_member: string = ('fix_member' in item1) ? item1['fix_member'] : '';
      const _element: string = ('element' in item1) ? item1['element'] : '';
      const _joint: string = ('joint' in item1) ? item1['joint'] : '';

      const result1 = {
        id: index, rate: _rate, symbol: _symbol, name: _name,
        fix_node: _fix_node, fix_member: _fix_member, element: _element, joint: _joint
      };
      this.load_name.push(result1);

      if ('load_node' in item1) {
        const load_node_list: any[] = item1['load_node']
        for (let i = 0; i < load_node_list.length; i++) {
          const item2: {} = load_node_list[i];
          const _row: string = ('row' in item2) ? item2['row'] : (i + 1).toString();
          const _n: string = ('n' in item2) ? item2['n'] : '';
          const _tx: string = ('tx' in item2) ? item2['tx'] : '';
          const _ty: string = ('ty' in item2) ? item2['ty'] : '';
          const _tz: string = ('tz' in item2) ? item2['tz'] : '';
          const _rx: string = ('rx' in item2) ? item2['rx'] : '';
          const _ry: string = ('ry' in item2) ? item2['ry'] : '';
          const _rz: string = ('rz' in item2) ? item2['rz'] : '';
          const result2 = { row: _row, n: _n, tx: _tx, ty: _ty, tz: _tz, rx: _rx, ry: _ry, rz: _rz };
          tmp_load1[_row] = result2;
        }
      }
      if ('load_member' in item1) {
        const load_member_list: any[] = item1['load_member']
        for (let i = 0; i < load_member_list.length; i++) {
          const item3: {} = load_member_list[i];
          const _row: string = ('row' in item3) ? item3['row'] : (i + 1).toString();
          const _m1: string = ('m1' in item3) ? item3['m1'] : '';
          const _m2: string = ('m2' in item3) ? item3['m2'] : '';
          const _L1: string = ('L1' in item3) ? item3['L1'] : '';

          const _direction: string = ('direction' in item3) ? item3['direction'] : '';
          const _mark: string = ('mark' in item3) ? item3['mark'] : '';

          const _L2: string = ('L2' in item3) ? item3['L2'] : '';
          const _P1: string = ('P1' in item3) ? item3['P1'] : '';
          const _P2: string = ('P2' in item3) ? item3['P2'] : '';
          const result3 = { row: _row, m1: _m1, m2: _m2, direction: _direction, mark: _mark, L1: _L1, L2: _L2, P1: _P1, P2: _P2 };
          tmp_load2[_row] = result3;
        }
      }

      // 同じ行に load_node があったら合成する
      const tmp_load = new Array();
      for (const row1 of Object.keys(tmp_load1)) {
        const result2 = tmp_load1[row1];
        if (row1 in tmp_load2) {
          const result3 = tmp_load2[row1];
          result2['m1'] = result3['m1'];
          result2['m2'] = result3['m2'];
          result2['direction'] = result3['direction'];
          result2['mark'] = result3['mark'];
          result2['L1'] = result3['L1'];
          result2['L2'] = result3['L2'];
          result2['P1'] = result3['P1'];
          result2['P2'] = result3['P2'];
          delete tmp_load2[row1];
        }
        tmp_load.push(result2);
      }
      for (const row2 of Object.keys(tmp_load2)) {
        const result3 = tmp_load2[row2];
        tmp_load.push(result3);
      }

      this.load[index] = tmp_load;
    }
  }

}
