import { Injectable } from '@angular/core';
import { InputCombineService } from '../components/input/input-combine/input-combine.service';
import { InputDefineService } from '../components/input/input-define/input-define.service';
import { InputElementsService } from '../components/input/input-elements/input-elements.service';
import { InputFixMemberService } from '../components/input/input-fix-member/input-fix-member.service';
import { InputFixNodeService } from '../components/input/input-fix-node/input-fix-node.service';
import { InputJointService } from '../components/input/input-joint/input-joint.service';
import { InputPanelService } from '../components/input/input-panel/input-panel.service';
import { InputLoadService } from '../components/input/input-load/input-load.service';
import { InputMembersService } from '../components/input/input-members/input-members.service';
import { InputNodesService } from '../components/input/input-nodes/input-nodes.service';
import { InputNoticePointsService } from '../components/input/input-notice-points/input-notice-points.service';
import { InputPickupService } from '../components/input/input-pickup/input-pickup.service';

import { SceneService } from '../components/three/scene.service';
import { DataHelperModule } from './data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class InputDataService {

  constructor(
    private helper: DataHelperModule,
    public combine: InputCombineService,
    public define: InputDefineService,
    public element: InputElementsService,
    public fixmenber: InputFixMemberService,
    public fixnode: InputFixNodeService,
    public joint: InputJointService,
    public panel: InputPanelService,
    public load: InputLoadService,
    public member: InputMembersService,
    public node: InputNodesService,
    public notice: InputNoticePointsService,
    public pickup: InputPickupService,
    private three: SceneService) {
    this.clear();
  }

  // データをクリアする ///////////////////////////////////////////////////////////////
  public clear(): void {
    this.node.clear();
    this.fixnode.clear();
    this.member.clear();
    this.element.clear();
    this.joint.clear();
    this.panel.clear();
    this.notice.clear();
    this.fixmenber.clear();
    this.load.clear();
    this.define.clear();
    this.combine.clear();
    this.pickup.clear();
  }

  // ファイルを読み込む ///////////////////////////////////////////////////////////////
  public loadInputData(inputText: string): void {
    this.clear();
    const jsonData: {} = JSON.parse(inputText);
    this.node.setNodeJson(jsonData);
    this.fixnode.setFixNodeJson(jsonData);
    this.member.setMemberJson(jsonData);
    this.element.setElementJson(jsonData);
    this.joint.setJointJson(jsonData);
    this.panel.setPanelJson(jsonData);
    this.notice.setNoticePointsJson(jsonData);
    this.fixmenber.setFixMemberJson(jsonData);
    this.load.setLoadJson(jsonData);
    this.define.setDefineJson(jsonData);
    this.combine.setCombineJson(jsonData);
    this.pickup.setPickUpJson(jsonData);
    this.three.setSetting(jsonData);

    if('dimension' in jsonData){
      this.helper.dimension = jsonData['dimension'];
    }

  }

  // データを生成 /////////////////////////////////////////////////////////////////////
  // 計算サーバーに送信用データを生成
  public getCalcText(Properties = {}): string {

    const jsonData: {} = this.getInputJson(0);

    // パラメータを追加したい場合
    for (const key of Object.keys(Properties)) {
      jsonData[key] = Properties[key];
    }

    const result: string = JSON.stringify(jsonData);
    return result;
  }

  // ファイルに保存用データを生成
  // empty = null: ファイル保存時
  // empty = 0: 計算時
  public getInputJson(empty: number = null): object {

    const jsonData = {};

    const node: {} = this.node.getNodeJson(empty);
    if (Object.keys(node).length > 0) {
      jsonData['node'] = node;
    }

    const fix_node: {} = this.fixnode.getFixNodeJson(empty);
    if (Object.keys(fix_node).length > 0) {
      jsonData['fix_node'] = fix_node;
    }

    const member: {} = this.member.getMemberJson(empty);
    if (Object.keys(member).length > 0) {
      jsonData['member'] = member;
    }

    const element: {} = this.element.getElementJson(empty);
    if (Object.keys(element).length > 0) {
      jsonData['element'] = element;
    }

    const joint: {} = this.joint.getJointJson(empty);
    if (Object.keys(joint).length > 0) {
      jsonData['joint'] = joint;
    }

    const panel: {} = this.panel.getPanelJson(empty);
    if (Object.keys(panel).length > 0) {
      jsonData['panel'] = panel;
    }

    const notice_points: {} = this.notice.getNoticePointsJson();
    if (Object.keys(notice_points).length > 0) {
      jsonData['notice_points'] = notice_points;
    }

    const fix_member: {} = this.fixmenber.getFixMemberJson(empty);
    if (Object.keys(fix_member).length > 0) {
      jsonData['fix_member'] = fix_member;
    }

    const load: {} = this.load.getLoadJson(empty);
    if (Object.keys(load).length > 0) {
      jsonData['load'] = load;
    }

    if (empty === null) {
      const define: {} = this.define.getDefineJson();
      if (Object.keys(define).length > 0) {
        jsonData['define'] = define;
      }
      const combine: {} = this.combine.getCombineJson();
      if (Object.keys(combine).length > 0) {
        jsonData['combine'] = combine;
      }
      const pickup: {} = this.pickup.getPickUpJson();
      if (Object.keys(pickup).length > 0) {
        jsonData['pickup'] = pickup;
      }

      jsonData['three'] = this.three.getSettingJson();
    }

    if (this.helper.dimension === 2 && empty === 0) {
      this.create2Ddata(jsonData);
    }

    jsonData['dimension'] = this.helper.dimension;

    const error = this.checkError(jsonData);
    if (error !== null) {
      jsonData['error'] = error;
    }

    return jsonData;
  }

  public create2Ddata(jsonData: any) {
    // ここに、２次元モードで作成したデータを３次元データとして
    // 成立する形に修正する

    // Set_Node のセクション
    for (const n of Object.keys(jsonData.node)) {
      const node = jsonData.node[n];
        node['z'] = 0;
    }
    // Set_Member のセクション
    for (const m of Object.keys(jsonData.member)) {
      const member = jsonData.member[m];
        member['cg'] = 0;
    }
    // Set_Element のセクション
    for (const type of Object.keys(jsonData.element)) {
      for (const row of Object.keys(jsonData.element[type])) {
        const element = jsonData.element[type][row];
        element['G'] = 1;
        element['J'] = 1;
        element['Iy'] = 1;
      }
    }
    // Set_Joint のセクション
    if('joint' in jsonData) {
      for (const type of Object.keys(jsonData.joint)) {
        for (const row of Object.keys(jsonData.joint[type])) {
          const joint = jsonData.joint[type][row];
          joint['xi'] = 1;
          joint['xj'] = 1;
          joint['yi'] = 1;
          joint['yj'] = 1;
        }
      }
    }

    // Set_Load のセクション
    const fn = {};
    for (const icase of Object.keys(jsonData.load)) {
      if('load_node' in jsonData.load[icase]) {
        for (const load_node of jsonData.load[icase].load_node) {
          load_node['tz'] = 0;
          load_node['rx'] = 0;
          load_node['ry'] = 0;
        }
      }
      const key = jsonData.load[icase].fix_node;
      fn[key] = [];
    }

    // Set_FixNode のセクション
    if ( !('fix_node' in jsonData)) {
      jsonData['fix_node'] = fn;
    }
    for(const n of Object.keys(jsonData.node)) {

      for (const type of Object.keys(jsonData.fix_node)) {

        const target = jsonData.fix_node[type];

        if(target.find( e => e.n === n ) === undefined){
          target.push({ n, tz: 1, rx: 1, ry: 1 });

        } else {
          for (const fix_node of target) {
            fix_node['tz'] = 1;
            fix_node['rx'] = 1
            fix_node['ry'] = 1
          }
        }
      }
    }

    // Set_FixMember のセクション
    if('fix_member' in jsonData) {
      for (const type of Object.keys(jsonData.fix_member)) {
        for (const fix_member of jsonData.fix_member[type]) {
          fix_member['tz'] = 0;
          fix_member['tr'] = 0;
        }
      }
    }

  }


  private checkError(jsonData: object): string {

    // 存在しない節点を使っているかチェックする
    if (!('node' in jsonData)) {
      return 'node データがありません';
    }
    const nodes: object = jsonData['node'];
    if (Object.keys(nodes).length <= 0) {
      return 'node データがありません';
    }

    if (!('member' in jsonData)) {
      return 'member データがありません';
    }
    const members: object = jsonData['member'];
    const memberKeys = Object.keys(members);
    if (memberKeys.length <= 0) {
      return 'member データがありません';
    }

    // 部材で使われている 節点番号が存在するか調べる
    const n: object = {};
    for (const key of memberKeys) {
      const m = members[key];
      for (const name of [m.ni, m.nj]) {
        if (!(name in nodes)) {
          return 'member' + key + 'で使われている node ' + name + 'は、存在しません';
        }
        n[name] = nodes[name];
      }
    }
    jsonData['node'] = n;

    return null;
  }



  public getResultJson(): object {

    const jsonData = {};

    const define: {} = this.define.getDefineJson();
    if (Object.keys(define).length > 0) {
      jsonData['define'] = define;
    }

    const combine: {} = this.combine.getCombineJson();
    if (Object.keys(combine).length > 0) {
      jsonData['combine'] = combine;
    }

    const pickup: {} = this.pickup.getPickUpJson();
    if (Object.keys(pickup).length > 0) {
      jsonData['pickup'] = pickup;
    }

    return jsonData;
  }

}
