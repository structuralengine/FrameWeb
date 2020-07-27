import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { Line2 } from '../libs/Line2.js';
import { LineMaterial } from '../libs/LineMaterial.js';
import { LineGeometry } from '../libs/LineGeometry.js';

import { SceneService } from '../scene.service';

import { DataHelperModule } from '../../../providers/data-helper.module';

import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../../components/input/input-members/input-members.service';

import { ResultDisgService } from '../../result/result-disg/result-disg.service';
import { ResultCombineDisgService } from '../../result/result-combine-disg/result-combine-disg.service';
import { ResultPickupDisgService } from '../../result/result-pickup-disg/result-pickup-disg.service';

import { ThreeNodesService } from './three-nodes.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeDisplacementService {

  private lineList: THREE.Line[];
  private targetData: any;

  private isVisible: boolean;
  private scale: number;
  private defaultScale: number;
  private params: any;          // GUIの表示制御
  private gui: any;
  private maxLength: number;
  private maxDiplacement: number;
  private defaultRatio: number;

  constructor(private scene: SceneService,
              private helper: DataHelperModule,
              private disg: ResultDisgService,
              private comb_disg: ResultCombineDisgService,
              private pik_disg: ResultPickupDisgService,
              private node: InputNodesService,
              private member: InputMembersService,
              private three_node: ThreeNodesService) {
    this.lineList = new Array();
    this.targetData = new Array();

    this.isVisible = null;

    this.defaultScale = 0.2
    this.defaultRatio = 0.2 / 0.5  // 最大梁長に対するたわみの表示比率初期値/dispScale初期値
    this.maxDiplacement = 1;
    // gui
    this.params = {
      dispScale: 0.5,
    };
    this.gui = null;
  }

  public visible(flag: boolean): void {
    if( this.isVisible === flag){
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
  }

  private guiEnable(): void {
    if (this.gui !== null) {
      return;
    }

    this.gui = this.scene.gui.add(this.params, 'dispScale', 0, 1).step(0.001).onChange((value) => {
      this.scale = this.defaultRatio * value * this.maxLength / this.maxDiplacement;
      this.onResize();
    });
  }

  private guiDisable(): void {
    if (this.gui === null) {
      return;
    }
    this.scene.gui.remove(this.gui);
    this.gui = null;
  }

  public chengeData(index: number): void {

    // 格点データを入手
    const nodeData = this.node.getNodeJson(0);
    const nodeKeys = Object.keys(nodeData);
    if (nodeKeys.length <= 0) {
      return;
    }

    // メンバーデータを入手
    const membData = this.member.getMemberJson(0);
    const membKeys = Object.keys(membData);
    if (membKeys.length <= 0) {
      return;
    }

    // 変位データを入手
    const allDisgData = this.disg.getDisgJson();
    const targetKey: string = index.toString();
    if (!(targetKey in allDisgData)) {
      return;
    }
    const disgData = allDisgData[targetKey];

    this.maxLength = this.three_node.maxdistance; // 最大梁長

    this.maxDiplacement = this.disg.getMaxDisg(); // 最大変位

    // 初期表示ではdispScaleが0.5の時に最大梁長の1/5となる
    if (this.maxDiplacement === 0) {
      this.scale = 0;
    } else {
      this.scale = this.defaultScale * this.maxLength / this.maxDiplacement;
    }

    this.targetData = new Array();

    // 新しい入力を適用する
    for (const key of membKeys) {

      // 節点データを集計する
      const m = membData[key];
      const i = nodeData[m.ni];
      const j = nodeData[m.nj];
      if (i === undefined || j === undefined) {
        continue;
      }

      const disgKeys = Object.keys(disgData);
      if (disgKeys.length <= 0) {
        return;
      }

      const di: any = disgData.find((tmp) => {
        return tmp.id === m.ni.toString();
      });
      const dj: any = disgData.find((tmp) => {
        return tmp.id === m.nj.toString();
      });

      if (di === undefined || dj === undefined) {
        continue;
      }

      this.targetData.push(
        {
          name: key,
          xi: i.x,
          yi: i.y,
          zi: i.z,
          xj: j.x,
          yj: j.y,
          zj: j.z,
          dxi: this.helper.toNumber(di.dx),
          dyi: this.helper.toNumber(di.dy),
          dzi: this.helper.toNumber(di.dz),
          dxj: this.helper.toNumber(dj.dx),
          dyj: this.helper.toNumber(dj.dy),
          dzj: this.helper.toNumber(dj.dz),
          rxi: this.helper.toNumber(di.rx),
          ryi: this.helper.toNumber(di.ry),
          rzi: this.helper.toNumber(di.rz),
          rxj: this.helper.toNumber(dj.rx),
          ryj: this.helper.toNumber(dj.ry),
          rzj: this.helper.toNumber(dj.rz),
          Division: 20,
        }
      );
    }
    this.onResize();
  }

  private onResize(): void {

    const tmplineList: THREE.Line[] = this.lineList;

    for (let i = 0; i < this.targetData.length; i++) {
      const target = this.targetData[i];

      let xi: number = target.xi;
      let yi: number = target.yi;
      let zi: number = target.zi;

      xi += target.dxi * this.scale;
      yi += target.dyi * this.scale;
      zi += target.dzi * this.scale;

      let xj: number = target.xj;
      let yj: number = target.yj;
      let zj: number = target.zj;

      xj += target.dxj * this.scale;
      yj += target.dyj * this.scale;
      zj += target.dzj * this.scale;

      const dxi: number = target.dxi;
      const dyi: number = target.dyi;
      const dzi: number = target.dzi;
      const rxi: number = target.rxi;
      const ryi: number = target.ryi;
      const rzi: number = target.rzi;

      const dxj: number = target.dxj;
      const dyj: number = target.dyj;
      const dzj: number = target.dzj;
      const rxj: number = target.rxj;
      const ryj: number = target.ryj;
      const rzj: number = target.rzj;

      const Division: number = target.Division;

      const L = Math.sqrt((xi - xj) ** 2 + (yi - yj) ** 2 + (zi - zj) ** 2);

      const positions = [];
      const threeColor = new THREE.Color(0xFF0000);
      const colors = [];

      // 補間点の節点変位の計算
      for (let j = 0; j <= Division; j++) {
        const n = j / Division;
        const xhe = (1 - n) * dxi + n * dxj;
        const yhe = (1 - 3 * n ** 2 + 2 * n ** 3) * dyi + L * (n - 2 * n ** 2 + n ** 3) * rzi
          + (3 * n ** 2 - 2 * n ** 3) * dyj + L * (0 - n ** 2 + n ** 3) * rzj;
        const zhe = (1 - 3 * n ** 2 + 2 * n ** 3) * dzi - L * (n - 2 * n ** 2 + n ** 3) * ryi
          + (3 * n ** 2 - 2 * n ** 3) * dzj - L * (0 - n ** 2 + n ** 3) * ryj;

        // 補間点の変位を座標値に付加
        const xk = (1 - n) * xi + n * xj + xhe * this.scale;
        const yk = (1 - n) * yi + n * yj + yhe * this.scale;
        const zk = (1 - n) * zi + n * zj + zhe * this.scale;

        positions.push(xk, yk, zk);
        colors.push(threeColor.r, threeColor.g, threeColor.b);
      }

      if (this.lineList.length > i) {
        const line = this.lineList[i];
        // line を修正するコード
        const geometry: LineGeometry = line.geometry;
        geometry.setPositions(positions);

      } else {
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
        line.name = target.name;

        tmplineList.push(line);

        this.scene.add(line);
      }
    }
    this.lineList = tmplineList;
  }
}
