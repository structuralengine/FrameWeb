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


@Injectable({
  providedIn: 'root'
})
export class ThreeSectionForceService {

  private lineList: THREE.Line[];
  private targetData: any;
  private targetIndex: string;

  private scale: number;
  private params: any;          // GUIの表示制御
  private radioButtons = ['axialForce', 'shearForceY', 'shearForceZ', 'torsionalMoment', 'momentY', 'momentZ'];
  private gui: any;

  private font: THREE.Font;


  constructor(private scene: SceneService,
    private helper: DataHelperModule,
    private fsec: ResultFsecService,
    private comb_fsec: ResultCombineFsecService,
    private pik_fsec: ResultPickupFsecService,
    private node: InputNodesService,
    private member: InputMembersService,
    private three_member: ThreeMembersService) {

    this.lineList = new Array();
    this.ClearData();

    // gui
    this.params = {
      forceScale: this.scale
    };
    for (const key of this.radioButtons) {
      this.params[key] = false;
    }
    this.params.momentY = true; // 初期値
    this.gui = null;

    // フォントをロード
    const loader = new THREE.FontLoader();
    loader.load('./assets/fonts/helvetiker_regular.typeface.json', (font) => {
      this.font = font;
    });
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
    this.targetData = {}; //new Array();
    this.targetIndex = "1";
    this.scale = 0.5;
  }

