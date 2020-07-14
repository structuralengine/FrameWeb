import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { InputNodesService } from '../input-nodes/input-nodes.service';

@Injectable({
  providedIn: 'root'
})
export class InputMembersService {
  public member: any[];

  constructor(private node: InputNodesService,
              private helper: DataHelperModule) {
    this.clear();
  }

  public clear(): void {
    this.member = new Array();
  }
  
  public getMemberColumns(index: number): any {

    let result: any = null;
    for ( const tmp of this.member) {
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

      const ni = this.helper.toNumber(item['ni']);
      const nj = this.helper.toNumber(item['nj']);
      const e = this.helper.toNumber(item['e']);
      const cg = this.helper.toNumber(item['cg']);

      const result = {
        id: index,
        L: '',
        ni: (ni === null) ? '' : ni.toFixed(0),
        nj: (nj === null) ? '' : nj.toFixed(0),
        e: (e === null) ? '' : e.toFixed(0),
        cg: (cg === null) ? '' : cg.toFixed(0)
      };
      
      this.member.push(result);
    }
  }

  public getMemberJson(empty: number = null): object {

    const jsonData: object = {};

    for (let i = 0; i < this.member.length; i++) {

      const columns = this.member[i];
      const ni = this.helper.toNumber(columns['ni']);
      const nj = this.helper.toNumber(columns['nj']);
      const e = this.helper.toNumber(columns['e']);
      const cg = this.helper.toNumber(columns['cg']);

      if (ni == null && nj == null && e == null && cg == null) {
        continue;
      }

      const key: string = columns.id;

      jsonData[key] = { 
        'ni': (ni == null) ? empty : ni, 
        'nj': (nj == null) ? empty : nj, 
        'e': (e == null) ? empty : e, 
        'cg': (cg == null) ? empty : cg
      };

    }

    return jsonData;
  }

  // 補助関数 ///////////////////////////////////////////////////////////////

  public getMember(memberNo: string) {

    const member = this.member.find((columns) => {
      return columns.id === memberNo;
    })

    if (member === undefined) {
      return { ni: null, nj: null };
    }

    return member;

  }

  public getMemberLength(memberNo: string): number {

    const memb = this.getMember(memberNo);
    const ni: string = memb.ni;
    const nj: string = memb.nj;
    if (ni === null || nj === null) {
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
