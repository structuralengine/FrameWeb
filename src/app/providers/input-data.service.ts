import { Injectable } from '@angular/core';
import { InputCombineService } from '../components/input/input-combine/input-combine.service';
import { InputDefineService } from '../components/input/input-define/input-define.service';
import { InputElementsService } from '../components/input/input-elements/input-elements.service';
import { InputFixMemberService } from '../components/input/input-fix-member/input-fix-member.service';
import { InputFixNodeService } from '../components/input/input-fix-node/input-fix-node.service';
import { InputJointService } from '../components/input/input-joint/input-joint.service';
import { InputLoadService } from '../components/input/input-load/input-load.service';
import { InputMembersService } from '../components/input/input-members/input-members.service';
import { InputNodesService } from '../components/input/input-nodes/input-nodes.service';
import { InputNoticePointsService } from '../components/input/input-notice-points/input-notice-points.service';
import { InputPickupService } from '../components/input/input-pickup/input-pickup.service';

@Injectable({
  providedIn: 'root'
})
export class InputDataService {

  constructor(private combine: InputCombineService,
    private define: InputDefineService,
    private element: InputElementsService,
    private fixmenber: InputFixMemberService,
    private fixnode: InputFixNodeService,
    private joint: InputJointService,
    private load: InputLoadService,
    private member: InputMembersService,
    private node: InputNodesService,
    private notice: InputNoticePointsService,
    private pickup: InputPickupService) {
    this.clear();
  }

  // データをクリアする ///////////////////////////////////////////////////////////////
  public clear(): void {
    this.node.clear();
    this.fixnode.clear();
    this.member.clear();
    this.element.clear();
    this.joint.clear();
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
    this.notice.setNoticePointsJson(jsonData);
    this.fixmenber.setFixMemberJson(jsonData);
    this.load.setLoadJson(jsonData);
    this.define.setDefineJson(jsonData);
    this.combine.setCombineJson(jsonData);
    this.pickup.setPickUpJson(jsonData);
  }

  // データを生成 /////////////////////////////////////////////////////////////////////
  // mode file:ファイルに保存用データを生成
  //      unity: unity に送信用データを生成
  //      calc: 計算サーバーに送信用データを生成
  public getInputText(mode: string = 'file', Properties = {}): string {

    const jsonData: {} = this.getInputJson(mode);

    // パラメータを追加したい場合
    for (const key of Object.keys(Properties)) {
      jsonData[key] = Properties[key];
    }

    const result: string = JSON.stringify(jsonData);
    return result;
  }

  private getInputJson(mode: string) {
    const jsonData = {};

    const node: {} = this.node.getNodeJson(mode);
    if (Object.keys(node).length > 0) {
      jsonData['node'] = node;
    }

    const fix_node: {} = this.fixnode.getFixNodeJson(mode);
    if (Object.keys(fix_node).length > 0) {
      jsonData['fix_node'] = fix_node;
    }

    const member: {} = this.member.getMemberJson(mode);
    if (Object.keys(member).length > 0) {
      jsonData['member'] = member;
    }

    const element: {} = this.element.getElementJson(mode);
    if (Object.keys(element).length > 0) {
      jsonData['element'] = element;
    }

    const joint: {} = this.joint.getJointJson(mode);
    if (Object.keys(joint).length > 0) {
      jsonData['joint'] = joint;
    }

    const notice_points: {} = this.notice.getNoticePointsJson(mode);
    if (Object.keys(notice_points).length > 0) {
      jsonData['notice_points'] = notice_points;
    }

    const fix_member: {} = this.fixmenber.getFixMemberJson(mode);
    if (Object.keys(fix_member).length > 0) {
      jsonData['fix_member'] = fix_member;
    }

    const load: {} = this.load.getLoadJson(mode);
    if (Object.keys(load).length > 0) {
      jsonData['load'] = load;
    }

    if (mode === 'file') {
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
    }

    return jsonData;
  }


}