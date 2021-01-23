import { Injectable } from '@angular/core';
import { InputDataService } from 'src/app/providers/input-data.service';
import { SceneService } from './scene.service';
import * as THREE from 'three';
import { DataHelperModule } from 'src/app/providers/data-helper.module';
import { DeclareFunctionStmt } from '@angular/compiler';

import { ThreeNodesService } from './geometry/three-nodes.service';
import { ThreeMembersService } from './geometry/three-members.service';
import { ThreeFixNodeService } from './geometry/three-fix-node.service';
import { ThreeFixMemberService } from './geometry/three-fix-member.service';
import { ThreeJointService } from './geometry/three-joint.service';
import { ThreeLoadService } from './geometry/three-load.service';

import { ThreeDisplacementService } from './geometry/three-displacement.service';
import { ThreeSectionForceService } from './geometry/three-section-force.service';
import { ThreeReactService } from './geometry/three-react.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  private mode: string;
  private currentIndex: number;

  constructor(public scene: SceneService,
              private node: ThreeNodesService,
              private member: ThreeMembersService,
              private fixNode: ThreeFixNodeService,
              private fixMember: ThreeFixMemberService,
              private joint: ThreeJointService,
              private load: ThreeLoadService,
              private disg: ThreeDisplacementService,
              private reac: ThreeReactService,
              private fsec: ThreeSectionForceService) {
  }

  //////////////////////////////////////////////////////
  // 初期化
  //////////////////////////////////////////////////////
  public OnInit(): void {
    this.node.OnInit();
    this.member.OnInit();
  }

  //////////////////////////////////////////////////////
  // データの変更通知を処理する
  //////////////////////////////////////////////////////
  public changeData(mode: string = '', index: number = 0): void {

    switch (mode) {

      case 'fileLoad':
        // ファイルを読み込んだ
        this.node.changeData();
        this.member.changeData();
        this.fixNode.ClearData();
        this.fixMember.ClearData();
        this.joint.ClearData();
        this.load.ClearData();
        this.disg.ClearData();
        this.reac.ClearData();
        this.fsec.ClearData();
        break;

      case 'nodes':
        this.node.changeData();
        this.member.changeData();
        break;

      case 'members':
        this.member.changeData();
        break;

      case 'elements':
        // nothisng
        break;
      case 'notice_points':
        // nothisng
        break;

      case 'joints':
        this.joint.changeData(index);
        break;

      case 'fix_nodes':
        this.fixNode.changeData(index);
        break;

      case 'fix_member':
        this.fixMember.changeData(index);
        break;

      case 'load_names':
        // nothisng
        break;

      case 'load_points':
      case 'load_members':
        this.load.changeData(index);
        break;

      default:
        // 何御しない
        return;
    }

    // 再描画
    this.scene.render();

    this.currentIndex = index;

  }


  //////////////////////////////////////////////////////
  // データをクリアする
  //////////////////////////////////////////////////////
  public ClearData(): void {
    // 節点データの削除
    this.node.ClearData();
    this.member.ClearData();
    this.fixNode.ClearData();
    this.fixMember.ClearData();
    this.joint.ClearData();
    this.load.ClearData();
    this.disg.ClearData();
    this.reac.ClearData();
    this.fsec.ClearData();
    this.disg.ClearData();
    this.fsec.ClearData();
    this.reac.ClearData();

    // 再描画
    this.scene.render();
  }


  //////////////////////////////////////////////////////
  // 編集モードの変更通知を処理する
  //////////////////////////////////////////////////////
  public ChangeMode(ModeName: string, currentPage: number = 1): void {

    if (this.mode !== ModeName) {
      this.currentIndex = -1;
    }

    switch (ModeName) {

      case 'nodes':
        this.node.visibleChange(true, true, true);
        this.member.visibleChange(true, false, false);
        this.fixNode.visibleChange(false);
        this.fixMember.visibleChange(false);
        this.joint.visibleChange(false);
        this.load.visibleChange(false, false);
        this.disg.visibleChange(false);
        this.reac.visibleChange(false);
        this.fsec.visibleChange(false);
        break;

      case 'members':
      case 'elements':
        this.node.visibleChange(true, false, false);
        this.member.visibleChange(true, true, true);
        this.fixNode.visibleChange(false);
        this.fixMember.visibleChange(false);
        this.joint.visibleChange(false);
        this.load.visibleChange(false, false);
        this.disg.visibleChange(false);
        this.reac.visibleChange(false);
        this.fsec.visibleChange(false);
        break;

      case 'notice_points':
        this.node.visibleChange(true, false, false);
        this.member.visibleChange(true, true, false);
        this.fixNode.visibleChange(false);
        this.fixMember.visibleChange(false);
        this.joint.visibleChange(false);
        this.load.visibleChange(false, false);
        this.disg.visibleChange(false);
        this.reac.visibleChange(false);
        this.fsec.visibleChange(false);
        break;

      case 'joints':
        if (this.currentIndex !== currentPage) {
          this.joint.changeData(currentPage);
        }
        this.node.visibleChange(true, false, false);
        this.member.visibleChange(true, true, false);
        this.fixNode.visibleChange(false);
        this.fixMember.visibleChange(false);
        this.joint.visibleChange(true);
        this.load.visibleChange(false, false);
        this.disg.visibleChange(false);
        this.reac.visibleChange(false);
        this.fsec.visibleChange(false);
        break;

      case 'fix_nodes':
        if (this.currentIndex !== currentPage) {
          this.fixNode.changeData(currentPage);
        }
        this.node.visibleChange(true, true, false);
        this.member.visibleChange(true, false, false);
        this.fixNode.visibleChange(true);
        this.fixMember.visibleChange(false);
        this.joint.visibleChange(false);
        this.load.visibleChange(false, false);
        this.disg.visibleChange(false);
        this.reac.visibleChange(false);
        this.fsec.visibleChange(false);

        break;

      case 'fix_member':
        if (this.currentIndex !== currentPage) {
          this.fixMember.changeData(currentPage);
        }
        this.node.visibleChange(true, false, false);
        this.member.visibleChange(true, true, false);
        this.fixNode.visibleChange(false);
        this.fixMember.visibleChange(true);
        this.joint.visibleChange(false);
        this.load.visibleChange(false, false);
        this.disg.visibleChange(false);
        this.reac.visibleChange(false);
        this.fsec.visibleChange(false);
        break;

      case 'load_names':
        if (this.currentIndex !== currentPage) {
          this.load.changeData(currentPage);
        }
        this.node.visibleChange(true, false, false);
        this.member.visibleChange(true, false, false);
        this.fixNode.visibleChange(true);
        this.fixMember.visibleChange(true);
        this.joint.visibleChange(true);
        this.load.visibleChange(true, false);
        this.disg.visibleChange(false);
        this.reac.visibleChange(false);
        this.fsec.visibleChange(false);
        break;

      case 'load_points':
        if (this.currentIndex !== currentPage) {
          this.load.changeData(currentPage);
        }
        this.node.visibleChange(true, true, false);
        this.member.visibleChange(true, true, false);
        this.fixNode.visibleChange(false);
        this.fixMember.visibleChange(false);
        this.joint.visibleChange(false);
        this.load.visibleChange(true, true);
        this.disg.visibleChange(false);
        this.reac.visibleChange(false);
        this.fsec.visibleChange(false);
        break;

      case 'disg':
        if (this.currentIndex !== currentPage) {
          this.disg.changeData(currentPage);
        }
        this.node.visibleChange(true, true, false);
        this.member.visibleChange(true, false, false);
        this.fixNode.visibleChange(false);
        this.fixMember.visibleChange(false);
        this.joint.visibleChange(false);
        this.load.visibleChange(false, false);
        this.disg.visibleChange(true);
        this.reac.visibleChange(false);
        this.fsec.visibleChange(false);
        break;

      case 'comb_disg':
      case 'pik_disg':
        // 何も表示しない
        this.node.visibleChange(true, true, true);
        this.member.visibleChange(true, false, false);
        this.fixNode.visibleChange(false);
        this.fixMember.visibleChange(false);
        this.joint.visibleChange(false);
        this.load.visibleChange(false, false);
        this.disg.visibleChange(false);
        this.reac.visibleChange(false);
        this.fsec.visibleChange(false);
        break;

      case 'reac':
        if (this.currentIndex !== currentPage) {
          this.reac.changeData(currentPage);
        }
        this.node.visibleChange(true, true, false);
        this.member.visibleChange(true, false, false);
        this.fixNode.visibleChange(false);
        this.fixMember.visibleChange(false);
        this.joint.visibleChange(false);
        this.load.visibleChange(false, false);
        this.disg.visibleChange(false);
        this.reac.visibleChange(true);
        this.fsec.visibleChange(false);
        break;
      
      case 'comb_reac':
      case 'pik_reac':
        // 何も表示しない
        this.node.visibleChange(true, true, true);
        this.member.visibleChange(true, false, false);
        this.fixNode.visibleChange(false);
        this.fixMember.visibleChange(false);
        this.joint.visibleChange(false);
        this.load.visibleChange(false, false);
        this.disg.visibleChange(false);
        this.reac.visibleChange(false);
        this.fsec.visibleChange(false);       
        break;
    
      case 'fsec':
      case 'comb_fsec':
      case 'pik_fsec':
        if (this.currentIndex !== currentPage) {
          this.fsec.changeData(currentPage, ModeName);
        }
        this.node.visibleChange(true, false, false);
        this.member.visibleChange(true, true, false);
        this.fixNode.visibleChange(false);
        this.fixMember.visibleChange(false);
        this.joint.visibleChange(false);
        this.load.visibleChange(false, false);
        this.disg.visibleChange(false);
        this.reac.visibleChange(false);
        this.fsec.visibleChange(true);
        break;

    }

    this.mode = ModeName;
    this.currentIndex = currentPage;

    // 再描画
    this.scene.render();
  }

  //////////////////////////////////////////////////////
  // マウス位置とぶつかったオブジェクトを検出する
  //////////////////////////////////////////////////////
  public detectObject(mouse: THREE.Vector2, action: string): void {

    const raycaster = this.scene.getRaycaster(mouse);

    switch (this.mode) {
      case 'nodes': // 節点データの更新
      case 'fix_nodes':
        this.node.detectObject(raycaster, action);
        break;

      case 'joints':
        this.joint.detectObject(raycaster, action);
        break;

      case 'members':
      case 'elements':
        this.member.detectObject(raycaster, action);
        break;

      case 'fix_member':
        this.member.detectObject(raycaster, action);
        break;

      case 'load_points':

        break;

      case 'load_members':
        this.member.detectObject(raycaster, action);
        break;

      case 'load_names':
        break;

      case 'disg':
      case 'comb_disg':
      case 'pik_disg':
        break;

      case 'fsec':
      case 'comb_fsec':
      case 'pik_fsec':
        break;

      case 'reac':
      case 'comb_reac':
      case 'pik_reac':
        break;
    }
    // 再描画
    //this.scene.render();
  }
}
