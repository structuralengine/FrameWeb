import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputNodesService } from '../../input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../input/input-members/input-members.service';
import { InputFixMemberService } from '../../input/input-fix-member/input-fix-member.service';
import { ThreeNodesService } from './three-nodes.service';

import * as THREE from 'three';
import { ThreeMembersService } from './three-members.service';
import { Material, Object3D } from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThreeFixMemberService {

  private fixmemberList: any[];
  private isVisible: boolean;
  private currentIndex: string;
  private currentIndex_sub: string;

  // 大きさを調整するためのスケール
  private scale: number;
  private params: any;          // GUIの表示制御
  private gui: any;

  constructor(private scene: SceneService,
              private nodeThree: ThreeNodesService,
              private node: InputNodesService,
              private member: InputMembersService,
              private fixmember: InputFixMemberService,
              private three_member: ThreeMembersService) {

    this.fixmemberList = new Array();
    this.isVisible = null;
    this.currentIndex = null;
    this.currentIndex_sub = null;

    // gui
    this.scale = 1.0;
    this.params = {
      fixmenberScale: this.scale
    };
    this.gui = null;

  }

  public baseScale(): number {
    // 最も距離の近い2つの節点距離
    return this.nodeThree.minDistance;
  }
  public center(): any {
    // すべての節点の中心
    return this.nodeThree.center;
  }

  public visibleChange(flag: boolean): void {
    if (this.isVisible === flag) {
      return;
    }
    for (const mesh of this.fixmemberList) {
      mesh.visible = flag;
    }
    this.isVisible = flag;

    // guiの表示設定
    if (flag === true) {
      if(this.fixmemberList.length > 0){
        this.guiEnable();
      }
    } else {
      this.guiDisable();
    }

  }

  // guiを表示する
  private guiEnable(): void {
    if (this.gui !== null) {
      return;
    }

    const gui_step: number = 80 * 0.001;
    this.gui = this.scene.gui.add(this.params, 'fixmenberScale', 0, 80).step(gui_step).onChange((value) => {
      this.scale = value;
      this.onResize();
      this.scene.render();
    });
  }

  // guiを非表示にする
  private guiDisable(): void {
    if (this.gui === null) {
      return;
    }
    this.scene.gui.remove(this.gui);
    this.gui = null;
  }

  public changeData(index: number): void {

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

    for (const target of targetFixMember) {

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

      //const spring = { direction: 'z', relationship: 'large', color: 0xff0000, m: target.m, row: target.row};
      const spring = { direction: 'z', relationship: 'large', color: 0xff0000, row: target.row};
      const position = { x: (i.x + j.x) / 2, y: (i.y + j.y) / 2, z: (i.z + j.z) / 2 };

      if (target.tx !== 0) {
        spring.direction = 'x';
        spring.color = 0xff8888;
        this.MultipleDrawing(spring, position, localAxis, len, this.baseScale());
      }
      if (target.ty !== 0) {
        spring.direction = 'y';
        spring.color = 0x88ff88;
        if (position.y <= this.center().y) {
          spring.relationship = 'small';
        } else {
          spring.relationship = 'large';
        }
        this.MultipleDrawing(spring, position, localAxis, len, this.baseScale());
      }
      if (target.tz !== 0) {
        spring.direction = 'z';
        spring.color = 0x8888ff;
        if (position.z <= this.center().z) {
          spring.relationship = 'small';
        } else {
          spring.relationship = 'large';
        }
        this.MultipleDrawing(spring, position, localAxis, len, this.baseScale());
      }
      if (target.tr !== 0) {
        spring.direction = 'r';
        spring.color = 0x808080;
        this.MultipleDrawing(spring, position, localAxis, len, this.baseScale());
      }

    }
    this.onResize();
    this.guiEnable();
  }

  // 複数回 描くために
  public MultipleDrawing(spring, position, localAxis, len, maxLength) {
    let multipleList = new Object3D();
    let interval = 0.3;
    let info = {count: 0, len: len};
    let local_position = { x: position.x, y: position.x, z: position.x };

    // バネ用の分岐
    if (spring.direction === 'x' || spring.direction === 'y' || spring.direction === 'z') {
      multipleList.name = 'fixmember' + spring.row.toString() + spring.direction.toString();
      
      info.count = (Math.floor(len / 2 / interval - interval) === -1) ? 0 : Math.floor(len / 2 / interval - interval);
      if (info.count === 0){
        local_position.x = position.x;
        local_position.y = position.y;
        local_position.z = position.z;
        const mesh = this.CreateSpring(spring, local_position, localAxis, maxLength, info);
        multipleList.add(mesh);
      } else {
        for (let k = - info.count; k <= info.count; k += 1) {
          local_position.x = position.x + localAxis.x.x * k * interval;
          local_position.y = position.y + localAxis.x.y * k * interval;
          local_position.z = position.z + localAxis.x.z * k * interval;
          const mesh = this.CreateSpring(spring, local_position, localAxis, maxLength, info);
          multipleList.add(mesh);
        }
      }      
      this.fixmemberList.push(multipleList);
      this.scene.add(multipleList);
      multipleList = new Object3D();  //multipleListの初期化
    }

    // 回転バネ用の分岐
    if (spring.direction === 'r') {
      multipleList.name = 'fixmember' + spring.row.toString() + spring.direction.toString();

      info.count = (Math.floor(len / 2 / interval - interval) === -1) ? 0 : Math.floor(len / 2 / interval - interval);
      if (info.count === 0){
        local_position.x = position.x;
        local_position.y = position.y;
        local_position.z = position.z;
        const mesh = this.CreateRotatingSpring(spring, local_position, localAxis, maxLength, info);
        multipleList.add(mesh);
      } else {
        for (let k = - info.count; k <= info.count; k += 1) {
          local_position.x = position.x + localAxis.x.x * k * interval;
          local_position.y = position.y + localAxis.x.y * k * interval;
          local_position.z = position.z + localAxis.x.z * k * interval;
          const mesh = this.CreateRotatingSpring(spring, local_position, localAxis, maxLength, info);
          multipleList.add(mesh);
        }
      }      
      this.fixmemberList.push(multipleList);
      this.scene.add(multipleList);
      multipleList = new Object3D();  //multipleListの初期化
    }
  }

  // バネを描く
  public CreateSpring(spring, position, localAxis, maxLength, info) {
    let geometry = new THREE.BufferGeometry();
    let vertices = [];
    let increase :number ;
    switch (spring.relationship) {
      case ('small'):
        increase = 0.003;
        break;
      case ('large'):
        increase = -0.003;
        break;
    }
    const laps = (info.count === 0 && spring.direction === 'x') ? Math.floor(info.len / Math.abs(increase) / 36) : 4;
    const split = 10;
    const radius = 0.05 * 10;
    let x = position.x;
    let y = position.y;
    let z = position.z;
    for (let i = 0; i <= laps * 360; i += split) {
      x = radius * Math.sin(Math.PI / 180 * i) * maxLength;
      y = radius * Math.cos(Math.PI / 180 * i) * maxLength;
      z = (spring.direction === 'x') ? ((- i + laps * 360 / 2) * increase) * maxLength : 
                                        - i * increase * 0.5 * maxLength ;
      vertices.push(new THREE.Vector3(x, y, z));
    }
    geometry = new THREE.BufferGeometry().setFromPoints( vertices );
    const line = new THREE.LineBasicMaterial({ color: spring.color });
    const mesh = new THREE.Line(geometry, line);
    // lookAt用
    switch (spring.direction) {
      case ('x'):
        mesh.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
        break;
      case ('y'):
        mesh.lookAt(localAxis.y.x, localAxis.y.y, localAxis.y.z);
        break;
      case ('z'):
        mesh.lookAt(localAxis.z.x, localAxis.z.y, localAxis.z.z);
        break;
    }
    mesh.position.set(position.x, position.y, position.z);

    return mesh
  }

  // 回転バネ支点を描く
  public CreateRotatingSpring(rotatingspring, position, localAxis, maxLength, info) {
    let geometry = new THREE.BufferGeometry();
    let vertices = [];
    const laps = 3 + 0.25;
    const split = 10;
    const radius = 0.1 * 0.005;
    let x = position.x;
    let y = position.y;
    let z = position.z;
    for (let j = 0; j <= laps * 360; j += split) {
      x = radius * Math.sin(Math.PI / 180 * j) * maxLength * j;
      y = radius * Math.cos(Math.PI / 180 * j) * maxLength * j;
      z = 0;
      vertices.push(new THREE.Vector3(x, y, z));
    }
    geometry = new THREE.BufferGeometry().setFromPoints( vertices );
    const line = new THREE.LineBasicMaterial({ color: rotatingspring.color });
    const mesh = new THREE.Line(geometry, line);
    mesh.lookAt(position.x + localAxis.x.x, position.y + localAxis.x.y, position.z + localAxis.x.z); // 作図上y方向を見る
    mesh.position.set(position.x, position.y, position.z);

    return mesh;
  }

  //シートの選択行が指すオブジェクトをハイライトする
  public selectChange(index_row, index_column): void{

    if (this.currentIndex === index_row && this.currentIndex_sub === index_column){
      //選択行の変更がないとき，何もしない
      return
    }

    let column = "";
    if (index_column === 0){
      //column = "x"
    } else if (index_column === 1){
      column = "x"
    } else if (index_column === 2) {
      column = "y"
    } else if (index_column === 3) {
      column = "z"
    } else if (index_column === 4) {
      column = "r"
    }

    //全てのハイライトを元に戻し，選択行のオブジェクトのみハイライトを適応する
    for (let item of this.fixmemberList){
      for (const item_child of item.children){
        item_child['material']['color'].setHex(0X000000);
      }
      if (item.name === 'fixmember' + index_row.toString() + column){
        for (const item_child of item.children){
          item_child['material']['color'].setHex(0X00A5FF);
        }
      }
    }

    this.currentIndex = index_row;
    this.currentIndex_sub = index_column;

    this.scene.render();
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

  // スケールを反映する
  private onResize(): void {
    for (const item of this.fixmemberList) {
      for (const item_child of item.children) {
        if (item_child.parent.name.slice(-1) === 'x') {
          item_child.scale.set(this.scale, this.scale, 1);
        } else if (item_child.parent.name.slice(-1) === 'y' || item_child.parent.name.slice(-1) === 'z') {
          const getBaseLog = Math.log(this.scale) / Math.log(2)
          item_child.scale.set(1 + getBaseLog, 1 + getBaseLog, this.scale);
        } else {
          item_child.scale.set(this.scale, this.scale, this.scale);
        }
      }
    }
  }

}
