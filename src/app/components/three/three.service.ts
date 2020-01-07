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
import { ThreePointLoadService } from './geometry/three-point-load.service';
import { ThreeMemberLoadService } from './geometry/three-member-load.service';

import { ThreeDisplacementService } from './geometry/three-displacement.service';
import { ThreeSectionForceService } from './geometry/three-section-force.service';
import { ThreeReactService } from './geometry/three-react.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  private mode: string;
  private scale: number; // オブジェクトの大きさ

  constructor(public scene: SceneService,
              private node: ThreeNodesService,
              private member: ThreeMembersService,
              private fixNode: ThreeFixNodeService,
              private fixMember: ThreeFixMemberService,
              private joint: ThreeJointService,
              private pointLoad: ThreePointLoadService,
              private memberLoad: ThreeMemberLoadService,
              private disg: ThreeDisplacementService,
              private reac: ThreeReactService,
              private fsec: ThreeSectionForceService
              ) {
    }

  //////////////////////////////////////////////////////
  // データの変更通知を処理する
  //////////////////////////////////////////////////////
  public chengeData(mode: string = '', index: number = 0): void {
    switch ( mode ) {
      case 'fileLoad':
      // ファイルを読み込んだ
      this.node.chengeData(this.scene);
      this.member.chengeData(this.scene);
      this.pointLoad.chengeData(this.scene, index);
      // this.memberLoad.chengeData(this.scene);
      break;
      case 'result':

      break;

    default:
      // 現在ん編集モードにおいてデータを変更した
      switch (this.mode) {
        case 'nodes': // 節点データの更新
          this.node.chengeData(this.scene);
          this.member.chengeData(this.scene);
          break;

        case 'fix_nodes':
          break;

        case 'members':
          this.member.chengeData(this.scene);
          break;

        case 'joints':
          break;

        case 'loads':
          this.pointLoad.chengeData(this.scene, index);
          // this.memberLoad.chengeData(this.scene);
          break;

        case 'notice_points':
          break;

        case 'comb_disg':
          break;

        case 'comb_fsec':
          break;

        case 'comb_reac':
          break;

        case 'disg':
          this.disg.chengeData(this.scene, index);
          break;

        case 'fsec':
          break;

        case 'pik_disg':
          break;

        case 'pik_fsec':
          break;

        case 'pik_reac':
          break;

        case 'reac':
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
    this.node.ClearData(this.scene);
    this.member.ClearData(this.scene);
    this.pointLoad.ClearData(this.scene);
    // this.memberLoad.ClearData(this.scene);
    this.disg.ClearData(this.scene);

    // 再描画
    this.scene.render();
  }


  //////////////////////////////////////////////////////
  // 編集モードの変更通知を処理する
  //////////////////////////////////////////////////////
  public ChengeMode(ModeName: string, currentPage: number = null): void {

    if (this.mode === ModeName) {
      return;
    }

    this.mode = ModeName;

    if ( this.mode === 'nodes'
    || this.mode === 'fix_nodes'
    || this.mode === 'disg'
    || this.mode === 'comb_disg'
    || this.mode === 'pik_disg'
    || this.mode === 'reac'
    || this.mode === 'comb_reac'
    || this.mode === 'pik_reac'
    ) {
      this.node.Enable();
    } else {
      this.node.Disable();
    }

    if ( this.mode === 'members'
      || this.mode === 'joints'
      || this.mode === 'notice_points'
      || this.mode === 'fsec'
      || this.mode === 'comb_fsec'
      || this.mode === 'pik_fsec'
    ) {
      this.member.Enable();
    } else {
      this.member.Disable();
    }

    if ( this.mode === 'loads') {

    } else {

    }

    if ( this.mode === 'disg'
    || this.mode === 'comb_disg'
    || this.mode === 'pik_disg'
    ) {
      this.disg.chengeData(this.scene, 1);
    } else {
      this.disg.ClearData(this.scene);
    }

    // 再描画
    this.scene.render();

  }

  //////////////////////////////////////////////////////
  // マウス位置とぶつかったオブジェクトを検出する
  //////////////////////////////////////////////////////
  public detectObject(mouse: THREE.Vector2 , action: string): void {

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

      case 'comb_disg':
        break;

      case 'comb_fsec':
        break;

      case 'comb_reac':
        break;

      case 'disg':
        break;

      case 'fsec':
        break;

      case 'pik_disg':
        break;

      case 'pik_fsec':
        break;

      case 'pik_reac':
        break;

      case 'reac':
        break;
    }
    // 再描画
    this.scene.render();
  }
}
