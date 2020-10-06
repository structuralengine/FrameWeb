import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputNodesService } from '../../input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../input/input-members/input-members.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { ThreeNodesService } from './three-nodes.service';

import { OrbitControls } from '../libs/OrbitControls.js';
import { Line2 } from '../libs/Line2.js';
import { LineMaterial } from '../libs/LineMaterial.js';
import { LineGeometry } from '../libs/LineGeometry.js';
import { GeometryUtils } from '../libs/GeometryUtils.js';

import * as THREE from 'three';
import { ThreeService } from '../three.service';
import { ThreeMembersService } from './three-members.service';
import { Mesh, ReverseSubtractEquation } from 'three';
import { zip } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadService {

  private isVisible: boolean[];
  private pointLoadList: any[];
  private memberLoadList: any[];

  // 大きさを調整するためのスケール
  private pointLoadScale: number;
  private memberLoadScale: number;
  private params: any;          // GUIの表示制御
  private gui: any;

  constructor(private scene: SceneService,
              private nodeThree: ThreeNodesService,
              private node: InputNodesService,
              private member: InputMembersService,
              private load: InputLoadService,
              private three_member: ThreeMembersService) {

    this.isVisible = [null, null];
    this.pointLoadList = new Array();
    this.memberLoadList = new Array();

    // gui
    this.pointLoadScale = 1.0;
    this.memberLoadScale = 1.0;
    this.params = {
      pointLoadScale: this.pointLoadScale,
      memberLoadScale: this.memberLoadScale
    };
    this.gui = {};

  }

  public visible(flag: boolean, gui: boolean): void {

    // guiの表示設定
    if (gui === true) {
      this.guiEnable();
    } else {
      this.guiDisable();
    }
    this.isVisible[1] = gui;

    if (this.isVisible[0] === flag) {
      return;
    }
    for (const mesh of this.pointLoadList) {
      mesh.visible = flag;
    }
    for (const mesh of this.memberLoadList) {
      mesh.visible = flag;
    }
    this.isVisible[0] = flag;
  }

  // guiを表示する
  private guiEnable(): void {

    if (!('pointLoadScale' in this.gui)) {
      if (this.pointLoadList.length > 0) {
        this.gui['pointLoadScale'] = this.scene.gui.add(this.params, 'pointLoadScale', 0, 2).step(0.001).onChange((value) => {
          this.pointLoadScale = value;
          this.pointLoadResize();
          this.scene.render();
        });
      }
    }

    if (!('memberLoadScale' in this.gui)) {
      if (this.memberLoadList.length > 0) {
        this.gui['memberLoadScale'] = this.scene.gui.add(this.params, 'memberLoadScale', 0, 2).step(0.001).onChange((value) => {
          this.memberLoadScale = value;
          this.memberLoadResize();
          this.scene.render();
        });
      }
    }
  }

  // guiを非表示にする
  private guiDisable(): void {
    for (const key of Object.keys(this.gui)) {
      this.scene.gui.remove(this.gui[key]);
    }
    this.gui = {};
  }

  public baseScale(): number {
    // 最も距離の近い2つの節点距離
    return this.nodeThree.minDistance;
  }

  public chengeData(index: number): void {

    //const start = performance.now();

    // 一旦全排除
    this.ClearData();

    // 格点データを入手
    const nodeData = this.node.getNodeJson(0);
    if (Object.keys(nodeData).length <= 0) {
      return;
    }

    // 節点荷重データを入手
    const targetCase: string = index.toString();
    const nodeLoadData = this.load.getNodeLoadJson(0, targetCase);
    if (Object.keys(nodeLoadData).length <= 0) {
      this.ClearNodeLoad();
    } else {
      // サイズを調整しオブジェクトを登録する
      this.createNodeLoad(nodeLoadData[targetCase], nodeData);
    }

    // 要素データを入手
    const memberData = this.member.getMemberJson(0);
    if (Object.keys(memberData).length <= 0) {
      this.ClearMemberLoad();
      return;
    }

    // 要素荷重データを入手
    const memberLoadData = this.load.getMemberLoadJson(0, targetCase);
    if (Object.keys(memberLoadData).length <= 0) {
      this.ClearMemberLoad();
    } else {
      // サイズを調整しオブジェクトを登録する
      this.createMemberLoad(memberLoadData[targetCase], nodeData, memberData);
    }

    this.onResize();
    if (this.isVisible[1] === true) {
      this.guiEnable();
    }
    //const end = performance.now();
    //const elapsed = (end - start);
    //const elapsedStr = elapsed.toPrecision(3);
    //console.log(`${name}: ${start}`);
    //console.log(`${name}: ${end}`);
    //const name = "load";
    //console.log(`${name}: ${elapsedStr}`);
  }

  // 節点荷重の矢印を描く
  private createNodeLoad(nodeLoadData: any, nodeData: object): void {

    if (nodeLoadData === undefined) {
      return;
    }

    // 新しい入力を適用する
    const targetNodeLoad = nodeLoadData;
    // スケールを決定する 最大の荷重を 1とする
    let pMax = 0;
    let mMax = 0;
    for (const load of targetNodeLoad) {
      pMax = Math.max(pMax, Math.abs(load.tx));
      pMax = Math.max(pMax, Math.abs(load.ty));
      pMax = Math.max(pMax, Math.abs(load.tz));
      mMax = Math.max(mMax, Math.abs(load.rx));
      mMax = Math.max(mMax, Math.abs(load.ry));
      mMax = Math.max(mMax, Math.abs(load.rz));
    }

    // 集中荷重の矢印をシーンに追加する
    for (const load of targetNodeLoad) {
      // 節点座標 を 取得する
      const node = nodeData[load.n];
      if (node === undefined) {
        continue;
      }
      // x方向の集中荷重
      const xArrow: Line2 = this.setPointLoad(load.tx, pMax, node, 'px');
      if (xArrow !== null) {
        this.pointLoadList.push(xArrow);
        this.scene.add(xArrow);
      }
      // y方向の集中荷重
      const yArrow: Line2 = this.setPointLoad(load.ty, pMax, node, 'py');
      if (yArrow !== null) {
        this.pointLoadList.push(yArrow);
        this.scene.add(yArrow);
      }
      // z方向の集中荷重
      const zArrow: Line2 = this.setPointLoad(load.tz, pMax, node, 'pz');
      if (zArrow !== null) {
        this.pointLoadList.push(zArrow);
        this.scene.add(zArrow);
      }

      // x軸周りのモーメント
      const xMoment = this.setMomentLoad(load.rx, mMax, node, 0xFF0000, 'mx');
      if (xMoment !== null) {
        this.pointLoadList.push(xMoment);
        this.scene.add(xMoment);
      }

      // y軸周りのモーメント
      const yMoment = this.setMomentLoad(load.ry, mMax, node, 0x00FF00, 'my');
      if (yMoment !== null) {
        this.pointLoadList.push(yMoment);
        this.scene.add(yMoment);
      }

      // z軸周りのモーメント
      const zMoment = this.setMomentLoad(load.rz, mMax, node, 0x0000FF, 'mz');
      if (zMoment !== null) {
        this.pointLoadList.push(zMoment);
        this.scene.add(zMoment);
      }
    }
  }

  // 節点モーメント荷重の矢印を作成する
  private setMomentLoad(value: number, mMax: number, node: any, color: number, name: string): THREE.Line {

    if (value === 0) {
      return null;
    }

    let scale: number = value / mMax;
    scale /= 8;

    const curve = new THREE.EllipseCurve(
      0, 0,                 // ax, aY
      4, 4, // xRadius, yRadius
      0, 1.5 * Math.PI,     // aStartAngle, aEndAngle
      false,                // aClockwise
      0                     // aRotation
    );

    const points = curve.getPoints(50);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ color, linewidth: 5 });
    const ellipse = new THREE.Line(lineGeometry, lineMaterial);

    //const arrowGeometry = new THREE.ConeGeometry(0.1, 1, 3, 1, true);
    const arrowGeometry = new THREE.ConeBufferGeometry(0.1, 1, 3, 1, true);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color });
    const cone = new THREE.Mesh(arrowGeometry, arrowMaterial);
    cone.rotateX(Math.PI);
    cone.position.set(4, 0.5, 0);

    ellipse.add(cone);
    ellipse.position.set(node.x, node.y, node.z);

    switch (name) {
      case 'mx':
        ellipse.rotateX(Math.PI / 2);
        ellipse.rotateY(Math.PI / 2);
        break;
      case 'my':
        ellipse.rotateX(Math.PI / 2);
        break;
      case 'mz':
        // 何もしない
        break;
    }
    ellipse.name = name;
    ellipse.scale.set(scale, scale, scale);
    ellipse['baseScale'] = scale;

    return ellipse;

  }

  // 節点荷重の矢印を作成する
  private setPointLoad(value: number, pMax: number,
    node: any, name: string): Line2 {

    if (value === 0) {
      return null;
    }

    const maxLength: number = this.baseScale() * 0.5;
    const length: number = maxLength * value / pMax;

    let linewidth: number = this.nodeThree.baseScale / 50;

    let color: number;
    const positions = [];


    positions.push(node.x, node.y, node.z);
    switch (name) {
      case 'px':
        positions.push(node.x - length, node.y, node.z);
        color = 0xFF0000;
        break;
      case 'py':
        positions.push(node.x, node.y - length, node.z);
        color = 0x00FF00;
        break;
      case 'pz':
        positions.push(node.x, node.y, node.z - length);
        color = 0x0000FF;
        break;
    }
    const cone_scale: number = length * 0.1 * 2;
    const cone_radius: number = 0.1 * cone_scale;
    const cone_height: number = 1 * cone_scale;
    //const arrowGeometry: THREE.ConeGeometry = new THREE.ConeGeometry(cone_radius, cone_height, 3, 1, true);
    const arrowGeometry = new THREE.ConeBufferGeometry(cone_radius, cone_height, 3, 1, true);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color });
    const cone: THREE.Mesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
    switch (name) {
      case 'px':
        cone.position.set(node.x - cone_height / 2, node.y, node.z);
        cone.rotation.z = Math.PI / 2 * 3;
        break;
      case 'py':
        cone.position.set(node.x, node.y - cone_height / 2, node.z);
        break;
      case 'pz':
        cone.position.set(node.x, node.y, node.z - cone_height / 2);
        cone.rotation.x = Math.PI / 2;
        break;
    }

    const threeColor = new THREE.Color(color);
    const colors = [];
    colors.push(threeColor.r, threeColor.g, threeColor.b);
    colors.push(threeColor.r, threeColor.g, threeColor.b);

    const geometry: LineGeometry = new LineGeometry();
    geometry.setPositions(positions);
    geometry.setColors(colors);

    const matLine: LineMaterial = new LineMaterial({
      color,
      linewidth,
      vertexColors: THREE.VertexColors,
      dashed: false
    });
    const line: Line2 = new Line2(geometry, matLine);
    line.computeLineDistances();
    line.add(cone);

    line.scale.set(1, 1, 1);
    line.name = name;

    return line;

  }

  // 要素荷重の矢印を描く
  private createMemberLoad(memberLoadData: any, nodeData: object, memberData: object): void {

    if (memberLoadData === undefined) {
      return;
    }

    // memberLoadData情報を書き換える可能性があるので、複製する
    const targetMemberLoad = JSON.parse(
      JSON.stringify({
        temp: memberLoadData
      })
    ).temp;

    // スケールを決定する 最大の荷重を 1とする
    let pMax = 0;
    for (const load of targetMemberLoad) {
      pMax = Math.max(pMax, Math.abs(load.P1));
      pMax = Math.max(pMax, Math.abs(load.P2));
    }

    const maxLength: number = this.baseScale() * 0.5;

    for (const load of targetMemberLoad) {

      // 節点データを集計する
      const m = memberData[load.m];
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

      // 各情報を作成
      const L_position = {
        x1: Number(i.x + localAxis.x.x * load.L1),
        y1: Number(i.y + localAxis.x.y * load.L1),
        z1: Number(i.z + localAxis.x.z * load.L1),
        x2: Number(j.x - localAxis.x.x * load.L2),
        y2: Number(j.y - localAxis.x.y * load.L2),
        z2: Number(j.z - localAxis.x.z * load.L2),
      };
      if (load.mark === 1 || load.mark === 11) {
        L_position.x2 = i.x + localAxis.x.x * load.L2;
        L_position.y2 = i.y + localAxis.x.y * load.L2;
        L_position.z2 = i.z + localAxis.x.z * load.L2;
      }

      const Data = {
        m: load.m,
        L1: Number(load.L1),
        L2: Number(load.L2),
        P1: Number(load.P1),
        P2: Number(load.P2),
        p_one: Math.abs(load.P1) * maxLength / pMax,
        p_two: Math.abs(load.P2) * maxLength / pMax,
        len_L: new THREE.Vector3(
          L_position.x2 - L_position.x1,
          L_position.y2 - L_position.y1,
          L_position.z2 - L_position.z1).length(),
        judge: ' '
      };

      const arrowSize: number = 0.3 * maxLength; // 基準サイズ
      this.addMemberLoad(load, Data, L_position, localAxis, arrowSize);
    }

  }

  private addMemberLoad(load: any, Data: any, L_position: any, localAxis: any, arrowSize: number): void {

    const groupe = new THREE.Group();  // 親の実態のない架空のジオメトリ

    const arrow = { size: arrowSize, direction: 'z', color: 0x000000 };
    let arrowlist1: any = [];
    let arrowlist2: any = [];

    switch (load.mark) {

      case 1: // markが1のときのx, y, z, rの分岐

        const pos = [];
        let myLocalAxis = localAxis[load.direction];
        arrow.direction = load.direction;
        arrow.color = { x: 0xff0000, y: 0x00ff00, z: 0x0000ff }[load.direction];

        if (Data.P1 !== 0) {
          Data.judge = '1';
          const p = {x: L_position.x1, y: L_position.y1, z: L_position.z1};
          arrowlist1 = this.CreateArrow(arrow,
                                        p,
                                        localAxis,
                                        Data.P1,
                                        Data.p_one);
          pos.push(p);
          // マイナスあんら重なりを判定する軸を反転する
          if ( Math.sign(Data.P1) < 0) {
            myLocalAxis = {
              x: -localAxis[load.direction].x,
              y: -localAxis[load.direction].y,
              z: -localAxis[load.direction].z
            };
          }
        }

        if ( Data.P1 !== 0 && Data.P2 !== 0 && Math.sign(Data.P1) !== Math.sign(Data.P2)) {
          // P1 と P2 の符号が逆だった場合 P2を別の荷重として扱う（重ならないようにずらす方向が違うため）
          const tmp: number = Data.P1;
          Data.P1 = 0;
          this.addMemberLoad(load, Data, L_position, localAxis, arrowSize)
          Data.P1 = tmp;

        } else if (Data.P2 !== 0) {
          Data.judge = '2';
          const p = {x: L_position.x2, y: L_position.y2, z: L_position.z2};
          arrowlist2 = this.CreateArrow(arrow,
                                        p,
                                        localAxis,
                                        Data.P2,
                                        Data.p_two);
          pos.push(p);
          // マイナスあんら重なりを判定する軸を反転する
          if ( Math.sign(Data.P2) < 0) {
            myLocalAxis = {
              x: -localAxis[load.direction].x,
              y: -localAxis[load.direction].y,
              z: -localAxis[load.direction].z
            };
          }
        }

        groupe['localAxis'] = myLocalAxis; // 荷重の方向を示すベクトル
        groupe['check_box'] = { m: Data.m, direction: 'p' + load.direction, pos }; // 荷重の重なりを回避するためのプロパティ

        for (const a of arrowlist1) {
          groupe.add(a);
        }
        for (const a of arrowlist2) {
          groupe.add(a);
        }
        break;

      case 11: // markが11のときのx, y, z, rの分岐

        arrow.size = arrow.size / 2.5;
        arrow.direction = load.direction;
        arrow.color = { x: 0xff0000, y: 0x00ff00, z: 0x0000ff }[load.direction];

        const mpos = [];

        if (Data.P1 !== 0) {
          Data.judge = '1';
          arrowlist1 = this.CreateArrow_M(arrow, L_position, localAxis, Data);
          mpos.push({ x: L_position.x1, y: L_position.y1, z: L_position.z1 });
        }

        if (Data.P2 !== 0) {
          Data.judge = '2';
          arrowlist2 = this.CreateArrow_M(arrow, L_position, localAxis, Data);
          mpos.push({ x: L_position.x2, y: L_position.y2, z: L_position.z2 });
        }

        groupe['localAxis'] = { // 荷重の方向を示すベクトル
          x: localAxis.y.x + localAxis.z.x,
          y: localAxis.y.y + localAxis.z.y,
          z: localAxis.y.z + localAxis.z.z
        };
        groupe['check_box'] = { m: Data.m, direction: 'm' + load.direction, pos: mpos }; // 荷重の重なりを回避するためのプロパティ

        for (const a of arrowlist1) {
          groupe.add(a);
        }
        for (const a of arrowlist2) {
          groupe.add(a);
        }
        break;

      case 2: // markが2のときのx, y, z, rの分岐

        groupe['check_box'] = { m: Data.m, direction: 'w' + load.direction, area: L_position };  // 荷重の重なりを回避するためのプロパティ
        arrow.direction = load.direction;

        if (load.direction === 'x') {
          arrow.color = 0xff0000;
          arrowlist1 = this.CreateArrow_X(arrow, L_position, localAxis);
          groupe['localAxis'] = { // 荷重の方向を示すベクトル
            x: localAxis.y.x + localAxis.z.x,
            y: localAxis.y.y + localAxis.z.y,
            z: localAxis.y.z + localAxis.z.z
          };
          groupe.name = 'qx'; // この名前は memberLoadResize() で使っている
        } else if (load.direction === 'y') {
          load.len_L = Data.len_L;
          arrowlist1 = this.CreateArrow_Y(arrow, L_position, localAxis, Data);
          if (load.P1 <= 0 && load.P2 <= 0) { 
            groupe['localAxis'] = {
              x: -1 * localAxis.y.x,
              y: -1 * localAxis.y.y,
              z: -1 * localAxis.y.z
            };
          } else {
            groupe['localAxis'] = localAxis.y; // 荷重の方向を示すベクトル
          }

        } else if (load.direction === 'z') {
          load.len_L = Data.len_L;
          arrowlist1 = this.CreateArrow_Z(arrow, L_position, localAxis, Data);
          if (load.P1 <= 0 && load.P2 <= 0) {
            groupe['localAxis'] = {
              x: -1 * localAxis.z.x,
              y: -1 * localAxis.z.y,
              z: -1 * localAxis.z.z
            };
          } else {
            groupe['localAxis'] = localAxis.z; // 荷重の方向を示すベクトル
          }

        } else if (load.direction === 'r') {
          arrow.size = arrow.size / 2.5;
          arrow.color = 0xff00ff;
          arrowlist1 = this.CreateArrow_R(arrow, L_position, localAxis, Data);
          groupe['localAxis'] = { // 荷重の方向を示すベクトル
            x: localAxis.y.x + localAxis.z.x,
            y: localAxis.y.y + localAxis.z.y,
            z: localAxis.y.z + localAxis.z.z
          };
          groupe['check_box']['p1'] = Data.p_one;
          groupe['check_box']['p2'] = Data.p_two;

        } else {
          return;
        }

        for (const a of arrowlist1) {
          groupe.add(a);
        }

        break;

    }

    // meshを出力
    this.memberLoadList.push(groupe);
    this.scene.add(groupe);
  }


  // 矢印（集中荷重）を描く
  public CreateArrow(arrow, pos: any, localAxis, P: number, p_: number) {
    const arrowlist = [];
    const group = new THREE.Group();

    let geometry = new THREE.BufferGeometry();

    // 矢の棒を描く
    /*geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    if (P > 0) {
      geometry.vertices.push(new THREE.Vector3(0, 0, (-1) * p_));
    } else if (P < 0) {
      geometry.vertices.push(new THREE.Vector3(0, 0, p_));
    } else {
      return;
    }*/
    let vertices = new Float32Array( [ ] );
    if (P > 0){
      vertices = new Float32Array( [
        0, 0, 0,
        0, 0, (-1) * p_,
      ] );
    } else if(P < 0){
      vertices = new Float32Array( [
        0, 0, 0,
        0, 0, p_,
      ] );
    } else {
      return;
    };
    const line = new THREE.LineBasicMaterial({ color: arrow.color });
    const mesh = new THREE.Line(geometry, line);
    group.add(mesh);

    // geometryの初期化
    geometry = new THREE.BufferGeometry();

    // 矢の先を描く
    const cone_scale: number = arrow.size;
    const cone_radius: number = 0.1 * cone_scale;
    const cone_height: number = 1 * cone_scale;
    //geometry = new THREE.ConeGeometry(cone_radius, cone_height, 3, 1, true);
    geometry = new THREE.ConeBufferGeometry(cone_radius, cone_height, 3, 1, true);
    const material = new THREE.MeshBasicMaterial({ color: arrow.color });
    const cone = new THREE.Mesh(geometry, material);
    if (P > 0) {
      cone.position.set(0, 0, -cone_scale / 2);
      cone.rotation.x = Math.PI / 2;
    } else if (P < 0) {
      cone.position.set(0, 0, cone_scale / 2);
      cone.rotation.x = -Math.PI / 2;
    }
    group.add(cone);

    // groupの操作
    switch (arrow.direction) {
      case ('x'):
        group.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
        group.position.set(
          pos.x - localAxis.y.x * 0.1,
          pos.y - localAxis.y.y * 0.1,
          pos.z);
        break;
      case ('y'):
        group.lookAt(localAxis.y.x, localAxis.y.y, localAxis.y.z);
        group.position.set(pos.x, pos.y, pos.z);
        break;
      case ('z'):
        group.lookAt(localAxis.z.x, localAxis.z.y, localAxis.z.z);
        group.position.set(pos.x, pos.y, pos.z);
        break;
    }
    arrowlist.push(group);

    return arrowlist;

  }

  // 矢印（集中曲げモーメント）を描く
  public CreateArrow_M(arrow, L_position, localAxis, Data) {
    const arrowlist = [];
    const groupM = new THREE.Group();

    // モーメントの線を描く
    const curve = new THREE.EllipseCurve(
      0, 0,                               // ax,          aY
      arrow.size, arrow.size,             // xRadius,     yRadius
      -1 / 3 * Math.PI, 4 / 3 * Math.PI,  // aStartAngle, aEndAngle
      false, 0                            // aClockwise, aRotation
    );
    const points = curve.getPoints(50);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ color: arrow.color, linewidth: 5 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    groupM.add(line);

    // 矢印の先を描く
    const cone_scale: number = arrow.size;
    const cone_radius: number = 0.1 * cone_scale;
    const cone_height: number = 1 * cone_scale;
    //const arrowGeometry = new THREE.ConeGeometry(cone_radius, cone_height, 3, 1, true);
    const arrowGeometry = new THREE.ConeBufferGeometry(cone_radius, cone_height, 3, 1, true);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: arrow.color });
    const cone = new THREE.Mesh(arrowGeometry, arrowMaterial);

    if (Data.judge === '1') {
      if (Data.P1 < 0) {
        cone.rotation.z = 2 / 3 * Math.PI;
        cone.position.set(1 / 2 * arrow.size, -(3 ** (1 / 2) / 2) * arrow.size, 0);
      } else if (Data.P1 > 0) {
        cone.rotation.z = -2 / 3 * Math.PI;
        cone.position.set(-1 / 2 * arrow.size, -(3 ** (1 / 2) / 2) * arrow.size, 0);
      }
    } else if (Data.judge === '2') {
      if (Data.P2 < 0) {
        cone.rotation.z = 2 / 3 * Math.PI;
        cone.position.set(1 / 2 * arrow.size, -(3 ** (1 / 2) / 2) * arrow.size, 0);
      } else if (Data.P2 > 0) {
        cone.rotation.z = -2 / 3 * Math.PI;
        cone.position.set(-1 / 2 * arrow.size, -(3 ** (1 / 2) / 2) * arrow.size, 0);
      }
    }

    groupM.add(cone);

    // groupの操作
    switch (arrow.direction) {
      case ('x'):
        groupM.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
        break;
      case ('y'):
        groupM.lookAt(localAxis.y.x, localAxis.y.y, localAxis.y.z);
        break;
      case ('z'):
        groupM.lookAt(localAxis.z.x, localAxis.z.y, localAxis.z.z);
        break;
    }
    if (Data.judge === '1') {
      groupM.position.set(L_position.x1, L_position.y1, L_position.z1);
    } else if (Data.judge === '2') {
      groupM.position.set(L_position.x2, L_position.y2, L_position.z2);
    }
    arrowlist.push(groupM)
    return arrowlist
  }

  // 矢印（分布荷重X）を描く BufferGeometryに未変更
  public CreateArrow_X(arrow, L_position, localAxis) {
    const groupX = new THREE.Group();

    let geometry = new THREE.Geometry();
    //let geometry = new THREE.BufferGeometry();
    const arrowlist = [];
    const offset = 0.1;
    L_position.x1 -= offset * localAxis.y.x;
    L_position.y1 -= offset * localAxis.y.y;
    L_position.x2 -= offset * localAxis.y.x;
    L_position.y2 -= offset * localAxis.y.y;
    const len_L: number = new THREE.Vector3(
      L_position.x2 - L_position.x1,
      L_position.y2 - L_position.y1,
      L_position.z2 - L_position.z1).length();
    // 矢の先を描く
    geometry.vertices.push(new THREE.Vector3(arrow.size * 0.3, 0, len_L - arrow.size * 0.6));
    geometry.vertices.push(new THREE.Vector3(0, 0, len_L));
    geometry.vertices.push(new THREE.Vector3(arrow.size * -0.3, 0, len_L - arrow.size * 0.6));
    //let vertices = new Float32Array( [ ] );
    /*vertices = new Float32Array( [
      arrow.size * 0.3,  0, len_L - arrow.size * 0.6,
      0,                 0, len_L,
      arrow.size * -0.3, 0, len_L - arrow.size * 0.6
    ] );*/
    let line = new THREE.LineBasicMaterial({ color: arrow.color });
    //let material = new THREE.LineBasicMaterial({ color: arrow.color });
    //geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3) );
    let mesh = new THREE.Line(geometry, line);
    groupX.add(mesh);
    //groupX.add(new THREE.Mesh(geometry, material));

    // geometryの初期化
    geometry = new THREE.Geometry();
    //geometry = new THREE.BufferGeometry();

    // 矢印の棒
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, len_L));
    /*vertices = new Float32Array( [
      0, 0, 0,
      0, 0, len_L,
    ] );*/
    //geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3) );
    line = new THREE.LineDashedMaterial({ color: arrow.color, dashSize: 0.1, gapSize: 0.1 });
    //material = new THREE.LineDashedMaterial({ color: arrow.color, dashSize: 0.1, gapSize: 0.1 });
    mesh = new THREE.Line(geometry, line);
    //const mesh = new THREE.Line(geometry, material);
    mesh.computeLineDistances();
    groupX.add(mesh);

    groupX.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
    groupX.position.set(L_position.x1, L_position.y1, L_position.z1);
    arrowlist.push(groupX);
    return arrowlist;
  }

  // 矢印（分布荷重Y）を描く
  public CreateArrow_Y(arrow, L_position, localAxis, Data): any[] {
    const arrowlist = [];
    const groupY = new THREE.Group();

    //let geometry = new THREE.Geometry(); // geometryの初期化
    let geometry1 = new THREE.BufferGeometry(); // geometry1の初期化
    let geometry2 = new THREE.BufferGeometry(); // geometry2の初期化
    const offset: number = Math.max(-Data.p_one, -Data.p_two, 0);
    const d1: number = offset + Data.p_one * Math.sign(Data.P1) * (-1);
    const d2: number = offset + Data.p_two * Math.sign(Data.P2) * (-1);

    // 分布荷重をまとめる棒

    const i = new THREE.Vector3(d1, 0, 0);
    const j = new THREE.Vector3(d2, 0, Data.len_L);

    const v = new THREE.Vector3(j.x - i.x, j.y - i.y, j.z - i.z);
    const len: number = v.length();

    const x: number = (i.x + j.x) / 2;
    const y: number = (i.y + j.y) / 2;
    const z: number = (i.z + j.z) / 2;
    let thickness: number = this.baseScale() / 2000;
    if (thickness <= 0.00005){
      thickness = 0.0001;
    } //thickness <= 0.00005だと表示不可
    //const cGeometry = new THREE.CylinderGeometry(thickness, thickness, len, 12);
    const cGeometry = new THREE.CylinderBufferGeometry(thickness, thickness, len, 12);
    const cMesh = new THREE.Mesh(cGeometry,
      //new THREE.MeshLambertMaterial({ color: arrow.color }));
      new THREE.MeshBasicMaterial({ color: arrow.color }));
    cMesh.rotation.z = Math.acos(v.y / len);
    cMesh.rotation.y = 0.5 * Math.PI + Math.atan2(v.x, v.z);
    cMesh.position.set(x, y, z);
    groupY.add(cMesh);


    // 荷重の面Meshを作る
    //geometry = new THREE.Geometry(); // geometryの初期化
    //geometry = new THREE.BufferGeometry(); // geometryの初期化
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x00cc00,
      opacity: 0.3
      //opacity: 0.5
    });
    /*geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(d1, 0, 0));
    geometry.vertices.push(new THREE.Vector3(d2, 0, Data.len_L));
    geometry.vertices.push(new THREE.Vector3(0, 0, Data.len_L));
    if (Data.P1 * Data.P2 >= 0) {
      geometry.faces.push(new THREE.Face3(0, 1, 2));
      geometry.faces.push(new THREE.Face3(0, 2, 3));
    } else if (Data.P1 * Data.P2 < 0) {
      geometry.vertices.push(new THREE.Vector3(0, 0, (Math.abs(Data.P1) / (Math.abs(Data.P1) + Math.abs(Data.P2))) * Data.len_L));
      geometry.faces.push(new THREE.Face3(0, 1, 4));
      geometry.faces.push(new THREE.Face3(2, 3, 4));
    }*/
    let vertices1 = new Float32Array( [ ] );
    let vertices2 = new Float32Array( [ ] );
    if (Data.P1 * Data.P2 >= 0){
      vertices1 = new Float32Array( [
        0,  0, 0,
        d1, 0, 0,
        d2, 0, Data.len_L
      ] );
      vertices2 = new Float32Array( [
        0,  0, 0,
        d2, 0, Data.len_L,
        0,  0, Data.len_L
      ] );
    } else if (Data.P1 * Data.P2 < 0){
      vertices1 = new Float32Array( [
        0,  0, 0,
        d1, 0, 0,
        0,  0, (Math.abs(Data.P1) / (Math.abs(Data.P1) + Math.abs(Data.P2))) * Data.len_L
      ] );
      vertices2 = new Float32Array( [
        d2, 0, Data.len_L,
        0,  0, Data.len_L,
        0,  0, (Math.abs(Data.P1) / (Math.abs(Data.P1) + Math.abs(Data.P2))) * Data.len_L
      ] );
    };
    //geometry.computeFaceNormals();
    //geometry.computeVertexNormals();
    //groupY.add(new THREE.Mesh(geometry, material));
    geometry1.setAttribute( 'position', new THREE.BufferAttribute( vertices1, 3) );
    groupY.add(new THREE.Mesh(geometry1, material));
    geometry2.setAttribute( 'position', new THREE.BufferAttribute( vertices2, 3) );
    groupY.add(new THREE.Mesh(geometry2, material));

    // groupの操作
    groupY.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
    arrowlist.push(groupY);
    return arrowlist;
  }

  // 矢印（分布荷重Z）を描く
  public CreateArrow_Z(arrow, L_position, localAxis, Data): any[] {
    // 正負が逆だったので応急処置
    Data.P1 = Data.P1 * (-1);
    Data.P2 = Data.P2 * (-1);
    const arrowlist = [];
    const groupZ = new THREE.Group();

    //let geometry = new THREE.Geometry();
    let geometry1 = new THREE.BufferGeometry(); // geometry1の初期化
    let geometry2 = new THREE.BufferGeometry(); // geometry2の初期化
    const len_Lx = L_position.x2 - L_position.x1;
    const len_Ly = L_position.y2 - L_position.y1;
    const len_Lz = L_position.z2 - L_position.z1;
    const len_L: number = new THREE.Vector3(len_Lx, len_Ly, len_Lz).length();
    const offset: number = Math.max(-Data.p_one, -Data.p_two, 0);
    const d1: number = offset + Data.p_one * Math.sign(Data.P1);
    const d2: number = offset + Data.p_two * Math.sign(Data.P2);

    // 分布荷重をまとめる棒
    const i = new THREE.Vector3(0, 0, d1);
    const j = new THREE.Vector3(0, len_L, d2);

    const v = new THREE.Vector3(j.x - i.x, j.y - i.y, j.z - i.z);
    const len: number = v.length();

    const x: number = (i.x + j.x) / 2;
    const y: number = (i.y + j.y) / 2;
    const z: number = (i.z + j.z) / 2;
    let thickness: number = this.baseScale() / 2000;
    if (thickness <= 0.00005){
      thickness = 0.0001;
    } //thickness <= 0.00005だと表示不可
    //const cGeometry = new THREE.CylinderGeometry(thickness, thickness, len, 12);
    const cGeometry = new THREE.CylinderBufferGeometry(thickness, thickness, len, 12);
    const cMesh = new THREE.Mesh(cGeometry,
      //new THREE.MeshLambertMaterial({ color: arrow.color }));
      new THREE.MeshBasicMaterial({ color: arrow.color }));
    cMesh.rotation.z = Math.acos(v.y / len);
    cMesh.rotation.y = 0.5 * Math.PI + Math.atan2(v.x, v.z);
    cMesh.position.set(x, y, z);
    groupZ.add(cMesh);


    // 荷重の面Meshを作る
    //geometry = new THREE.Geometry(); // geometryの初期化
    //geometry = new THREE.BufferGeometry(); // geometryの初期化
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x00cc00,
      //opacity: 0.3
      opacity: 0.5
    });
    /*geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, d1));
    geometry.vertices.push(new THREE.Vector3(0, len_L, d2));
    geometry.vertices.push(new THREE.Vector3(0, len_L, 0));
    if (Data.P1 * Data.P2 >= 0) {
      var face1 = new THREE.Face3(0, 1, 2);
      var face2 = new THREE.Face3(0, 2, 3);
    } else if (Data.P1 * Data.P2 < 0) {
      geometry.vertices.push(new THREE.Vector3(0, (Math.abs(Data.P1) / (Math.abs(Data.P1) + Math.abs(Data.P2))) * len_L, 0));
      var face1 = new THREE.Face3(0, 1, 4);
      var face2 = new THREE.Face3(2, 3, 4);
    }*/
    let vertice1 = new Float32Array( [ ] );
    let vertice2 = new Float32Array( [ ] );
    if (Data.P1 * Data.P2 >= 0){
      vertice1 = new Float32Array( [
        0,     0,  0,
        0,     0, d1,
        0, len_L, d2
      ] );
      vertice2 = new Float32Array( [
        0,     0,  0,
        0, len_L, d2,
        0, len_L,  0
      ] );
    } else if (Data.P1 * Data.P2 < 0){
      const zero = (Math.abs(Data.P1) / (Math.abs(Data.P1) + Math.abs(Data.P2))) * Data.len_L;
      vertice1 = new Float32Array( [
        0,    0,  0,
        0,    0, d1,
        0, zero,  0
      ] );
      vertice2 = new Float32Array( [
        0, len_L, d2, 
        0, len_L,  0,
        0,  zero,  0
      ] );
    };
    //geometry.faces.push(face1);
    //geometry.faces.push(face2);
    //geometry.computeFaceNormals();
    //geometry.computeVertexNormals();
    //let mesh2 = new THREE.Mesh(geometry, material);
    //groupZ.add(mesh2);
    geometry1.setAttribute( 'position', new THREE.BufferAttribute( vertice1, 3) );
    groupZ.add(new THREE.Mesh(geometry1, material));
    geometry2.setAttribute( 'position', new THREE.BufferAttribute( vertice2, 3) );
    groupZ.add(new THREE.Mesh(geometry2, material));

    //groupの操作
    if (len_Lz !== 0) {
      groupZ.lookAt(localAxis.z.x, localAxis.z.y, localAxis.z.z);
    } else if (len_Lz === 0) {
      groupZ.rotation.z = Math.PI * 1.5 + Math.atan2(len_Ly, len_Lx);
    }
    arrowlist.push(groupZ);
    return arrowlist
  }

  // 部材ねじりモーメント(分布モーメント)荷重
  public CreateArrow_R(arrow, L_position, localAxis, Data) {

    Data.p_one = Data.p_one * 0.2;
    Data.p_two = Data.p_two * 0.2;
    const arrowlist = [];
    const groupR = new THREE.Group();

    //const interval = 0.7;
    const len_Lx = L_position.x2 - L_position.x1;
    const len_Ly = L_position.y2 - L_position.y1;
    const len_Lz = L_position.z2 - L_position.z1;
    const len_L: number = new THREE.Vector3(len_Lx, len_Ly, len_Lz).length();
    let untilZeo = Math.abs(Data.P1) / (Math.abs(Data.P1) + Math.abs(Data.P2)) * len_L;
    //const count_L = Math.floor(len_L / interval);
    let x = (L_position.x2 + L_position.x1) / 2;
    let y = (L_position.y2 + L_position.y1) / 2;
    let z = (L_position.z2 + L_position.z1) / 2;
    //const difference_P = Data.p_two * Math.sign(Data.P2) - Data.p_one * Math.sign(Data.P1);

    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: arrow.color,
      opacity: 0.3
    });
    if (Data.P1 * Data.P2 >= 0) {
      //const geometry = new THREE.CylinderGeometry(
      const geometry = new THREE.CylinderBufferGeometry(
        Data.p_one * Math.sign(Data.P1),  // radiusTop
        Data.p_two * Math.sign(Data.P2),  // radiusBottom
        len_L, 12,                        // height, radialSegments
        1, true,                          // heightSegments, openEnded
        3, 3 / 2 * Math.PI                // thetaStart, thetaLength
      );
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      groupR.add(mesh);

    } else if (Data.P1 * Data.P2 < 0) {

      // untilZeo = Math.abs(Data.P1) / (Math.abs(Data.P1) + Math.abs(Data.P2)) * len_L;
      // i端側のコーン
      //let geometry = new THREE.CylinderGeometry(
      let geometry = new THREE.CylinderBufferGeometry(
        Data.p_one * Math.sign(Data.P1), 0, // radiusTop, radiusBottom
        untilZeo, 12,                  // height, radialSegments
        1, true,                // heightSegments, openEnded
        3, 3 / 2 * Math.PI        // thetaStart, thetaLength
      );
      let mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, 0, -(len_L - untilZeo) / 2);
      groupR.add(mesh);
      // j端側のコーン
      //geometry = new THREE.CylinderGeometry(
      geometry = new THREE.CylinderBufferGeometry(
        0, Data.p_two * Math.sign(Data.P2), // radiusTop, radiusBottom
        len_L - untilZeo, 12,          // height, radialSegments
        1, true,                // heightSegments, openEnded
        3, 3 / 2 * Math.PI        // thetaStart, thetaLength
      );
      mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, 0, untilZeo / 2);
      groupR.add(mesh);
    }

    /*for (let i = 0; i <= count_L; i++) {
      // lineの制御
      x = 0;
      y = 0;
      z = len_L * i / count_L - len_L / 2;
      const CorrectionAngle = - Math.PI * 13 / 24;
      const curve = new THREE.EllipseCurve(
        0, 0,                 // ax,          aY
        Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L,   // xRadius,
        Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L,   // yRadius
        CorrectionAngle + 0 * Math.PI, CorrectionAngle + 3 / 2 * Math.PI, // aStartAngle, aEndAngle
        false, 0                  // aClockwise, aRotation
      );
      const points = curve.getPoints(50);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: arrow.color, linewidth: 5 });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.rotation.y = Math.PI;
      line.position.set(x, y, z);

      if (Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L !== 0) {
        groupR.add(line);
      }
      // コーンの制御
      const cone_radius: number = 0.1 * arrow.size;
      const cone_height: number = 1 * arrow.size;
      const arrowGeometry = new THREE.ConeGeometry(cone_radius, cone_height, 3, 1, true);
      const arrowMaterial = new THREE.MeshBasicMaterial({ color: arrow.color });
      const cone = new THREE.Mesh(arrowGeometry, arrowMaterial);

      if (Data.P1 * Data.P2 >= 0) {
        if (Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L > 0) {  //pが正の方
          cone.rotation.z = -Math.PI / 2;
          y = -Data.p_one * Math.sign(Data.P1) - difference_P * i / count_L;
          cone.position.set(x, y, z);
        } else if (Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L < 0) {  //pが負の方
          x = Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L;
          cone.position.set(x, y, z);
        }
      } else if (Data.P1 * Data.P2 < 0) {
        if (Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L > 0) {  //pが負の方
          cone.rotation.z = -Math.PI / 2;
          y = -Data.p_one * Math.sign(Data.P1) - difference_P * i / count_L;
          cone.position.set(x, y, z);
        } else if (Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L < 0) {  //pが正の方
          x = Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L;
          cone.position.set(x, y, z);
        }
      }

      if (Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L !== 0) {
        groupR.add(cone);
      }
    }*/
    x = (L_position.x2 + L_position.x1) / 2;
    y = (L_position.y2 + L_position.y1) / 2;
    z = (L_position.z2 + L_position.z1) / 2;
    groupR.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
    groupR.position.set(x, y, z);

    arrowlist.push(groupR);
    return arrowlist;
  }

  // データをクリアする
  public ClearData(): void {
    this.ClearMemberLoad();
    this.ClearNodeLoad();
    this.guiDisable();
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

  // スケールを反映する
  private onResize(): void {
    this.pointLoadResize();
    this.memberLoadResize();
  }

  private pointLoadResize(): void {
    // 節点荷重のスケールを変更する
    for (const item of this.pointLoadList) {
      switch (item.name) {
        case 'px':
          item.scale.set(this.pointLoadScale, 1, 1);
          break;
        case 'py':
          item.scale.set(1, this.pointLoadScale, 1);
          break;
        case 'pz':
          item.scale.set(1, 1, this.pointLoadScale);
          break;
        default:
          if ('baseScale' in item) {
            const scale: number = item.baseScale * this.pointLoadScale;
            item.scale.set(scale, scale, scale);
          }
          break;
      }
    }
  }

  private memberLoadResize(): void {

    // 要素荷重のスケールを変更する
    for (const item of this.memberLoadList) {
      if( item.name === 'qx'){
        continue;
      }
      if ('localAxis' in item) {
        const scaleX: number = 1 + Math.abs(item.localAxis.x) * (this.memberLoadScale - 1);
        const scaleY: number = 1 + Math.abs(item.localAxis.y) * (this.memberLoadScale - 1);
        const scaleZ: number = 1 + Math.abs(item.localAxis.z) * (this.memberLoadScale - 1);
        item.scale.set(scaleX, scaleY, scaleZ);
      }
    }

    this.scene.render(); // スケールの変更が終わった時点で、一旦更新する（スケールの変更結果を当り判定に反映するため）


    // -----------------------------------------------------------------------------------------------------------------------
    // 要素荷重が重ならないようにずらす -----------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    const check_box = {};   // ここに登録されている変数に当たってはいけない
    const target_box = {};   // 当たらないように避けるオブジェクト

    // 当り判定に用いるオブジェクトと当たらないように避けるオブジェクトを分ける -----------------------------------------------------
    for (const item of this.memberLoadList) {
      if (!('check_box' in item)) {
        continue;
      }

      const cb = item.check_box;  // 荷重の重なりを判定するためのプロパティ
      const m: string = cb.m;     // 部材番号

      if (cb.direction === 'wr' || cb.direction === 'wx') {
        // markが2 の 分布回転モーメント荷重, 軸方向荷重 は座標を登録するだけ
        if (!(m in check_box)) {
          check_box[m] = { check_point: [], check_load: [] };
        }
        check_box[m].check_point.push(new THREE.Vector3(cb.area.x1, cb.area.y1, cb.area.z1));
        check_box[m].check_point.push(new THREE.Vector3(cb.area.x2, cb.area.y2, cb.area.z2));
        check_box[m].check_load.push(item);

      } else if (cb.direction.indexOf('m') >= 0) {
        // markが11 の 集中回転モーメント荷重 は座標を登録するだけ
        for (const p of cb.pos) {
          if (!(m in check_box)) {
            check_box[m] = { check_point: [], check_load: [] };
          }
          check_box[m].check_point.push(new THREE.Vector3(p.x, p.y, p.z));
          check_box[m].check_load.push(item);
        }

      } else {
        // 当り判定をする荷重を登録
        if (!(m in target_box)) {
          target_box[m] = new Array();
        }
        target_box[m].push(item);
      }
    }



    // 当たらないように避けるオブジェクトの位置を決める --------------------------------------------------------------------
    for (const m of Object.keys(target_box)) {
      if (!(m in check_box)) {
        check_box[m] = { check_point: [], check_load: [] };
      }
      // 部材 m に載荷されている荷重について当り判定を行う
      const targets: any[] = target_box[m];
      for (const item of targets) {

        if (item.check_box.direction.indexOf('p') >= 0) {
          // markが1の集中荷重
          // 当たっているオブジェクトの中で最も遠い距離を算定する
          const direction = new THREE.Vector3(-item.localAxis.x, -item.localAxis.y, -item.localAxis.z);
          let distance: number = 0;
          for (const pos of item.check_box.pos) {
            const origin = new THREE.Vector3(pos.x, pos.y, pos.z);
            const raycaster = new THREE.Raycaster(origin, direction);
            for (const cb of check_box[m].check_load) {
              const intersects = this.intersectObjects(cb, raycaster);
              if (cb.check_box.direction === 'wr' && intersects.length > 0) {
                // ねじりモーメント荷重との交差判定だけ特別な処理をする
                const p_one: number = Math.abs(cb.check_box.p1) * this.memberLoadScale;
                const p_two: number = Math.abs(cb.check_box.p2) * this.memberLoadScale;
                distance = Math.max(distance, p_one, p_two);
              } else {
                for (const ins of intersects) {
                  distance = Math.max(distance, ins.distance);
                }
              }
            }
          }
          // 重ならない位置に修正する
          const posX: number = direction.x * distance;
          const posY: number = direction.y * distance;
          const posZ: number = direction.z * distance;
          item.position.set(posX, posY, posZ);
          this.scene.render();
          // 当たってはいけないオブジェクトとして登録
          for (const obj of item.children) {
            check_box[m].check_point.push(obj.position);
          }
          check_box[m].check_load.push(item);

        } else {
          // markが2のy, z の分布荷重荷重
          // 当たっているオブジェクトの中で最も遠い距離を算定する
          const direction = new THREE.Vector3(-item.localAxis.x, -item.localAxis.y, -item.localAxis.z);
          const p1 = new THREE.Vector3(item.check_box.area.x1, item.check_box.area.y1, item.check_box.area.z1);
          const p2 = new THREE.Vector3(item.check_box.area.x2, item.check_box.area.y2, item.check_box.area.z2);
          const l0 = p1.distanceTo(p2);
          check_box[m].check_point.push(p1);
          check_box[m].check_point.push(p2);

          // 登録したすべてのポイントに対して距離を調べる
          let distance: number = 0;
          for (const pos of check_box[m].check_point) {
            const l1 = p1.distanceTo(pos);
            const l2 = p2.distanceTo(pos);
            if (l1 <= l0 && l2 <= l0) {
              // const origin  = new THREE.Vector3(pos.x, pos.y, pos.z);
              const raycaster = new THREE.Raycaster(pos, direction);
              // 登録したすべての荷重に対して距離を調べる
              for (const cb of check_box[m].check_load) {
                const intersects = this.intersectObjects(cb, raycaster);
                if (cb.check_box.direction === 'wr' && intersects.length > 0) {
                  // ねじりモーメント荷重との交差判定だけ特別な処理をする
                  const p_one: number = Math.abs(cb.check_box.p1) * this.memberLoadScale;
                  const p_two: number = Math.abs(cb.check_box.p2) * this.memberLoadScale;
                  distance = Math.max(distance, p_one, p_two);
                } else {
                  for (const ins of intersects) {
                    distance = Math.max(distance, ins.distance);
                  }
                }
              }
            }
          }
          // 位置を重ならない位置に修正する
          const posX: number = p1.x + direction.x * distance;
          const posY: number = p1.y + direction.y * distance;
          const posZ: number = p1.z + direction.z * distance;
          item.position.set(posX, posY, posZ);
          this.scene.render();
          // 当たってはいけないオブジェクトとして登録
          check_box[m].check_load.push(item);

        }

      }
    }
  }

  private intersectObjects(item: THREE.Object3D, raycaster: THREE.Raycaster): THREE.Intersection[] {

    const result: THREE.Intersection[] = new Array();

    if ('children' in item) {
      for (const item2 of item.children) {
        for (const a of this.intersectObjects(item2, raycaster)) {
          result.push(a);
        }
      }
    }

    for (const a of raycaster.intersectObject(item)) {
      result.push(a);
    }

    return result;

  }

}