  public guiEnable(): void {
    if (this.gui !== null) {
      return;
    }
    this.gui = {
      forceScale: this.scene.gui.add(this.params, 'forceScale', 0, 1).step(0.001).onChange((value) => {
        // guiによる設定
        this.scale = value;
        this.onResize();
      })
    };
    for (const key of this.radioButtons) {
      this.gui[key] = this.scene.gui.add(this.params, key, this.params[key]).listen().onChange((value) => {
        if (value === true) {
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
    for (const key of Object.keys(this.gui)) {
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
  // 変数 this.targetData に値をセットする
  public chengeData(index: number): void {

    if (this.lineList.length > 0) {
      // 既に Geometryを作成していたら リサイズするだけ
      this.targetIndex = index.toString();
      this.onResize();
      return;
    }

    // 要素を排除する
    this.ClearData();

    // 格点データを入手
    const nodeData = this.node.getNodeJson(0);
    const nodeKeys = Object.keys(nodeData);
    if (nodeKeys.length <= 0) {
      return;
    }

    // メンバーデータを入手
    const memberData = this.member.getMemberJson(0);
    const memberKeys = Object.keys(memberData);
    if (memberKeys.length <= 0) {
      return;
    }

    // 断面力データを入手
    const allFsecgData = this.fsec.getFsecJson();
    this.targetIndex = index.toString();

    for (const targetKey of Object.keys(allFsecgData)) {

      let fsecData = allFsecgData[targetKey].slice();

      // 新しい入力を適用する
      const targetList = new Array();

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
        const deleteindex: number[] = new Array();
        let currentPosition: number = 0;
        for (let c = 0; c < fsecData.length; c++) {
          const fsec = fsecData[c];
          if (fsec.m === id) {
            flg = true;
            // 1つめのデータは部材情報
            fsecPoints.push({
              id: fsec.m,
              iPosition: i,
              jPosition: j,
              length: MemberLength,
              localAxisX: localAxis.x,
              localAxisY: localAxis.y,
              localAxisZ: localAxis.z
            });
            // ２つめのデータ以降が断面力情報
            currentPosition = this.helper.toNumber(fsec.l);
            fsecPoints.push(this.getFsecPoints(MemberLength, currentPosition, fsec, i, j));
            deleteindex.push(c);
          } else if (flg === true) {
            if (fsec.m.trim().length > 0) {
              break;
            }
            currentPosition += this.helper.toNumber(fsec.l);
            fsecPoints.push(this.getFsecPoints(MemberLength, currentPosition, fsec, i, j));
            deleteindex.push(c);
          }
        }
        targetList.push(fsecPoints);

        // 登録済のデータは削除する
        for (let d = deleteindex.length - 1; d >= 0; d--) {
          const c = deleteindex[d];
          fsecData.splice(c, 1);
        }
        
      }
      this.targetData[targetKey] = targetList;
    }

    if (!(this.targetIndex in this.targetData)) {
      return;      // 荷重Case番号 this.targetIndex が 計算結果 this.targetData に含まれていなかったら何もしない
    }

    // 断面力図を描く
    this.onResize();
    
  }

  // 断面力, 部材の情報をまとめる
  private getFsecPoints(MemberLength: number,
    localPosition: number,
    fsec,
    i,
    j) {

    // 断面力の集計
    const axialForce: number = this.helper.toNumber(fsec.fx);
    const shearForceY: number = this.helper.toNumber(fsec.fy);
    const shearForceZ: number = this.helper.toNumber(fsec.fz);
    const torsionalMoment: number = this.helper.toNumber(fsec.mx);
    const momentY: number = this.helper.toNumber(fsec.my);
    const momentZ: number = this.helper.toNumber(fsec.mz);

    // 位置
    const worldPosition = {
      x: (localPosition / MemberLength) * (j.x - i.x) + i.x,
      y: (localPosition / MemberLength) * (j.y - i.y) + i.y,
      z: (localPosition / MemberLength) * (j.z - i.z) + i.z
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

    const targetKey: string = this.targetIndex.toString();
    if (!(targetKey in this.targetData)) return;

    let key: string;
    let axis: string;
    let color: THREE.Color;

    if (this.params.axialForce === true) {
      // 軸方向の圧縮力
      color = new THREE.Color(0xFF0000);
      key = 'axialForce';
      axis = 'localAxisY';
    } else if(this.params.torsionalMoment === true) {
      // ねじり曲げモーメント
      color = new THREE.Color(0xFF0000);
      key = 'torsionalMoment';
      axis = 'localAxisZ';
    } else if (this.params.shearForceY === true) {
      // Y方向のせん断力
      color = new THREE.Color(0x00FF00);
      key = 'shearForceY';
      axis = 'localAxisY';
    } else if (this.params.momentY === true) {
      // Y軸周りの曲げモーメント
      color = new THREE.Color(0x00FF00);
      key = 'momentY';
      axis = 'localAxisZ';
    } else if (this.params.shearForceZ === true) {
      // Z方向のせん断力
      color = new THREE.Color(0x0000FF);
      key = 'shearForceZ';
      axis = 'localAxisZ';
    } else if (this.params.momentZ === true) {
      // Z軸周りの曲げモーメント
      color = new THREE.Color(0x0000FF);
      key = 'momentZ';
      axis = 'localAxisY';
    } else {
      return;
    }

    const tmplineList: Line2[] = this.lineList;

    for ( let i = 0; i < this.targetData[targetKey].length; i++){
      const target = this.targetData[targetKey][i];

      // 断面力のpathを表示
      const memberInfo: any = target[0]; // 1つめのデータは部材情報 (２つめのデータ以降が断面力情報)
      const positions = [];
      const colors = [];
      const danmenryoku = [];
      for (const force of target) {
        let x: number = force.worldPosition.x;
        let y: number = force.worldPosition.y;
        let z: number = force.worldPosition.z;
        x -= force[key] * memberInfo[axis].x * this.scale;
        y -= force[key] * memberInfo[axis].y * this.scale;
        z -= force[key] * memberInfo[axis].z * this.scale;
        positions.push(x, y, z);
        colors.push(color.r, color.g, color.b);
        danmenryoku.push(force[key]);
      }
      if(this.lineList.length> 0){
        const line = this.lineList[i];
        // ここに line を修正するコードを描く

      } else{
        const line = this.addPathGeometory(positions, colors, danmenryoku);
        tmplineList.push(line);
        this.scene.add(line);
      }
    }
    this.lineList = tmplineList;
  }

  // 断面力の線を(要素ごとに)描く
  private addPathGeometory(positions: any[], colors: any[], danmenryokuList: number[]): Line2 {

    // 線を追加
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

    // テキストを追加
    const matText = [
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    ];

    let j = 0;
    for (let i = 0; i < positions.length; i += 3) {
      const pos = {
        x: positions[i],
        y: positions[i + 1],
        z: positions[i + 2],
      };
      const DanmentyokuText = String(danmenryokuList[j]);
      const TextGeometry = new THREE.TextGeometry(
        DanmentyokuText, {
        font: this.font,
        size: 0.2,
        height: 0.002,
        curveSegments: 4,
        bevelEnabled: false,
      }
      );
      const text = new THREE.Mesh(TextGeometry, matText);
      // 数値をx-y平面の状態から，x-z平面の状態に回転
      text.rotation.x = Math.PI / 2;
      // 数値を任意の位置に配置
      text.position.set(pos.x, pos.y, pos.z);
      line.add(text);
      j++;
    }
    return line;
  }



}
