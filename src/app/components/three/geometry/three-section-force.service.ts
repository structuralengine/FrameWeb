import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { Line2 } from '../libs/Line2.js';
import { LineMaterial } from '../libs/LineMaterial.js';
import { LineGeometry } from '../libs/LineGeometry.js';

import { SceneService } from '../scene.service';

import { DataHelperModule } from '../../../providers/data-helper.module';

import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../../components/input/input-members/input-members.service';

import { ResultFsecService } from '../../result/result-fsec/result-fsec.service';
import { ResultCombineFsecService } from '../../result/result-combine-fsec/result-combine-fsec.service';
import { ResultPickupFsecService } from '../../result/result-pickup-fsec/result-pickup-fsec.service';

import { ThreeMembersService } from './three-members.service';
import { NgbTypeaheadWindow } from '@ng-bootstrap/ng-bootstrap/typeahead/typeahead-window';

const helvetiker_regular_typeface: any = require('../fonts/helvetiker_regular.typeface.json');

@Injectable({
  providedIn: 'root'
})
export class ThreeSectionForceService {

  private lineList: THREE.Line[];
  private targetData: any;

  private scale: number;
  private params: any;          // GUIの表示制御
  private radioButtons = ['axialForce', 'shearForceY', 'shearForceZ', 'torsionalMoment', 'momentY', 'momentZ'];
  private gui: any;

  constructor(private scene: SceneService,
              private helper: DataHelperModule,
              private fsec: ResultFsecService,
              private comb_fsec: ResultCombineFsecService,
              private pik_fsec: ResultPickupFsecService,
              private node: InputNodesService,
              private member: InputMembersService,
              private three_member: ThreeMembersService) {

    this.lineList = new Array();
    this.targetData = new Array();

    this.scale = 0.001;
    // gui
    this.params = {
      forceScale: this.scale
    };
    for (const key of this.radioButtons) {
      this.params[key] = false;
    }
    this.params.momentY = true; // 初期値
    this.gui = null;
  }

  // データをクリアする
  public ClearData(): void {
    if (this.lineList.length > 0) {
      // 線を削除する
      for (const mesh of this.lineList) {
        // 文字を削除する
        while (mesh.children.length > 0) {
          const object = mesh.children[0];
          object.parent.remove(object);
        }
        this.scene.remove(mesh);
      }
      this.lineList = new Array();
    }
  }

  public guiEnable(): void {
    if (this.gui !== null) {
      return;
    }
    this.gui = {
      forceScale: this.scene.gui.add(this.params, 'forceScale', 0, 0.1).step(0.001).onChange((value) => {
        // guiによる設定
        this.scale = value;
        this.onResize();
      })
    };
    for (const key of this.radioButtons) {
      this.gui[key] = this.scene.gui.add(this.params, key, this.params[key]).listen().onChange((value) => {
        if ( value === true ) {
          this.setGUIcheck(key);
        } else {
          this.setGUIcheck('');
        }
        this.onResize();
      });
    }
  }

  public guiDisable(): void {
    if (this.gui === null) {
      return;
    }
    for ( const key of Object.keys(this.gui)) {
      this.scene.gui.remove(this.gui[key]);
    }
    this.gui = null;
  }

  // gui 選択されたチェックボックス以外をOFFにする
  private setGUIcheck(target: string): void {
    for (const key of this.radioButtons) {
      this.params[key] = false;
    }
    this.params[target] = true;
  }

  // データが変更された時に呼び出される
  public chengeData(index: number): void {

    // 格点データを入手
    const nodeData = this.node.getNodeJson('calc');
    const nodeKeys = Object.keys(nodeData);
    if (nodeKeys.length <= 0) {
      return;
    }

    // メンバーデータを入手
    const memberData = this.member.getMemberJson('calc');
    const memberKeys = Object.keys(memberData);
    if (memberKeys.length <= 0) {
      return;
    }

    // 断面力データを入手
    const allFsecgData = this.fsec.getFsecJson();
    const targetKey: string = index.toString();
    if (!(targetKey in allFsecgData)) {
      return;
    }
    const fsecData = allFsecgData[targetKey];

    // 新しい入力を適用する
    this.targetData = new Array();

    for (const id of memberKeys) {

      // 節点データを集計する
      const m = memberData[id];
      const i = nodeData[m.ni];
      const j = nodeData[m.nj];
      if (i === undefined || j === undefined) {
        continue;
      }

      // 部材の座標軸を取得
      const localAxis = this.three_member.localAxis(i.x, i.y, i.z, j.x, j.y, j.z, m.cg);
      const MemberLength: number = Math.sqrt((i.x - j.x) ** 2 + (i.y - j.y) ** 2 + (i.z - j.z) ** 2);

      // 着目点
      const fsecPoints: any = new Array();
      let flg = false;
      for (const fsec of fsecData ) {
        if ( fsec.m === id ) {
          flg = true;
          // 1つめのデータは部材情報
          fsecPoints.push({
            id: fsec.m ,
            iPosition: i,
            jPosition: j,
            length: MemberLength,
            localAxisX: localAxis.x,
            localAxisY: localAxis.y,
            localAxisZ: localAxis.z
          });
          // ２つめのデータ以降が断面力情報
          fsecPoints.push(this.getFsecPoints(MemberLength, fsec, i, j));
        } else if (flg === true) {
          if ( fsec.m.trim().length > 0 ) {
            break;
          }
          fsecPoints.push(this.getFsecPoints(MemberLength, fsec, i, j));
        }
      }
      this.targetData.push(fsecPoints);
    }

    // 断面力図を描く
    this.onResize();
  }

