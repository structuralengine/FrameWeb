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
import { ThreeNodesService } from './three-nodes.service.js';


@Injectable({
  providedIn: 'root'
})
export class ThreeSectionForceService {

  private isVisible: boolean;
  private lineList: THREE.Line[];
  private targetData: any;
  private targetIndex: string;

  private scale: number;
  private params: any;          // GUIの表示制御
  private radioButtons = ['axialForce', 'shearForceY', 'shearForceZ', 'torsionalMoment', 'momentY', 'momentZ'];
  private gui: any;
  private gui_max_scale: number;

  private font: THREE.Font;


  constructor(private scene: SceneService,
              private helper: DataHelperModule,
              private fsec: ResultFsecService,
              private comb_fsec: ResultCombineFsecService,
              private pik_fsec: ResultPickupFsecService,
              private node: InputNodesService,
              private member: InputMembersService,
              private three_node: ThreeNodesService,
              private three_member: ThreeMembersService) {

    this.isVisible = null;

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
    this.gui_max_scale = 1;

    // フォントをロード
    const loader = new THREE.FontLoader();
    loader.load('./assets/fonts/helvetiker_regular.typeface.json', (font) => {
      this.font = font;
    });
  }

  public visible(flag: boolean): void {
    if (this.isVisible === flag) {
      return;
    }
    for (const mesh of this.lineList) {
      mesh.visible = flag;
    }
    this.isVisible = flag
    if (flag === true) {
      this.guiEnable();
    } else {
      this.guiDisable();
    }
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
    this.targetIndex = '';
    this.scale = 0.5;
  }

  private guiEnable(): void {
    if (this.gui !== null) {
      return;
    }
    const gui_step: number = this.gui_max_scale * 0.001;
    this.gui = {
      forceScale: this.scene.gui.add(this.params, 'forceScale', 0, this.gui_max_scale).step(gui_step).onChange((value) => {
        // guiによる設定
        this.scale = value;
        this.onResize();
        this.scene.render();
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
        this.scene.render();
      });
    }
  }

  private guiDisable(): void {
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

    if(this.targetIndex === index.toString()){
      // ケースが同じなら何もしない
      return;
    }

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

      if (!Array.isArray(allFsecgData[targetKey])){
        continue;
      }
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

    // スケールの決定に用いる変数を写す
    let minDistance: number;
    let maxDistance: number;
    [minDistance, maxDistance] = this.getDistance();

    const maxValue: number = allFsecgData['max_value'];
    this.targetData['scale'] = minDistance / maxValue;
    this.gui_max_scale = maxDistance / minDistance;

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
    let scale: number = this.targetData['scale'] * this.scale;

    if (this.params.axialForce === true) {
      // 軸方向の圧縮力
      color = new THREE.Color(0xFF0000);
      key = 'axialForce';
      axis = 'localAxisY';
    } else if (this.params.torsionalMoment === true) {
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

    for (let i = 0; i < this.targetData[targetKey].length; i++) {
      const target = this.targetData[targetKey][i];

      // 断面力のpathを表示
      const memberInfo: any = target[0]; // 1つめのデータは部材情報 (２つめのデータ以降が断面力情報)
      const positions = [];
      const colors = [];
      const danmenryoku = [];

      // i端の座標を登録
      positions.push(memberInfo.iPosition.x);
      positions.push(memberInfo.iPosition.y);
      positions.push(memberInfo.iPosition.z);   
      colors.push(color.r, color.g, color.b);   
      // 断面力の座標を登録
      for (let j = 1; j < target.length; j++) {
        const force = target[j];
        let x: number = force.worldPosition.x;
        let y: number = force.worldPosition.y;
        let z: number = force.worldPosition.z;
        const f: number = force[key];
        if ( f===0 ) {
          continue;
        }
        x -= f * memberInfo[axis].x * scale;
        y -= f * memberInfo[axis].y * scale;
        z -= f * memberInfo[axis].z * scale;
        positions.push(x, y, z);
        colors.push(color.r, color.g, color.b);
        danmenryoku.push(f);
      }
      // j端の座標を登録
      positions.push(memberInfo.jPosition.x);
      positions.push(memberInfo.jPosition.y);
      positions.push(memberInfo.jPosition.z);
      colors.push(color.r, color.g, color.b);

      if (tmplineList.length > 0) {
        // 既にオブジェクトが生成されていた場合
        // line を修正するコード
        const line = tmplineList[i];
        const LineGeometry: LineGeometry = line.geometry;
        LineGeometry.setPositions(positions);

        // 文字と面を削除する
        while (line.children.length > 0) {
          const object = line.children[0];
          object.parent.remove(object);
        }
        
        // テキストを追加
        this.addTextGeometry(positions, line, danmenryoku);
        // 面を追加する
        this.addPathGeometory(positions, line, colors);

      } else {
        // 線を生成する
        const line = this.createLineGeometory(positions, colors);
        // テキストを追加
        this.addTextGeometry(positions, line, danmenryoku);
        // 面を追加する
        this.addPathGeometory(positions, line, colors);
        // シーンに追加する
        tmplineList.push(line);
        this.scene.add(line);
      }
    }
    this.lineList = tmplineList;
  }

  // 断面力の線を(要素ごとに)描く
  private createLineGeometory(positions: any[], colors: any[]): Line2 {

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

    return line;
  }

  // テキストを追加
  private addTextGeometry(positions: any[], line: THREE.Line, danmenryoku: number[]): void {
    let j = 0;
    for (let i = 3; i < positions.length - 3; i += 3) {
      const pos = {
        x: positions[i],
        y: positions[i + 1],
        z: positions[i + 2],
      };

      // 数値を更新
      const DanmentyokuText = String(danmenryoku[j]);
      const TextGeometry = new THREE.TextGeometry(
        DanmentyokuText, {
        font: this.font,
        size: 0.2,
        height: 0.002,
        curveSegments: 4,
        bevelEnabled: false,
      });
      const matText = [
        new THREE.MeshBasicMaterial({ color: 0x000000 }),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      ];
      const text = new THREE.Mesh(TextGeometry, matText);
      // 数値をx-y平面の状態から，x-z平面の状態に回転
      text.rotation.x = Math.PI / 2;
      // 数値を任意の位置に配置
      text.position.set(pos.x, pos.y, pos.z);
      line.add(text);
      j++;
    }
  }

  // 面を追加する
  private addPathGeometory(positions: any[], line: THREE.Line, colors: any[]): void {

    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x00cc00,
      opacity: 0.3
    });

    const posList: THREE.Vector3[] = new Array();
    for (let i = 0; i < positions.length; i += 3) {
        posList.push(new THREE.Vector3(
          positions[i],
          positions[i + 1],
          positions[i + 2]));
    }

    for ( let i = 1; i < posList.length - 1; i++ ){
      let geometry = new THREE.Geometry(); 
      geometry.vertices.push(posList[0]);
      geometry.vertices.push(posList[i]);
      geometry.vertices.push(posList[i + 1]);
      geometry.faces.push(new THREE.Face3(0, 1, 2));
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, material);
      line.add(mesh);
    }
  }

  private getDistance(): number[] {
    let minDistance: number = Number.MAX_VALUE;
    let maxDistance: number = 0;
    
    const member: object = this.member.getMemberJson(0);
    for ( const memberNo of Object.keys(member)){
      const l: number = this.member.getMemberLength(memberNo);
      minDistance = Math.min(l, minDistance);
      maxDistance = Math.max(l, maxDistance);
    }

    return [minDistance, maxDistance];
  }
}

