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

  private mode: string;
  private scale: number; // オブジェクトの大きさ

  public selectiveObjects: THREE.Mesh[]; // 選択可能なアイテム

  constructor(public scene: SceneService,
              private node: ThreeNodesService,
              private member: ThreeMembersService,
              private fixNode: ThreeFixNodeService,
              private fixMember: ThreeFixMemberService,
              private joint: ThreeJointService,
              private pointLoad: ThreePointLoadService,
              private memberLoad: ThreeMemberLoadService
              ) {
      this.selectiveObjects = []; // 選択可能なアイテムを初期化
    }


  // マウス位置とぶつかったオブジェクトを検出する
  public detectObject(mouse: THREE.Vector2 , action: string): void {

    // 物体とマウスの交差判定に用いるレイキャスト
    const raycaster = this.scene.getRaycaster(mouse);

    // 交差しているオブジェクトを取得
    const intersects = raycaster.intersectObjects(this.selectiveObjects);

    switch (action) {
      case 'click':
        this.selectiveObjects.map(item => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            item.material['color'].setHex(0xff0000);
            item.material['opacity'] = 1.00;
          }
        });
        break;

      case 'select':
          this.selectionItem = null;
          this.selectiveObjects.map(item => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            item.material['color'].setHex(0xff0000);
            item.material['opacity'] = 1.00;
            this.selectionItem = item;
          } else {
            // それ以外は元の色にする
            item.material['color'].setHex(0x000000);
            item.material['opacity'] = 1.00;
          }
        });
        break;

      case 'hover':
        this.selectiveObjects.map(item => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            item.material['color'].setHex(0xff0000);
            item.material['opacity'] = 0.25;
          } else {
            if ( item === this.selectionItem ) {
              item.material['color'].setHex(0xff0000);
              item.material['opacity'] = 1.00;
            } else {
              // それ以外は元の色にする
              item.material['color'].setHex(0x000000);
              item.material['opacity'] = 1.00;
            }
          }
        });
        break;

      default:
        return;
    }
    this.scene.render();
  }


  public chengeData(): void {
    switch (this.mode) {
      case 'nodes': // 節点データの更新
        this.node.chengeData(this.scene);
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
    this.mode = ModeName;

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
