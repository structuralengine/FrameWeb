import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputNodesService } from '../../input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../input/input-members/input-members.service';
import { InputFixMemberService } from '../../input/input-fix-member/input-fix-member.service';
import { ThreeNodesService } from './three-nodes.service';

import * as THREE from 'three';
import { ThreeMembersService } from './three-members.service';
import { CubeCamera } from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThreeFixMemberService {

  private BufferGeometry: THREE.SphereBufferGeometry; //  分布バネ
  private pointLoadList: any[];
  private memberLoadList: any[];
  private fixmemberList: any[];

  constructor(
    private scene: SceneService,
    private nodeThree: ThreeNodesService,
    private node: InputNodesService,
    private member: InputMembersService,
    private fixmember: InputFixMemberService) { 
      this.pointLoadList = new Array();
      this.memberLoadList = new Array();
      this.fixmemberList = new Array();
    }
  
  public maxLength(): number {
    // 最も距離の近い2つの節点距離
    return this.nodeThree.baseScale() * 60;
  }
  public center(): any {
    // すべての節点の中心
    return this.nodeThree.center; 
  }

  public chengeData(index: number): void {

    this.ClearData();

    // 格点データを入手
    const nodeData = this.node.getNodeJson('calc');
    if (Object.keys(nodeData).length <= 0) {
      this.ClearNodeLoad();
      return;
    }
    // 要素データを入手
    const memberData = this.member.getMemberJson('calc');
    if (Object.keys(memberData).length <= 0) {
      this.ClearMemberLoad();
      return;
    }
    // バネデータを入手
    const fixmemberData = this.fixmember.getFixMemberJson('calc');
    if (Object.keys(fixmemberData).length <= 0) {
      return;
    }

    const key_fixmember: string = index.toString();
    if( !(key_fixmember in fixmemberData) ){
      return;
    }
    const targetFixMember = fixmemberData[key_fixmember];
    for (const target of targetFixMember) {
      let count = 1;
      console.log("////////////////////", count, "////////////////////");
      console.log(target);
      count += 1;

      const position = {x: nodeData[target.n].x, y: nodeData[target.n].y, z: nodeData[target.n].z};
      let spring = {direction: "x", relationship: "small", color: 0x000000};
      const maxLength = this.maxLength();


    }

  }

  //バネを描く
  public CreateSpring(spring, position, maxLength){
    let GeometrySpring = new THREE.Geometry();
    let increase = 0.00015;
    switch (spring.relationship){
      case("small"):
        increase = 0.0001;
        break;
      case("large"):
        increase = -0.0001;
        break;
    }
    const laps = 3;
    const split = 10;
    const radius = 0.02;
    let x = position.x;
    let y = position.y;
    let z = position.z;
    for(let i = 0; i <= laps * 360; i += split){
      switch (spring.direction){
        case ("x"):
        x = position.x - i * increase * maxLength;
        y = position.y + radius * Math.cos(Math.PI / 180 * i) * maxLength;
        z = position.z + radius * Math.sin(Math.PI / 180 * i) * maxLength;
        break;
        case ("y"):
        x = position.x + radius * Math.cos(Math.PI / 180 * i) * maxLength;
        y = position.y - i * increase * maxLength;
        z = position.z + radius * Math.sin(Math.PI / 180 * i) * maxLength;
        break;
        case ("z"):
        x = position.x + radius * Math.cos(Math.PI / 180 * i) * maxLength;
        y = position.y + radius * Math.sin(Math.PI / 180 * i) * maxLength;
        z = position.z - i * increase * maxLength;
        break;
      }
     GeometrySpring.vertices.push(new THREE.Vector3(x, y, z));
    }
    console.log(laps * 360 * increase * maxLength);
    const LineSpring = new THREE.LineBasicMaterial({color: spring.color});
    const MeshSpring = new THREE.Line(GeometrySpring, LineSpring);
    this.fixmemberList.push(MeshSpring);
    this.scene.add(MeshSpring);
    GeometrySpring = new THREE.Geometry();
  }

  // データをクリアする
  public ClearData(): void {
    this.ClearMemberLoad();
    this.ClearNodeLoad();
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

}
