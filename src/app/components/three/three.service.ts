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
    private pointLoad: ThreeLoadService,
    private disg: ThreeDisplacementService,
    private reac: ThreeReactService,
    private fsec: ThreeSectionForceService
  ) {
  }

  //////////////////////////////////////////////////////
  // データの変更通知を処理する
  //////////////////////////////////////////////////////
  public chengeData(mode: string = '', index: number = 0): void {

    switch (mode) {

      case 'fileLoad':
        // ファイルを読み込んだ
        this.node.chengeData();
        this.member.chengeData();
        this.joint.chengeData(index);
        this.fixNode.chengeData(index);
        this.pointLoad.chengeData(index);
        this.fixMember.chengeData(index);

        this.disg.ClearData();
        this.fsec.ClearData();
        this.reac.ClearData();
        break;
      case 'result':

        break;

      default:
        // 現在の編集モードにおいてデータを変更した
        switch (this.mode) {
          // 節点
          case 'nodes':
            this.node.chengeData();
            this.member.chengeData();
            this.joint.chengeData(1);
            break;

          // 支点
          case 'fix_nodes':
            this.fixNode.chengeData(index);
            break;

          // 要素
          case 'members':
            this.member.chengeData();
            this.pointLoad.chengeData(index);
            break;

          // 結合
          case 'joints':
            this.joint.chengeData(index);
            break;

          // バネ
          case 'fix_member':
            this.fixMember.chengeData(index);
            break;

          // 荷重図
          case 'loads':
            this.pointLoad.chengeData(index);
            // this.memberLoad.chengeData();
            break;

          // 着目点
          case 'notice_points':
            break;

          // 変位図
          case 'disg':
            this.disg.chengeData(index);
            break;
          case 'comb_disg':
            break;
          case 'pik_disg':
            break;

          // 断面力図
          case 'fsec':
            this.fsec.chengeData(index);
            break;
          case 'comb_fsec':
            break;
          case 'pik_fsec':
            break;

          // 反力図
          case 'reac':
            this.reac.chengeData(index);
            break;
          case 'comb_reac':
            break;
          case 'pik_reac':
            break;
        }
    }
    // 再描画
    this.scene.render();
  }


  //////////////////////////////////////////////////////
  // データをクリアする
  //////////////////////////////////////////////////////
  public ClearData(): void {
    // 節点データの削除
    this.node.ClearData();
    this.member.ClearData();
    this.joint.ClearData();
    this.pointLoad.ClearData();
    //this.memberLoad.ClearData(this.scene);
    this.disg.ClearData();
    this.fsec.ClearData();
    this.reac.ClearData();

    // 再描画
    this.scene.render();
  }


  //////////////////////////////////////////////////////
  // 編集モードの変更通知を処理する
  //////////////////////////////////////////////////////
  public ChengeMode(ModeName: string, currentPage: number = 1): void {

    // モードの変更
    if (this.mode !== ModeName) {

      // #region 節点の表示制御
      if (['fsec', 'comb_fsec', 'pik_fsec'].indexOf(ModeName) >= 0) {
        this.node.visible(false); // 節点を表示しない
      } else {
        this.node.visible(true); // 節点を表示する
        // 節点番号の表示制御
        if (['nodes', 'fix_nodes', 'disg', 'comb_disg', 'pik_disg', 'reac', 'comb_reac', 'pik_reac'].indexOf(ModeName) >= 0) {
          this.node.Enable(); // 節点番号を表示する
        } else {
          this.node.Disable(); // 節点番号を表示しない
        }
      }
      // #endregion

      // #region 要素番号の表示制御
      if (['members', 'joints', 'notice_points', 'fix_member', 'fsec', 'comb_fsec', 'pik_fsec'].indexOf(ModeName) >= 0) {
        this.member.Enable(); // 要素番号を表示する
      } else {
        this.member.Disable(); // 要素番号を表示しない
      }
      // #endregion

    }


    // モード か カレントページの変更
    if (this.mode !== ModeName || this.currentIndex !== currentPage) {

      // 支点データを表示する
      if (['fix_nodes'].indexOf(ModeName) >= 0) {
        this.fixNode.chengeData(currentPage); // 支点データを表示する
      } else {
        this.fixNode.ClearData(); // 支点データを表示しない
      }

      // 結合データを表示する
      if (['nodes', 'joints'].indexOf(ModeName) >= 0) {
        this.joint.chengeData(currentPage); // 結合データを表示する
      } else {
        this.joint.ClearData(); // 結合データを表示しない
      }

      // バネデータを表示する
      if (['fix_member'].indexOf(ModeName) >= 0) {
        this.fixMember.chengeData(currentPage); // 支点データを表示する
      } else {
        this.fixMember.ClearData(); // 支点データを表示しない
      }

      // 荷重
      if (['loads'].indexOf(ModeName) >= 0) {
        this.pointLoad.chengeData(currentPage);
      } else {
        this.pointLoad.ClearData();
      }

      // 変位図
      if (['disg', 'comb_disg', 'pik_disg'].indexOf(ModeName) >= 0) {
        this.disg.chengeData(currentPage);
        this.disg.guiEnable();
      } else {
        this.disg.ClearData();
        this.disg.guiDisable();
      }

      // 断面力
      if (['fsec', 'comb_fsec', 'pik_fsec'].indexOf(ModeName) >= 0) {
        this.fsec.chengeData(currentPage);
        this.fsec.guiEnable();
        this.node.visible(false);
      } else {
        this.fsec.ClearData();
        this.fsec.guiDisable();
        this.node.visible(true);
      }

      // 反力
      if (['reac', 'comb_reac', 'pik_reac'].indexOf(ModeName) >= 0) {
        this.reac.chengeData(currentPage);
      } else {
        this.reac.ClearData();
      }

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

      case 'members':
      case 'joints':
      case 'notice_points':
        this.member.detectObject(raycaster, action);
        break;

      case 'loads':
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
    this.scene.render();
  }
}
