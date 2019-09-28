import { Injectable } from '@angular/core';
import { DataHelperService } from '../../../providers/data-helper.service';
import { InputNodesService } from '../input-nodes/input-nodes.service';

@Injectable({
  providedIn: 'root'
})
export class InputMembersService {
  public member: any[];

  constructor(private node: InputNodesService,
              private helper: DataHelperService) {
    this.clear();
  }

  public clear(): void {
    this.member = new Array();
  }
  
  public getMemberColumns(index: number): any {

    let result: any = null;
    for (let i = 0; i < this.member.length; i++) {
      const tmp = this.member[i];
      if (tmp['id'].toString() === index.toString()) {
        result = tmp;
        break;
      }
    }
    // 対象データが無かった時に処理
    if (result == null) {
      result = { id: index, L: '', ni: '', nj: '', e: '', cg: '' };
      this.member.push(result);
    }
    return result;
  }

  public setMemberJson(jsonData: {}): void {
    if (!('member' in jsonData)) {
      return;
    }
    const json: {} = jsonData['member'];
    for (const index of Object.keys(json)) {
      const item = json[index];
      const result = { id: index, L: '', ni: item.ni, nj: item.nj, e: item.e, cg: item.cg };
      this.member.push(result);
    }
  }

  public getMemberJson(mode: string = 'file') {

    const jsonData = {};
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('-members') < 0) {
      return jsonData;
    }

    for (let i = 0; i < this.member.length; i++) {
      const row = this.member[i];
      let ni = this.helper.toNumber(row['ni']);
      let nj = this.helper.toNumber(row['nj']);
      let e = this.helper.toNumber(row['e']);
      let cg = this.helper.toNumber(row['cg']);
      if (ni == null && nj == null && e == null && cg == null) {
        continue;
      }
      let item = {};
      if (mode === 'calc') {
        ni = (ni == null) ? 0 : ni;
        nj = (nj == null) ? 0 : nj;
        e = (e == null) ? 0 : e;
        cg = (cg == null) ? 0 : cg;
        item = { 'ni': ni, 'nj': nj, 'e': e, 'cg': cg };
      } else {
        for (const _key in row) {
          if ((_key !== 'id') && (_key !== 'L')) {
            item[_key] = row[_key];
          }
        }
      }
      const key: string = row.id;
      jsonData[key] = item;
    }
    return jsonData;
  }

  // 補助関数 ///////////////////////////////////////////////////////////////

  public getNodeNo(memberNo: string) {
    const jsonData = { ni: '', nj: '' };

    const memberList: {} = this.getMemberJson('unity-members');
    if (Object.keys(memberList).length <= 0) {
      return jsonData;
    }
    if (!(memberNo in memberList)) {
      return jsonData;
    }
    const member = memberList[memberNo];
    jsonData['ni'] = member['ni']
    jsonData['nj'] = member['nj']
    return jsonData;
  }

  public getMemberLength(memberNo: string): number {
    const node: {} = this.getNodeNo(memberNo);
    const ni: string = node['ni'];
    const nj: string = node['nj'];
    if (ni === '' || nj === '') {
      return null;
    }
    const iPos = this.node.getNodePos(ni)
    const jPos = this.node.getNodePos(nj)
    if (iPos == null || jPos == null) {
      return null;
    }
    const xi: number = iPos['x'];
    const yi: number = iPos['y'];
    const zi: number = iPos['z'];
    const xj: number = jPos['x'];
    const yj: number = jPos['y'];
    const zj: number = jPos['z'];

    const result: number = Math.sqrt((xi - xj) ** 2 + (yi - yj) ** 2 + (zi - zj) ** 2);
    return result;

  }
}
