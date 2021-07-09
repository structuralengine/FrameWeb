import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { Line2 } from '../libs/Line2.js';
import { LineMaterial } from '../libs/LineMaterial.js';
import { LineGeometry } from '../libs/LineGeometry.js';

import { SceneService } from '../scene.service';

import { DataHelperModule } from '../../../providers/data-helper.module';

import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../../components/input/input-members/input-members.service';

import { ResultCombineDisgService } from '../../result/result-combine-disg/result-combine-disg.service';
import { ResultPickupDisgService } from '../../result/result-pickup-disg/result-pickup-disg.service';

import { ThreeNodesService } from './three-nodes.service';
import { ThreeMembersService } from './three-members.service.js';

@Injectable({
  providedIn: 'root'
})
export class ThreeDisplacementService {

  private lineList: THREE.Line[];
  private targetData: any;

  private isVisible: boolean;
  private scale: number;
  private params: any;          // GUIの表示制御
  private gui: any;
  private gui_max_scale: number;

  private nodeData: any
  private membData: any
  private allDisgData: any;

  constructor(private scene: SceneService,
              private helper: DataHelperModule,
              private comb_disg: ResultCombineDisgService,
              private pik_disg: ResultPickupDisgService,
              private node: InputNodesService,
              private member: InputMembersService,
              private three_node: ThreeNodesService,
              private three_member: ThreeMembersService) {
    this.lineList = new Array();
    this.targetData = new Array();

    this.isVisible = null;
    this.ClearData();

    // gui
    this.params = {
      dispScale: this.scale,
    };
    this.gui = null;
    this.gui_max_scale = 1;

  }

  public visibleChange(flag: boolean): void {
    if ( this.isVisible === flag) {
      return;
    }
    for (const mesh of this.lineList) {
      mesh.visible = flag;
    }
    this.isVisible = flag;
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
    this.scale = 0.5;

    this.nodeData = {};
    this.membData = {};
    this.allDisgData = {};
  }

  private guiEnable(): void {
    if (this.gui !== null) {
      return;
    }

    const gui_step: number = this.gui_max_scale * 0.001;
    this.gui = this.scene.gui.add(this.params, 'dispScale', 0, this.gui_max_scale).step(gui_step).onChange((value) => {
      this.scale = value;
      this.onResize();
      this.scene.render();
    });
  }

  private guiDisable(): void {
    if (this.gui === null) {
      return;
    }
    this.scene.gui.remove(this.gui);
    this.gui = null;
  }

  // 解析結果をセットする
  public setResultData(getDisgJson: any): void {
    this.nodeData = this.node.getNodeJson(0);
    this.membData = this.member.getMemberJson(0);
    this.allDisgData = getDisgJson;
    this.changeData(1);
  }

  public changeData(index: number): void {

    // 格点データを入手
    if (Object.keys(this.nodeData).length <= 0) {
      return;
    }

    // メンバーデータを入手
    const membKeys = Object.keys(this.membData);
    if (membKeys.length <= 0) {
      return;
    }

    // 変位データを入手
    const targetKey: string = index.toString();
    if (!(targetKey in this.allDisgData)) {
      return;
    }
    const disgData = this.allDisgData[targetKey];

    this.targetData = new Array();

    // 新しい入力を適用する
    for (const key of membKeys) {

      // 節点データを集計する
      const m = this.membData[key];
      const i = this.nodeData[m.ni];
      const j = this.nodeData[m.nj];
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
      let Division = 20;
      if(di.rx===dj.rx && di.ry===dj.ry && di.rz===dj.rz ){
        Division = 1;
      }
      
      this.targetData.push({
        name: key,
        xi: i.x,
        yi: i.y,
        zi: i.z,
        xj: j.x,
        yj: j.y,
        zj: j.z,
        theta: m.cg,
        dxi: di.dx,
        dyi: di.dy,
        dzi: di.dz,
        dxj: dj.dx,
        dyj: dj.dy,
        dzj: dj.dz,
        rxi: di.rx,
        ryi: di.ry,
        rzi: di.rz,
        rxj: dj.rx,
        ryj: dj.ry,
        rzj: dj.rz,
        Division,
      });
    }

    // スケールの決定に用いる変数を写す
    let minDistance: number;
    let maxDistance: number;
    [minDistance, maxDistance] = this.getDistance();

    const maxValue: number = this.allDisgData['max_value'];
    this.targetData['scale'] = minDistance / maxValue;
    this.gui_max_scale = maxDistance / minDistance;

    this.onResize();
  }

