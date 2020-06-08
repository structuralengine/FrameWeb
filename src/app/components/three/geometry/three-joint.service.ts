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

  //ピンを示すドーナッツを描く
  private createJoint(position: any, direction: any, localAxis): void {

      // x方向の結合

      if(direction.x === 0 ){
        const pin_x = this.createJoint_base(position, 0xFF0000);
        const FocalSpot_X = position.x + localAxis.x.x;
        const FocalSpot_Y = position.y + localAxis.x.y;
        const FocalSpot_Z = position.z + localAxis.x.z;
        pin_x.lookAt(FocalSpot_X, FocalSpot_Y, FocalSpot_Z);
        this.jointList.push(pin_x);
        this.scene.add(pin_x);
      }

      // y方向の結合

      if(direction.y === 0 ){
        const pin_y = this.createJoint_base(position, 0x00FF00);
        //const Angle_Rotation_A = Math.PI / 2;
        //const Angle_Rotation_B = Math.atan(localAxis.x.y / localAxis.x.x);
        const FocalSpot_X = position.x + localAxis.y.x;
        const FocalSpot_Y = position.y + localAxis.y.y;
        const FocalSpot_Z = position.z + localAxis.y.z;
        pin_y.lookAt(FocalSpot_X, FocalSpot_Y, FocalSpot_Z); 
        this.jointList.push(pin_y);
        this.scene.add(pin_y);

      }

      // z方向の結合
      
      if(direction.z === 0 ){
        const pin_z = this.createJoint_base(position, 0x0000FF);
        //このパターンもあり
          //const Angle_Rotation_A = Math.atan(localAxis.x.z / localAxis.x.y * localAxis.y.x ** 2);
          //const Angle_Rotation_B = Math.atan(localAxis.x.z / localAxis.x.x * localAxis.y.y ** 2 * (-1));
          //const Angle_Rotation_C = Math.atan(localAxis.z.y / localAxis.z.z * (-1));
          //const Angle_Rotation_D = Math.atan(localAxis.z.x / localAxis.z.z );
        const FocalSpot_X = position.x + localAxis.z.x;
        const FocalSpot_Y = position.y + localAxis.z.y;
        const FocalSpot_Z = position.z + localAxis.z.z;
        pin_z.lookAt(FocalSpot_X, FocalSpot_Y, FocalSpot_Z);      
        this.jointList.push(pin_z);
        this.scene.add(pin_z);

      }

  }

  private createJoint_base(position, color){

    const pin_geometry = new THREE.TorusGeometry(0.10, 0.01, 16, 64);
    const pin_material = new THREE.MeshBasicMaterial({color: color , side: THREE.DoubleSide});
    const pin = new THREE.Mesh(pin_geometry, pin_material);
    pin.position.set(position.x, position.y, position.z);
    
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
