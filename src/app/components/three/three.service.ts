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

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  // アイテム
  private scale: number; // オブジェクトの大きさ

  constructor(public scene: SceneService,
              private node: ThreeNodesService,
              private member: ThreeMembersService,
              private fixNode: ThreeFixNodeService,
              private fixMember: ThreeFixMemberService,
              private joint: ThreeJointService,
              private pointLoad: ThreePointLoadService,
              private memberLoad: ThreeMemberLoadService
              ) {
  }

  public chengeData(): void {
    // 節点データの更新
    this.node.chengeData(this.scene);
    // 再描画
    this.scene.render();
  }

  public ClearData(): void {
    // 節点データの削除
    this.node.ClearData(this.scene);
    // 再描画
    this.scene.render();

  }

  public ChengeMode(ModeName: string, currentPage: number = null): void {

    switch (ModeName) {
      case 'nodes':
        break;

      case 'fix_nodes':
        break;

      case 'members':
        break;

      case 'joints':
        break;

      case 'loads':
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
}
