import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../../components/input/input-members/input-members.service';
import { InputLoadService } from '../../../components/input/input-load/input-load.service';
import { ThreeNodesService } from './three-nodes.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThreePointLoadService {

  private pointLoadList: THREE.Mesh[];
  private selectionItem: THREE.Mesh;     // 選択中のアイテム

  constructor(private nodeThree: ThreeNodesService,
              private node: InputNodesService,
              private member: InputMembersService,
              private load: InputLoadService) {
    this.pointLoadList = new Array();
    this.selectionItem = null;
   }

  public chengeData(scene: SceneService, index: number): void {

    // 格点データを入手
    const nodeData = this.node.getNodeJson('calc');
    const nodeKeys = Object.keys(nodeData);
    if (nodeKeys.length <= 0) {
      this.ClearData(scene);
      return;
    }

    // メンバーデータを入手
    const memberData = this.member.getMemberJson('calc');
    const memberKeys = Object.keys(memberData);
    if (memberKeys.length <= 0) {
      this.ClearMemberLoad(scene);
      return;
    }

    // 節点荷重データを入手
    const targetCase: string = index.toString();
    const nodeLoadData = this.load.getNodeLoadJson('unity-loads:' + targetCase);
    if (Object.keys(nodeLoadData).length <= 0) {
      this.ClearNodeLoad(scene);
      return;
    }

    // 一旦全排除
    this.ClearData(scene);

    // 新しい入力を適用する
    const targetNodeLoad = nodeLoadData[targetCase];

    // サイズを調整する
    // this.onResize();
  }

    // データをクリアする
    public ClearData(scene: SceneService): void {
      this.ClearMemberLoad(scene);
      this.ClearNodeLoad(scene);
    }

    // データをクリアする
    private ClearMemberLoad(scene: SceneService): void {
    }

    // データをクリアする
    private ClearNodeLoad(scene: SceneService): void {
      for (const mesh of this.pointLoadList) {
        // 文字を削除する
        while ( mesh.children.length > 0 ) {
          const object = mesh.children[ 0 ];
          object.parent.remove( object );
        }
        // オブジェクトを削除する
        scene.remove(mesh);
      }
      this.pointLoadList = new Array();
    }
}

