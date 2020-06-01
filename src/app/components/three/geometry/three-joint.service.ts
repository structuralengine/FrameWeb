import { SceneService } from '../scene.service';
import { InputNodesService } from '../../input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../input/input-members/input-members.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { InputJointService } from '../../input/input-joint/input-joint.service';
import { ThreeNodesService } from './three-nodes.service';
import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { ThreeMembersService } from './three-members.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeJointService {

  private jointList: any[];

  constructor(private scene: SceneService,
    private nodeThree: ThreeNodesService,
    private node: InputNodesService,
    private member: InputMembersService,
    private joint: InputJointService,
    private three_member: ThreeMembersService){
      this.jointList = new Array();
    }


  public chengeData(index: number): void {

    // ここに座標 0,0,0 にドーナッツを描いていてください
    
    // 参考にするのは、\src\app\components\three\geometry\three-load.service.ts
    console.log('ドーナッツ形のジオメトリを描いてください');

    this.ClearData();

    // 格点データを入手
    const nodeData = this.node.getNodeJson('calc');
    if (Object.keys(nodeData).length <= 0) {
      return;
    }

    // 要素データを入手
    const memberData = this.member.getMemberJson('calc');
    if (Object.keys(memberData).length <= 0) {
      return;
    }
    // 結合データを入手
    const jointData = this.joint.getJointJson('calc');
    if (Object.keys(jointData).length <= 0) {
      return;
    } 
    
    const key: string = index.toString();
    if( !(key in jointData) ){
      return;
    }

    //createJointLoadを実行させる
    const targetJoint = jointData[key];

    for (const jo of targetJoint) {

      //jointDataデータのに 要素番号 m を探す
      if(!(jo.m in memberData)){
        continue;
      }
      const m =  memberData[jo.m];
      if (m === undefined) {
        continue;
      }

      // memberDataデータに i端の格点番号
      const i = nodeData[m.ni];
      const j = nodeData[m.nj];
      if (i === undefined || j === undefined) {
        continue;
      }

      const localAxis = this.three_member.localAxis(i.x, i.y, i.z, j.x, j.y, j.z, m.cg);

      let position = {x:i.x, y:i.y, z:i.z};
      let direction = {x:jo.xi, y:jo.yi, z:jo.zi};
      this.createJoint(position, direction, localAxis);

      // memberDataデータに j端の格点番号
      position = {x:j.x, y:j.y, z:j.z};
      direction = {x:jo.xj, y:jo.yj, z:jo.zj};
      this.createJoint(position, direction, localAxis);

    }
  }

  //ピンのドーナッツを描きたい
  private createJoint(position: any, direction: any, localAxis): void {

      // x方向の結合
      if(direction.x === 0 ){
        // x軸方向のドーナッツを描く
        // 位置は、 position.x, position.y, position.z

      }

  }

  private setJointLoad(value: number){

    if (value === 0) {
      return null;
    }
    const pin_geometry = new THREE.TorusGeometry(30, 10, 64, 100);
    const pin_material = new THREE.MeshBasicMaterial({color: 0x6699FF});
    const pin = new THREE.Mesh(pin_geometry, pin_material);

    return pin;

  }

  // データをクリアする
  public ClearData(): void {

    for (const mesh of this.jointList) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
      // オブジェクトを削除する
      this.scene.remove(mesh);
    }
    this.jointList = new Array();
  }

}