  // 断面力, 部材の情報をまとめる
  private getFsecPoints(MemberLength, fsec, i, j) {

    // 断面力の集計
    const axialForce: number = this.helper.toNumber(fsec.fx);
    const shearForceY: number = this.helper.toNumber(fsec.fy);
    const shearForceZ: number = this.helper.toNumber(fsec.fz);
    const torsionalMoment: number = this.helper.toNumber(fsec.mx);
    const momentY: number = this.helper.toNumber(fsec.my);
    const momentZ: number = this.helper.toNumber(fsec.mz);

    // 位置
    const localPosition: number = this.helper.toNumber(fsec.l);
    const worldPosition = {
      x: (localPosition / MemberLength) * ( j.x - i.x ) + i.x,
      y: (localPosition / MemberLength) * ( j.y - i.y ) + i.y,
      z: (localPosition / MemberLength) * ( j.z - i.z ) + i.z
    };

    return {
      worldPosition,
      localPosition,
      axialForce,
      shearForceY,
      shearForceZ,
      torsionalMoment,
      momentY,
      momentZ
    };

  }

  // 断面力図を描く
  private onResize(): void {

    // 要素を排除する
    this.ClearData();

    // 軸方向の圧縮力
    if (this.params.axialForce === true ) {
      const threeColor = new THREE.Color(0xFF0000);
      this.addGeometory('axialForce', 'localAxisY', threeColor);
    }

    // ねじり曲げモーメント
    if (this.params.torsionalMoment === true ) {
      const threeColor = new THREE.Color(0xFF0000);
      this.addGeometory('torsionalMoment', 'localAxisZ', threeColor);
    }

    // Y方向のせん断力
    if (this.params.shearForceY === true ) {
      const threeColor = new THREE.Color(0x00FF00);
      this.addGeometory('shearForceY', 'localAxisY', threeColor);
    }

    // Y軸周りの曲げモーメント
    if (this.params.momentY === true ) {
      const threeColor = new THREE.Color(0x00FF00);
      this.addGeometory('momentY', 'localAxisZ', threeColor);
    }

    // Z方向のせん断力
    if (this.params.shearForceZ === true ) {
      const threeColor = new THREE.Color(0x0000FF);
      this.addGeometory('shearForceZ', 'localAxisZ', threeColor);
    }

    // Z軸周りの曲げモーメント
    if (this.params.momentZ === true ) {
      const threeColor = new THREE.Color(0x0000FF);
      this.addGeometory('momentZ', 'localAxisY', threeColor);
    }

  }

  // 断面力の図を描く
  private addGeometory(key: string, axis: string, color: THREE.Color) {

    for (const target of this.targetData) {
      // 1つめのデータは部材情報
      const memberInfo: any = target[0];
      // ２つめのデータ以降が断面力情報
      const positions = [];
      const colors = [];
      const danmenryoku = [];
      for (let i = 1; i < target.length; i++) {
        const force: any = target[i];
        let x: number = force.worldPosition.x;
        let y: number = force.worldPosition.y;
        let z: number = force.worldPosition.z;
        x -= force[key] * memberInfo[axis].x * this.scale;
        y -= force[key] * memberInfo[axis].y * this.scale;
        z -= force[key] * memberInfo[axis].z * this.scale;
        positions.push(x, y, z);
        colors.push(color.r, color.g, color.b);
        danmenryoku.push(target[i]);
      };

      const geometry: LineGeometry = new LineGeometry();
      geometry.setPositions(positions);
      geometry.setColors(colors);

      const matLine: LineMaterial = new LineMaterial({
        color: 0xFF0000,
        linewidth: 0.001,
        vertexColors: THREE.VertexColors,
        dashed: false
      });
      const line: Line2 = new Line2(geometry, matLine);
      line.computeLineDistances();

      line.scale.set(1, 1, 1);
      // line.name = '';
      this.lineList.push(line);
      this.scene.add(line);

      //断面力の値を表示
      const loader = new THREE.FontLoader().parse(helvetiker_regular_typeface);
            
      for (let i = 0; i < danmenryoku.length; i++) {
        const danmenryoku_list: any = danmenryoku[i];
        //断面力値のmeshを作成
        var DanmentyokuText = String(danmenryoku_list[key]);
        const DanmenryokuText = new THREE.TextGeometry(
          DanmentyokuText, {
            font: loader,
            size: 0.2,
            height: 0.002,
            curveSegments: 4,
            bevelEnabled: false,
          }
        );
        const DanmenryokuMaterial = [
          new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5} ),
          new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5} )
        ];
        const Section_force_value = new THREE.Mesh(DanmenryokuText, DanmenryokuMaterial);

        //数値をx-y平面の状態から，x-z平面の状態に回転
        Section_force_value.rotation.x = Math.PI / 2;
        //数値を任意の位置に配置
        Section_force_value.position.set(positions[3 * i], positions[3 * i + 1], positions[3 * i + 2]);
        //数値を表示
        this.scene.add(Section_force_value);
      }      
    }
  }

}