  private onResize(): void {

    const tmplineList: THREE.Line[] = this.lineList;
    let scale: number = this.targetData['scale'] * this.scale * 0.7;

    for (let i = 0; i < this.targetData.length; i++) {
      const target = this.targetData[i];

      const xi: number = target.xi + target.dxi * scale;
      const yi: number = target.yi + target.dyi * scale;
      const zi: number = target.zi + target.dzi * scale;

      const xj: number = target.xj + target.dxj * scale;
      const yj: number = target.yj + target.dyj * scale;
      const zj: number = target.zj + target.dzj * scale;

      // 要素座標系への変換
      const t = this.three_member.tMatrix(xi, yi, zi, xj, yj, zj, target.theta);
      const dge = [ target.dxi, target.dyi, target.dzi, target.rxi, target.ryi, target.rzi, 
                    target.dxj, target.dyj, target.dzj, target.rxj, target.ryj, target.rzj];//.map(v => v * scale);;
      const de: number[] = new Array(dge.length);
      for( let ip=0; ip<4; ip++){
        const ib = 3 * ip;
        for(let i=0; i<3; i++){
          let s = 0;
          for(let j=0; j<3; j++){
            s = s + t[i][j] * dge[ib + j];
          }
        de[ib + i] = s
        }
      }


      const Division: number = target.Division;

      const L = Math.sqrt(Math.pow(xi - xj, 2) + Math.pow(yi - yj, 2) + Math.pow(zi - zj, 2));

      const positions = [];
      const threeColor = new THREE.Color(0xFF0000);
      const colors = [];

      // 補間点の節点変位の計算
      for (let j = 0; j <= Division; j++) {
        const n = j / Division;
        const xhe = (1 - n) * de[0] + n * de[6];
        const yhe = (1 - 3 * Math.pow(n, 2) + 2 * Math.pow(n, 3)) * de[1] + L * (n - 2 * Math.pow(n, 2) + Math.pow(n, 3)) * de[5]
          + (3 * Math.pow(n, 2) - 2 * Math.pow(n, 3)) * de[7] + L * (0 - Math.pow(n, 2) + Math.pow(n, 3)) * de[11];
        const zhe = (1 - 3 * Math.pow(n, 2) + 2 * Math.pow(n, 3)) * de[2] - L * (n - 2 * Math.pow(n, 2) + Math.pow(n, 3)) * de[4]
          + (3 * Math.pow(n, 2) - 2 * Math.pow(n, 3)) * de[8] - L * ( Math.pow(n, 3)- Math.pow(n, 2)) * de[10];


        // 全体座標系への変換
        const xhg = t[0][0] * xhe + t[1][0] * yhe + t[2][0] * zhe;
        const yhg = t[0][1] * xhe + t[1][1] * yhe + t[2][1] * zhe;
        const zhg = t[0][2] * xhe + t[1][2] * yhe + t[2][2] * zhe;

        // 補間点の変位を座標値に付加
        const xk = (1 - n) * xi + n * xj + xhg * scale;
        const yk = (1 - n) * yi + n * yj + yhg * scale;
        const zk = (1 - n) * zi + n * zj + zhg * scale;

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
        line.visible = false; //----------> ポイント：非表示で生成する
        this.scene.add(line);
      }
    }
    this.lineList = tmplineList;
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
