import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputNodesService } from '../../input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../input/input-members/input-members.service';
import { InputFixMemberService } from '../../input/input-fix-member/input-fix-member.service';
import { ThreeNodesService } from './three-nodes.service';

import * as THREE from 'three';
import { ThreeMembersService } from './three-members.service';
import { CubeCamera } from 'three';
//import { ConsoleReporter } from 'jasmine';

@Injectable({
  providedIn: 'root'
})
export class ThreeFixMemberService {

  private BufferGeometry: THREE.SphereBufferGeometry; //  分布バネ
  private fixmemberList: any[];
  private isVisible: boolean;

  constructor(private scene: SceneService,
              private nodeThree: ThreeNodesService,
              private node: InputNodesService,
              private member: InputMembersService,
              private fixmember: InputFixMemberService,
              private three_member: ThreeMembersService) { 
      this.fixmemberList = new Array();
      this.isVisible = null;
    }
  
  public maxLength(): number {
    // 最も距離の近い2つの節点距離
    return this.nodeThree.baseScale() * 60;
  }
  public center(): any {
    // すべての節点の中心
    return this.nodeThree.center; 
  }

  public visible(flag: boolean): void {
    if( this.isVisible === flag){
      return;
    }
    for (const mesh of this.fixmemberList) {
      mesh.visible = flag;
    }
    this.isVisible = flag
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

    // バネデータを入手
    const fixmemberData = this.fixmember.getFixMemberJson(0, key);
    if (Object.keys(fixmemberData).length <= 0) {
      return;
    }

    // 新しい入力を適用する
    const targetFixMember = fixmemberData[key];

    for(const target of targetFixMember){

      // 節点データを集計する
      const m = memberData[target.m];
      if (m === undefined) {
        continue;
      }
      const i = nodeData[m.ni];
      const j = nodeData[m.nj];
      if (i === undefined || j === undefined) {
        continue;
      }
      // 部材の座標軸を取得
      const localAxis = this.three_member.localAxis(i.x, i.y, i.z, j.x, j.y, j.z, m.cg);
      const len: number = new THREE.Vector3(j.x - i.x, j.y - i.y, j.z - i.z).length();

      let spring = {direction: "z", relationship: "large", color: 0xff0000};
      const position = {x: (i.x + j.x) / 2, y: (i.y + j.y) / 2, z: (i.z + j.z) / 2};

      if (target.tx === 1){
        spring.direction = "x";
        spring.color = 0xff8888;
        this.MultipleDrawing(spring, position, localAxis, len, this.maxLength());
      }
      if (target.ty === 1){
        spring.direction = "y";
        spring.color = 0x88ff88;
        if (position.y <= this.center().y){
          spring.relationship = "small";
        }else{
          spring.relationship = "large";
        }
        this.MultipleDrawing(spring, position, localAxis, len, this.maxLength());
      }
      if (target.tz === 1){
        spring.direction = "z";
        spring.color = 0x8888ff;
        if (position.z <= this.center().z){
          spring.relationship = "small";
        }else{
          spring.relationship = "large";
        }
        this.MultipleDrawing(spring, position, localAxis, len, this.maxLength());
      }
      if (target.tr === 1){
        spring.direction = "r";
        spring.color = 0x808080;
        this.MultipleDrawing(spring, position, localAxis, len, this.maxLength());
      }

    }

  }

  //複数回 描くために
  public MultipleDrawing(spring, position, localAxis, len, maxLength){
    let interval = 0.3;
    let count = 0;
    let local_position = {x: position.x, y: position.x, z: position.x};
    //バネ用の分岐
    if (spring.direction === "x" || spring.direction === "y" || spring.direction === "z"){
      count = Math.floor(len / 2 / interval - 0.5);
      for (let k = - count; k <= count ; k += 1 ){
        local_position.x = position.x + localAxis.x.x * k * interval;
        local_position.y = position.y + localAxis.x.y * k * interval;
        local_position.z = position.z + localAxis.x.z * k * interval;
        this.CreateSpring(spring, local_position, localAxis, maxLength);
      }
    }
    //回転バネ用の分岐
    if (spring.direction === "r" ) {
      count = Math.floor(len / 2 / interval - 0.5);
      for (let k = - count; k <= count ; k += 1 ){
        local_position.x = position.x + localAxis.x.x * k * interval;
        local_position.y = position.y + localAxis.x.y * k * interval;
        local_position.z = position.z + localAxis.x.z * k * interval;
        this.CreateRotatingSpring(spring, local_position, localAxis, maxLength);
      }
    }
  }

  //バネを描く
  public CreateSpring(spring, position, localAxis, maxLength){
    let GeometrySpring = new THREE.Geometry();
    let increase = 0.0001;
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
    const radius = 0.03;
    let x = position.x;
    let y = position.y;
    let z = position.z;
    for(let i = 0; i <= laps * 360; i += split){
      x = radius * Math.cos(Math.PI / 180 * i) * maxLength;
      y = radius * Math.sin(Math.PI / 180 * i) * maxLength;
      z = - i * increase * maxLength;
     GeometrySpring.vertices.push(new THREE.Vector3(x, y, z));
    }
    const LineSpring = new THREE.LineBasicMaterial({color: spring.color});
    const MeshSpring = new THREE.Line(GeometrySpring, LineSpring);
    //lookAt用
    const angle = Math.PI / 6;
    switch (spring.direction){
      case ("x"):
      MeshSpring.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z); 
      break;
      case ("y"):
      MeshSpring.lookAt(localAxis.y.x, localAxis.y.y, localAxis.y.z); 
      break;
      case ("z"):
      MeshSpring.lookAt(localAxis.z.x, localAxis.z.y, localAxis.z.z); 
      break;
    }
    MeshSpring.position.set(position.x, position.y, position.z); 
    this.fixmemberList.push(MeshSpring);
    this.scene.add(MeshSpring);  
    GeometrySpring = new THREE.Geometry();
  }

  //回転バネ支点を描く
  public CreateRotatingSpring(rotatingspring, position, localAxis, maxLength){
    let geometry = new THREE.Geometry();
    const laps = 3 + 0.25;
    const split = 10;
    const radius = 0.1 * 0.0005;
    let x = position.x;
    let y = position.y;
    let z = position.z;
    for(let j = 0; j <= laps * 360; j += split){
      x = radius * Math.cos(Math.PI / 180 * j) * maxLength * j;
      y = radius * Math.sin(Math.PI / 180 * j) * maxLength * j;
      z = 0;
      geometry.vertices.push(new THREE.Vector3(x, y, z));
    }
    const line = new THREE.LineBasicMaterial({color: rotatingspring.color});
    const mesh = new THREE.Line(geometry, line);
    mesh.lookAt(position.x + localAxis.x.x, position.y + localAxis.x.y, position.z + localAxis.x.z); //作図上y方向を見る
    mesh.position.set(position.x, position.y, position.z);
    this.fixmemberList.push(mesh);
    this.scene.add(mesh);
    geometry = new THREE.Geometry();
  }

  public ClearData(): void {
    for (const mesh of this.fixmemberList) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
      // オブジェクトを削除する
      this.scene.remove(mesh);
    }
    this.fixmemberList = new Array();
  }


}
