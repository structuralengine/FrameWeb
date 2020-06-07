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
    //console.log('ドーナッツ形のジオメトリを描いてください');

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
      if(direction.x === 0 ){;
        // x軸方向のドーナッツを描く
        const pin_x = this.createJoint_base(position, localAxis);
        //pin_x.rotation.y = Math.PI / 2;
    //基本形
        //const HitachiX = localAxis.y.x**2;
        //pin_x.rotation.x = Math.atan(localAxis.x.z / localAxis.x.y ) *  HitachiX;
        //pin_x.rotation.y = Math.atan(localAxis.x.z / localAxis.x.x ) * (HitachiX - 1);
        /*
        pin_x.rotation.x = Math.atan(localAxis.x.y / localAxis.x.z);
        pin_x.rotation.y = Math.atan(localAxis.x.x / localAxis.x.z);// + Math.PI / 2;
        console.log(localAxis);
        console.log("Math.atan(localAxis.x.x / localAxis.x.z) =" + Math.atan(localAxis.x.x / localAxis.x.z));
        pin_x.rotation.x = (-1) * Math.PI / 2.8;
        pin_x.rotation.x = Math.atan(position.z.y / position.z.z);    */
        //const try_x = Math.acos(localAxis.x.x / Math.sqrt(localAxis.x.x**2 + localAxis.x.z**2));
        //pin_x.rotation.y = (try_x + Math.PI / 2)* (-1);
    //めちゃめちゃ近い...
        //pin_x.rotation.y = Math.PI / 2;
        //const a = Math.atan(localAxis.z.z / localAxis.z.x * localAxis.y.y**2 * (-1));
        //const b = Math.atan(localAxis.z.z / localAxis.z.y * localAxis.y.x**2);
        //const c = Math.atan(Math.PI * localAxis.y.y**2 * (-1));
        //const d = Math.atan(Math.PI * localAxis.y.x**2);
        //pin_x.rotation.y = a;
        //pin_x.rotation.x = b;
        //pin_x.rotation.y = c;
        //pin_x.rotation.x = d;

        //if(localAxis.x.z / localAxis.x.x !== 0){
          //console.log("///////////////pin_x///////////////");
          //console.log("localAxis.x =", localAxis.x);
          //console.log("localAxis.y =", localAxis.y);
          //console.log("localAxis.z =", localAxis.z);
          //console.log("XY =", xy);
          //console.log("Lotate___X =", LotateX ,"  , Lotate___Y =", LotateY );
          //console.log("x_rate =", x_rate, ", y_rate =", y_rate);
          //console.log("angleX =", angleX, ", angleY =", angleY);
          //console.log("Hitachi_XZ =", HitachiXZ, ", Hitachi_YZ =", HitachiYZ);
          //console.log("pin_z rotation.x =", a, ", rotation.y =", b);
          //console.log("pin_x rotation.x =", a, ", rotation.y =", b);
          //console.log("legacy.x =", Math.atan(localAxis.x.z / localAxis.x.y ) * localAxis.x.z / Math.sqrt(localAxis.x.x**2 + localAxis.x.y**2)
                  //, ", legacy.y =", Math.atan(localAxis.x.z / localAxis.x.x ) * (localAxis.x.z / Math.sqrt(localAxis.x.x**2 + localAxis.x.y**2) - 1));    
          //console.log("x_rate =", localAxis.x.z / localAxis.x.y ,", y_rate =", localAxis.x.z / localAxis.x.x);
          //console.log("SUM =", Math.atan(localAxis.x.z / localAxis.x.y ) *  HitachiZ + Math.atan(localAxis.x.z / localAxis.x.x ) * (1 - HitachiZ))
          //console.log("y.x**2 =", localAxis.y.x**2 ,", y.y**2 =", localAxis.y.y**2);
        //}

        this.jointList.push(pin_x);
        this.scene.add(pin_x);
      }

      // y方向の結合

      if(direction.y === 0 ){
        const pin_y = this.createJoint_base(position, localAxis);
        //めちゃめちゃ近い...
        pin_y.rotation.x = Math.PI / 2;
        pin_y.rotation.y = Math.atan(localAxis.x.y / localAxis.x.x);//なぜかy回転している．z回転じゃない
        //const a = Math.atan(localAxis.x.z / localAxis.x.x * localAxis.y.y**2 * (-1));
        //const b = Math.atan(localAxis.x.z / localAxis.x.y * localAxis.y.x**2);
        //pin_y.rotation.y = a;
        //pin_y.rotation.x = b;
        //if(localAxis.x.z / localAxis.x.x !== 0){
          //console.log("///////////////pin_y///////////////");
          //console.log("localAxis.x =", localAxis.x);
          //console.log("localAxis.y =", localAxis.y);
          //console.log("localAxis.z =", localAxis.z);
          //console.log("pin_y : rotation.x =", a, ", rotation.y =", b);
        //}
    //基本形
        //const HitachiY = localAxis.y.x**2;
        //pin_y.rotation.y = Math.atan(localAxis.x.z / localAxis.x.x ) * (HitachiY - 1);
        //pin_y.rotation.x = Math.atan(localAxis.x.z / localAxis.x.y ) *  HitachiY;
        //pin_y.rotation.y = Math.atan(localAxis.x.z / localAxis.x.x ) * (HitachiY - 1);
        /*
        pin_y.rotation.x = Math.atan(localAxis.x.y / localAxis.x.z);
        pin_y.rotation.y = Math.PI / 2;
        pin_y.rotation.y = (-1) * Math.PI / 6 ; //* Math.atan2(localAxis.y.z, localAxis.y.x) / 180;*/
        this.jointList.push(pin_y);
        this.scene.add(pin_y);

      }

      // z方向の結合
      
      if(direction.z === 0 ){
        const pin_z = this.createJoint_base(position, localAxis);
        //const pin_w = this.createJoint_base(position, localAxis);
        //console.log("localAxis.x.z / localAxis.x.x =", localAxis.x.z / localAxis.x.x);
        //pin_z.rotation.y = Math.atan(localAxis.x.z / localAxis.x.x) * localAxis.y.y**2 * (-1);
        //pin_z.rotation.x = Math.atan(localAxis.x.z / localAxis.x.y) * localAxis.y.x**2;
    //基本形
        //const xy = 1 / Math.sqrt(localAxis.x.x**2 + localAxis.x.y**2);
        //const x_rate = localAxis.x.z / localAxis.x.y; 
        //const y_rate = localAxis.x.z / localAxis.x.x;
        //const angleX = x_rate / (x_rate + y_rate);
        //const angleY = y_rate / (x_rate + y_rate);
        //const LotateX = Math.atan(localAxis.x.z / localAxis.x.y);
        //const LotateY = Math.atan(localAxis.x.z / localAxis.x.x);
        //const HitachiXZ = xy * (LotateX / (LotateX + LotateY));
        //const HitachiYZ = xy * (LotateY / (LotateX + LotateY));
        //pin_z.rotation.x = LotateX;
        //pin_z.rotation.y = LotateY;
        //pin_z.rotation.x = 0.37;
        //pin_z.rotation.y = -0.24;
        //const legacy = localAxis.x.z / Math.sqrt(localAxis.x.x**2 + localAxis.x.y**2);
        //const x_atan = Math.atan(localAxis.x.z / localAxis.x.y );
        //const y_atan = Math.atan(localAxis.x.z / localAxis.x.x );
        //pin_z.rotation.x = x_atan * legacy;
        //pin_z.rotation.y = y_atan * (legacy - 1);
    //type legacy
        //const legacy = localAxis.x.z / Math.sqrt(localAxis.x.x**2 + localAxis.x.y**2);
        //pin_z.rotation.x = Math.atan(localAxis.x.z / localAxis.x.y ) * legacy;
        //pin_z.rotation.y = Math.atan(localAxis.x.z / localAxis.x.x ) * (legacy - 1);
    //めちゃめちゃ近い...一致？ Why?
        const a = Math.atan(localAxis.x.z / localAxis.x.x * localAxis.y.y**2 * (-1));
        const b = Math.atan(localAxis.x.z / localAxis.x.y * localAxis.y.x**2);
        //const c = Math.atan(localAxis.x.z / localAxis.x.x) * localAxis.y.y**2 * (-1);
        //const d = Math.atan(localAxis.x.z / localAxis.x.y) * localAxis.y.x**2;
        pin_z.rotation.y = a;
        pin_z.rotation.x = b;
        //pin_w.rotation.y = c;
        //pin_w.rotation.x = d;   
        //if(localAxis.x.z / localAxis.x.x !== 0){
          //console.log("///////////////pin_z///////////////");
          //console.log("localAxis.x =", localAxis.x);
          //console.log("localAxis.y =", localAxis.y);
          //console.log("localAxis.z =", localAxis.z);
          //console.log("XY =", xy);
          //console.log("Lotate___X =", LotateX ,"  , Lotate___Y =", LotateY );
          //console.log("x_rate =", x_rate, ", y_rate =", y_rate);
          //console.log("angleX =", angleX, ", angleY =", angleY);
          //console.log("Hitachi_XZ =", HitachiXZ, ", Hitachi_YZ =", HitachiYZ);
          //console.log("pin_z rotation.x =", a, ", rotation.y =", b);
          //console.log("pin_w rotation.x =", c, ", rotation.y =", d);
          //console.log("legacy.x =", Math.atan(localAxis.x.z / localAxis.x.y ) * localAxis.x.z / Math.sqrt(localAxis.x.x**2 + localAxis.x.y**2)
                  //, ", legacy.y =", Math.atan(localAxis.x.z / localAxis.x.x ) * (localAxis.x.z / Math.sqrt(localAxis.x.x**2 + localAxis.x.y**2) - 1));    
          //console.log("x_rate =", localAxis.x.z / localAxis.x.y ,", y_rate =", localAxis.x.z / localAxis.x.x);
          //console.log("SUM =", Math.atan(localAxis.x.z / localAxis.x.y ) *  HitachiZ + Math.atan(localAxis.x.z / localAxis.x.x ) * (1 - HitachiZ))
          //console.log("y.x**2 =", localAxis.y.x**2 ,", y.y**2 =", localAxis.y.y**2);
        //}
        
        this.jointList.push(pin_z);
        this.scene.add(pin_z);
        // 位置は、 position.x, position.y, position.z

      }

  }

  private createJoint_base(position, localAxis){

    const pin_geometry = new THREE.TorusGeometry(0.30, 0.01, 16, 64);
    //const pin_geometry = new THREE.CircleGeometry( 0.30, 5 );
    const pin_material = new THREE.MeshBasicMaterial({color: 0x6699FF , side: THREE.DoubleSide});
    const pin = new THREE.Mesh(pin_geometry, pin_material);
    //pin.rotation.x = Math.PI * Math.atan2(localAxis.x, localAxis.x) / 180;
    //要修正_長さの調整
    pin.position.set(position.x / 2, position.y / 2, position.z / 2);
    
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
