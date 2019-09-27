import { Injectable } from '../components/result/result-disg/node_modules/@angular/core';
import { InputNodesService } from '../components/input/input-nodes/input-nodes.service';
import { InputMembersService } from '../components/input/input-members/input-members.service';
import { InputDefineService } from '../components/input/input-define/input-define.service';
import { InputCombineService } from '../components/input/input-combine/input-combine.service';
import { InputPickupService } from '../components/input/input-pickup/input-pickup.service';


@Injectable({
  providedIn: 'root'
})
export class DataHelperService {

  constructor(private node: InputNodesService,
              private member: InputMembersService,
              private define: InputDefineService,
              private combine:InputCombineService,
              private pickup: InputPickupService){ }

  // 文字列string を数値にする
  public toNumber(num: string, digit: number = null): number {
    let result: number = null;
    try {
      const tmp: string = num.toString().trim();
      if (tmp.length > 0) {
        result = ((n: number) => isNaN(n) ? null : n)(+tmp);
      }
    } catch{
      result = null;
    }
    if (digit != null) {
      const dig: number = 10 ** digit;
      result = Math.round(result * dig) / dig;
    }
    return result;
  }
  
    // 補助関数
    public getNodeNo(memberNo: string) {
      const jsonData = { ni: '', nj: '' };
  
      const memberList: {} = this.member.getMemberJson('unity-members');
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
  
    public getNodePos(nodeNo: string) {
      const nodeList: {} = this.node.getNodeJson('unity-nodes');
      if (Object.keys(nodeList).length <= 0) {
        return null;
      }
      if (!(nodeNo in nodeList)) {
        return null;
      }
      const node = nodeList[nodeNo];
      return node;
    }
  
    public getMemberLength(memberNo: string): number {
      const node: {} = this.getNodeNo(memberNo);
      const ni: string = node['ni'];
      const nj: string = node['nj'];
      if (ni === '' || nj === '') {
        return null;
      }
      const iPos = this.getNodePos(ni)
      const jPos = this.getNodePos(nj)
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

  // 有効な DEFINEケース数を調べる
  public getDefineCaseCount(): number {
    const dict = this.define.getDefineJson();
    return Object.keys(dict).length;
  }


  // 有効な COMBINE ケース数を調べる
  public getCombineCaseCount(): number {
    const dict = this.combine.getCombineJson();
    return Object.keys(dict).length;
  }

  // COMBINE ケース名を取得する
  public getCombineName(currentPage: number): string {

    if (currentPage < 1) {
      return '';
    }
    if (currentPage > this.combine.combine.length) {
      return '';
    }

    const i = currentPage - 1;
    const tmp = this.combine.combine[i];

    let result = '';
    if ('name' in tmp) {
      result = tmp['name'];
    }
    return result;
  }

  // PICKUP ケース名を取得する
  public getPickUpName(currentPage: number): string {

    if (currentPage < 1) {
      return '';
    }
    if (currentPage > this.pickup.pickup.length) {
      return '';
    }

    const i = currentPage - 1;
    const tmp = this.pickup.pickup[i];

    let result = '';
    if ('name' in tmp) {
      result = tmp['name'];
    }
    return result;
  }

  // 有効な PICKUP ケース数を調べる
  public getPickupCaseCount(): number {
    const dict = this.pickup.getPickUpJson();
    return Object.keys(dict).length;
  }

}
