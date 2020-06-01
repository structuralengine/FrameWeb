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

  private pointLoadList: any[];
  private memberLoadList: any[];
  private jointLoadList: any[];
  private BufferGeometry: THREE.Line; // 結合

  constructor(private scene: SceneService,
    private nodeThree: ThreeNodesService,
    private node: InputNodesService,
    private member: InputMembersService,
    private joint: InputJointService,
    private load: InputLoadService,
    private three_member: ThreeMembersService){
      this.pointLoadList = new Array();
      this.memberLoadList = new Array();
      this.jointLoadList = new Array();
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
    //console.log('memberData' + memberData);
    if (Object.keys(memberData).length <= 0) {
      //this.ClearMemberLoad();
      return;
    }
    // 結合データを入手
    const jointData = this.joint.getJointJson('calc');
    console.log('jointData59' + jointData);
      //console.log("targetCase" + targetCase);
    if (Object.keys(jointData).length <= 0) {
      //this.ClearJointLoad();
      return;
    } /*else {
      //サイズを調整しオブジェクトを登録する
      this.createJointLoad(jointData[targetCase], nodeData);
    }  */
    //createJointLoadを実行させる
    for (const key of Object.keys(jointData[index.toString()])) {

      const j = jointData[index][key];
      const m = j.m;
      /*
      jointDataデータに 要素番号 m
      ↓
      mを頼りに→memberDataデータに i端, j端の格点番号
      ↓
      nodeDataデータに、格点の座標情報
      */
      this.createJointLoad(undefined, j);
    }
  }

  //ピンのドーナッツを描きたい
  private createJointLoad(jointLoadData: any, jointData: object): void {
    if (jointLoadData === undefined) {
      return;
    }

    // 新しい入力を適用する
    const targetJointLoad = jointLoadData;
    // 結合の印をシーンに追加する
    for (const load of targetJointLoad) {
      console.log("joint" + load);
      // 節点座標 を 取得する
      const node = jointData[load.n];
      if (node === undefined) {
        continue;  
      }

      // x方向の結合
      
      const pin = this.setJointLoad(10);
      console.log("path check !");
      if (pin !== null) {
        this.pointLoadList.push(pin);
        this.scene.add(pin);
      }

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
    this.ClearMemberLoad();
    this.ClearNodeLoad();
    this.ClearJointLoad();
  }

  // データをクリアする
  private ClearNodeLoad(): void {
    for (const mesh of this.pointLoadList) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
      // オブジェクトを削除する
      this.scene.remove(mesh);
    }
    this.pointLoadList = new Array();
  }

  // データをクリアする
  private ClearMemberLoad(): void {
    for (const mesh of this.memberLoadList) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
      // オブジェクトを削除する
      this.scene.remove(mesh);
    }
    this.memberLoadList = new Array();
  }

  // データをクリアする
  private ClearJointLoad(): void {
    for (const mesh of this.jointLoadList) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
      // オブジェクトを削除する
      this.scene.remove(mesh);
    }
    this.jointLoadList = new Array();
  }

}
