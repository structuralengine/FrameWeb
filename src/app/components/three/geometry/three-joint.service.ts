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
  private isVisible: boolean;

  private selectionItem: THREE.Mesh;     // 選択中のアイテム

  constructor(private scene: SceneService,
              private nodeThree: ThreeNodesService,
              private node: InputNodesService,
              private member: InputMembersService,
              private joint: InputJointService,
              private three_member: ThreeMembersService){
      this.jointList = new Array();
      this.isVisible = null;
    }

  public visible(flag: boolean): void {
    if( this.isVisible === flag){
      return;
    }
    for (const mesh of this.jointList) {
      mesh.visible = flag;
    }
    this.isVisible = flag;
  }

  public chengeData(index: number): void {

    this.ClearData();

    // 格点データを入手
    const nodeData = this.node.getNodeJson(0);
    if (Object.keys(nodeData).length <= 0) {
      return;
    }
    // 要素データを入手
    const memberData = this.member.getMemberJson(0);
    if (Object.keys(memberData).length <= 0) {
      return;
    }
    
    const key: string = index.toString();
    
    // 結合データを入手
    const jointData = this.joint.getJointJson(1, key);
    if (Object.keys(jointData).length <= 0) {
      return;
    } 

    // createJointLoadを実行させる
    const targetJoint = jointData[key];

    for (const jo of targetJoint) {

      // jointDataデータのに 要素番号 m を探す
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

  // ピンを示すドーナッツを描く
  private createJoint(position: any, direction: any, localAxis): void {

      // x方向の結合

      if(direction.x === 0 ){
        const pin_x = this.createJoint_base(position, 0xFF0000);
        const FocalSpot_X = position.x + localAxis.x.x;
        const FocalSpot_Y = position.y + localAxis.x.y;
        const FocalSpot_Z = position.z + localAxis.x.z;
        pin_x.lookAt(FocalSpot_X, FocalSpot_Y, FocalSpot_Z);
        pin_x.name = "0xFF0000";
        this.jointList.push(pin_x);
        this.scene.add(pin_x);
      }

      // y方向の結合

      if(direction.y === 0 ){
        const pin_y = this.createJoint_base(position, 0x00FF00);
        const FocalSpot_X = position.x + localAxis.y.x;
        const FocalSpot_Y = position.y + localAxis.y.y;
        const FocalSpot_Z = position.z + localAxis.y.z;
        pin_y.lookAt(FocalSpot_X, FocalSpot_Y, FocalSpot_Z);
        pin_y.name = "0x00FF00";
        this.jointList.push(pin_y);
        this.scene.add(pin_y);

      }

      // z方向の結合

      if(direction.z === 0 ){
        const pin_z = this.createJoint_base(position, 0x0000FF);
        const FocalSpot_X = position.x + localAxis.z.x;
        const FocalSpot_Y = position.y + localAxis.z.y;
        const FocalSpot_Z = position.z + localAxis.z.z;
        pin_z.lookAt(FocalSpot_X, FocalSpot_Y, FocalSpot_Z);
        pin_z.name = "0x0000FF";
        this.jointList.push(pin_z);
        this.scene.add(pin_z);

      }

  }

  private createJoint_base(position, color){

    const pin_geometry = new THREE.TorusBufferGeometry(0.10, 0.01, 16, 64);
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

  // マウス位置とぶつかったオブジェクトを検出する
  public detectObject(raycaster: THREE.Raycaster , action: string): void {

    if (this.jointList.length === 0) {
      return; // 対象がなければ何もしない
    }

    // 交差しているオブジェクトを取得
    const intersects = raycaster.intersectObjects(this.jointList);
    if ( intersects.length <= 0 ){
      return;
    }

    switch (action) {
      case 'click':
        this.jointList.map(item => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を指定する
            if ( item.name === "0xFF0000" ){
              item.material['color'].setHex(0xff0000);
            }else if ( item.name === "0x00FF00" ){
              item.material['color'].setHex(0x00ff00);
            }else if ( item.name === "0x0000FF" ){
              item.material['color'].setHex(0x0000ff);
            }
            item.material['opacity'] = 1.00;  // 彩度 強
          }
        });
        break;

      case 'select':
          this.selectionItem = null;
          this.jointList.map(item => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を指定する
            if (item.name === "0xFF0000"){
              item.material['color'].setHex(0xff0000);
            }else if(item.name === "0x00FF00"){
              item.material['color'].setHex(0x00ff00);
            }else if(item.name === "0x0000FF"){
              item.material['color'].setHex(0x0000ff);
            }
            item.material['opacity'] = 1.00;  //彩度 強
            this.selectionItem = item;
          } else {
            // それ以外は彩度を下げる
            if (item.name === "0xFF0000"){
              item.material['color'].setHex(0xff0000);
            }else if(item.name === "0x00FF00"){
              item.material['color'].setHex(0x00ff00);
            }else if(item.name === "0x0000FF"){
              item.material['color'].setHex(0x0000ff);
            }
            item.material['opacity'] = 0.50;  //彩度 中
          }
        });
        break;

      case 'hover':
        this.jointList.map(item => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を指定する
            if (item.name === "0xFF0000"){
              item.material['color'].setHex(0xff0000);
            }else if(item.name === "0x00FF00"){
              item.material['color'].setHex(0x00ff00);
            }else if(item.name === "0x0000FF"){
              item.material['color'].setHex(0x0000ff);
            }
            item.material['opacity'] = 0.25;  //彩度 弱
          } else {
            if ( item === this.selectionItem ) {
              if (item.name === "0xFF0000"){
                item.material['color'].setHex(0xff0000);
              }else if(item.name === "0x00FF00"){
                item.material['color'].setHex(0x00ff00);
              }else if(item.name === "0x0000FF"){
                item.material['color'].setHex(0x0000ff);
              }
              item.material['opacity'] = 1.00;  //彩度 強
            } else {
              // それ以外は彩度を下げる
              if (item.name === "0xFF0000"){
                item.material['color'].setHex(0xff0000);
              }else if(item.name === "0x00FF00"){
                item.material['color'].setHex(0x00ff00);
              }else if(item.name === "0x0000FF"){
                item.material['color'].setHex(0x0000ff);
              }
              item.material['opacity'] = 0.50;  //彩度 中
            }
          }
        });
        break;

      default:
        return;
    }
    this.scene.render();
  }

}
