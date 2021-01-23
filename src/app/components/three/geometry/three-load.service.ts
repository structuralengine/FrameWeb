import { Injectable } from "@angular/core";
import { SceneService } from "../scene.service";
import { InputNodesService } from "../../input/input-nodes/input-nodes.service";
import { InputMembersService } from "../../input/input-members/input-members.service";
import { InputLoadService } from "../../input/input-load/input-load.service";
import { ThreeNodesService } from "./three-nodes.service";

import * as THREE from "three";
import { ThreeMembersService } from "./three-members.service";

import { ThreeLoadText }  from "./three-load/three-load-text";
import { ThreeLoadDimension } from "./three-load/three-load-dimension";
import { ThreeLoadPoint } from "./three-load/three-load-point";
import { ThreeLoadDistribute } from "./three-load/three-load-distribute";
import { ThreeLoadAxial } from "./three-load/three-load-axial";
import { ThreeLoadTorsion } from "./three-load/three-load-torsion";
import { ThreeLoadMoment } from "./three-load/three-load-moment";
import { ThreeLoadTemperature } from "./three-load/three-load-temperature";

@Injectable({
  providedIn: "root",
})
export class ThreeLoadService {

  private isVisible = { object: false, gui: false };

  // 節点荷重を格納する変数
  private pointLoadList: any;
  /*key: "節点番号",
  value: {
    tx: [], // 軸方向荷重のリスト
    ty: [], // y軸方向荷重のリスト
    tz: [], // z軸方向荷重のリスト
    rx: []  // x軸周りのねじり荷重のリスト
    ry: []  // y軸周りのねじり荷重のリスト
    rz: []  // z軸周りのねじり荷重のリスト
  }*/

  // 要素荷重を格納する変数
  private memberLoadList: any;
  /*key: "要素番号",
  value: {
    localAxcis: 部材のローカル座標
    wx: [], // 軸方向荷重のリスト
    wy: [], // y軸方向荷重のリスト（分布荷重と集中荷重）
    wz: [], // z軸方向荷重のリスト
    wr: []  // ねじり方向荷重のリスト（分布ねじりと集中曲げ）
  }*/

  // 荷重のテンプレート
  private distributeLoad: ThreeLoadDistribute; // 分布荷重のテンプレート
  private axialLoad: ThreeLoadAxial; // 軸方向荷重のテンプレート
  private torsionLoad: ThreeLoadTorsion; // ねじり分布荷重のテンプレート
  private temperatureLoad: ThreeLoadTemperature; // 温度荷重のテンプレート
  private pointLoad: ThreeLoadPoint; // 節点荷重のテンプレート
  private momentLoad: ThreeLoadMoment; // 節点モーメントのテンプレート

  // 大きさを調整するためのスケール
  private LoadScale: number;
  private params: any;          // GUIの表示制御
  private gui: any;


  constructor(
    private scene: SceneService,
    private nodeThree: ThreeNodesService,
    private node: InputNodesService,
    private member: InputMembersService,
    private load: InputLoadService,
    private three_member: ThreeMembersService
  ) {
    // フォントをロード
    const loader = new THREE.FontLoader();
    loader.load("./assets/fonts/helvetiker_regular.typeface.json", (font) => {
      
      const text = new ThreeLoadText(font);
      const dim = new ThreeLoadDimension(text); //寸法戦を扱うモジュール

      // 荷重の雛形をあらかじめ生成する
      this.pointLoad = new ThreeLoadPoint(text);                    // 節点荷重のテンプレート
      this.momentLoad = new ThreeLoadMoment(text);                 // 節点モーメントのテンプレート
      this.distributeLoad = new ThreeLoadDistribute(text, dim);         // 分布荷重のテンプレート
      this.axialLoad = new ThreeLoadAxial(text);                   // 軸方向荷重のテンプレート
      this.torsionLoad = new ThreeLoadTorsion(text, dim, this.momentLoad);           // ねじり分布荷重のテンプレート
      this.temperatureLoad = new ThreeLoadTemperature(text, dim);  // 温度荷重のテンプレート
    });

    this.pointLoadList = {};
    this.memberLoadList = {};

    // gui
    this.LoadScale = 100;
    this.params = {
      LoadScale: this.LoadScale
    };
    this.gui = {};

    this.ClearData();
  }

  public visibleChange(flag: boolean, gui: boolean): void {
    console.log("three load!", "visible", "pass");

    // 非表示にする
    if (flag === false) {
      this.ClearData();
      this.guiDisable();
      this.isVisible.object = false;
      return;
    }

    // gui の表示を切り替える
    if (gui === true) {
      this.guiEnable();
    } else {
      this.guiDisable();
    }
    this.isVisible.gui = gui;

    // すでに表示されていたら変わらない
    if (this.isVisible.object === true) {
      return
    }

    // 表示する
    this.changeData(0);
    this.isVisible.object = true;

  }

  // guiを表示する
  private guiEnable(): void {
    console.log("three load!", "guiEnable");

    if (!('LoadScale' in this.gui)) {
      const gui_step: number = 1;
      this.gui['LoadScale'] = this.scene.gui.add(this.params, 'LoadScale', 0, 200).step(gui_step).onChange((value) => {
        this.LoadScale = value;
        this.onResize();
        this.scene.render();
      });
    }

  }

  // guiを非表示にする
  private guiDisable(): void {
    console.log("three load!", "guiDisable");
    for (const key of Object.keys(this.gui)) {
      this.scene.gui.remove(this.gui[key]);
    }
    this.gui = {};
  }

  private baseScale(): number {
    console.log("three load!", "baseScale");
    // 最も距離の近い2つの節点距離
    return this.nodeThree.baseScale * 10;
  }

  // #region 荷重の変更を反映する

  public changeData(index: number): void {
    console.log('three load!', 'changeData');

    // 一旦全部非表示 にする
    this.ClearData();

    // 格点データを入手
    const nodeData = this.node.getNodeJson(0);
    if (Object.keys(nodeData).length <= 0) {
      return; // 格点がなければ 以降の処理は行わない
    }

    const targetCase: string = index.toString();

    // 節点荷重データを入手
    const nodeLoadData = this.load.getNodeLoadJson(0, targetCase);
    if(targetCase in nodeLoadData) {
      this.createPointLoad(nodeLoadData[targetCase], nodeData);
      this.createMomentLoad(nodeLoadData[targetCase], nodeData);
    }

    // 要素データを入手
    const memberData = this.member.getMemberJson(0);
    if (Object.keys(memberData).length <= 0) {
      return; //要素がなければ 以降の処理は行わない
    }

    // 要素荷重データを入手
    const memberLoadData = this.load.getMemberLoadJson(0, targetCase);
    if (targetCase in memberLoadData) {
      this.createMemberLoad( memberLoadData[targetCase], nodeData, memberData);
    }

    // サイズや重なりを調整する
    this.onResize();

    // 表示フラグを ON にする
    this.isVisible.object = true;
  }

  // 節点荷重の矢印を描く
  private createPointLoad(targetNodeLoad: any, nodeData: object): void {
    if (targetNodeLoad === undefined) {
      return;
    }

    // スケールを決定する 最大の荷重を 1とする
    let pMax = 0; // 最も大きい集中荷重値
    for (const load of targetNodeLoad) {
      pMax = Math.max(
        pMax,
        Math.abs(load.tx),
        Math.abs(load.ty),
        Math.abs(load.tz)
      );
    }
    const maxLength = this.baseScale() * 2; // 最も大きい集中荷重矢印の長さは baseScale * 2 とする


    // 集中荷重の矢印をシーンに追加する
    for (const load of targetNodeLoad) {
      const n = load.n;

      // 節点座標 を 取得する
      const node = nodeData[n];
      if (node === undefined) {
        continue;
      }

      // リストに登録する
      const target = (n in this.pointLoadList) ? this.pointLoadList[n] : { tx: [], ty: [], tz: [], rx: [], ry: [], rz: [] };

      // 集中荷重 ---------------------------------
      for (let key of ["tx", "ty", "tz"]) {

        const value = load[key];
        if (value === 0) {
          continue;
        }

        // 非表示になっている余った荷重を見つける
        let arrow: THREE.Group = null;
        let already: boolean = false;
        arrow_loop:
        for (const k of ["tx", "ty", "tz"]) {
          const i = target[k].findIndex( a => { a.visible === false });
          if ( i > 0) {
            arrow = target[k][i];
            arrow.visible = true;
            target[k].splice(i, 1); // 一旦削除
            already = true;
            break arrow_loop;
          }
        }

        // 非表示になっている余った荷重がなければ新しいのを準備する
        if (already === false) {
          arrow = this.pointLoad.clone();
        }

<<<<<<< HEAD
  // 節点荷重の矢印を作成する
  private setPointLoad_memory(value: number,
    pMax: number,
    node: any,
    name: string): Line2 {

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

  // 節点荷重の矢印を作成する
  private setPointLoad(value: number,
    pMax: number,
    node: any,
    name: string): Line2 {
=======
        // 配置位置（その他の荷重とぶつからない位置）を決定する
        const offset = new THREE.Vector2(0, 0);
        for (const a of target[key]) {
          if (a.visible === false) {
            continue;
          }
          const child: any = a.getObjectByName("child");
          const direction: boolean = (Math.round(child.rotation.x) < 0)
          if (value < 0 && direction === true) {
            // マイナス
            offset.x += child.scale.x;
          } if (value > 0 && direction === false) {
            // プラスの荷重
            offset.x -= child.scale.x;
          }
        }
        // 荷重を編集する
        // 長さを決める
        // scale = 1 の時 長さlength = maxLengthとなる
        const scale = Math.abs(value / pMax);
        const length: number = maxLength * scale;
        this.pointLoad.change(arrow, node, offset, value, length, key);

        // リストに登録する
        target[key].push(arrow);
        if (already === false) {
          this.scene.add(arrow);
        }
        this.pointLoadList[n] = target;
>>>>>>> origin/develop

      }

    }
  }

  // 節点モーメントの矢印を描く
  private createMomentLoad(targetNodeLoad: any, nodeData: object): void {
    if (targetNodeLoad === undefined) {
      return;
    }

    // スケールを決定する 最大の荷重を 1とする
    let mMax = 0; // 最も大きいモーメント
    for (const load of targetNodeLoad) {
      mMax = Math.max(
        mMax,
        Math.abs(load.tx),
        Math.abs(load.ty),
        Math.abs(load.tz)
        // Math.abs(load.rx),
        // Math.abs(load.ry),
        // Math.abs(load.rz)
      );
    }
    const maxRadius = this.baseScale() * 2; // 最も大きいモーメント矢印の径は baseScale * 2 とする

    // 集中荷重の矢印をシーンに追加する
    for (const load of targetNodeLoad) {
      const n = load.n;

      // 節点座標 を 取得する
      const node = nodeData[n];
      if (node === undefined) {
        continue;
      }

      // リストに登録する
      const target = (n in this.pointLoadList) ? this.pointLoadList[n] : { tx: [], ty: [], tz: [], rx: [], ry: [], rz: [] };

      // 曲げモーメント荷重 -------------------------
      for (let key of ["rx", "ry", "rz"]) {
        const k = key.replace("r", "t"); // sasa
        const value = load[k];
        if (value === 0) {
          continue;
        }


        // 非表示になっている余った荷重を見つける
        let arrow: THREE.Group = null;
        let already: boolean = false;
        arrow_loop:
        for (const k of ["rx", "ry", "rz"]) {
          const i = target[k].findIndex(a => { a.visible === false });
          if (i > 0) {
            arrow = target[k][i];
            arrow.visible = true;
            target[k].splice(i, 1); // 一旦削除
            already = true;
            break arrow_loop;
          }
        }

        // 非表示になっている余った荷重がなければ新しいのを準備する
        if (already === false) {
          arrow = this.momentLoad.clone();
        }

        // 配置位置（その他の荷重とぶつからない位置）を決定する
        const offset = new THREE.Vector2(0, 0);
        for (const a of target[key]) {
          if (a.visible === false) {
            continue;
          }
          const child: any = a.getObjectByName("child");
            offset.x += child.scale.x; ///////// sasa
        }
        // 荷重を編集する
        // 長さを決める
        // scale = 1 の時 直径Radius = maxLengthとなる
        const scale = Math.abs(value / mMax);
        const Radius: number = maxRadius * scale;
        this.momentLoad.change(arrow, node, offset, value, Radius, key);

        // リストに登録する
        target[key].push(arrow);
        if (already === false) {
          this.scene.add(arrow);
        }
        this.pointLoadList[n] = target;

      }

    }
  }


  // 要素荷重の矢印を描く
  private createMemberLoad(
    memberLoadData: any,
    nodeData: object,
    memberData: object
  ): void { }

  // #endregion



  // #region スケールを反映する
  private onResize(): void {
    console.log("three load!", "onResize");
    // 節点荷重のスケールを変更する
    for (const n of Object.keys(this.pointLoadList)) {
      const dict = this.pointLoadList[n];
      for (let direction of Object.keys(dict)) {
        for (const item of dict[direction]) {
          if (item.visible == true) {
            const scale: number = this.LoadScale / 100;
            item.scale.set(scale, scale, scale);
          }
        }
      }
    }
<<<<<<< HEAD

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

  // 矢印（分布荷重X）を描く
  public CreateArrow_X(arrow, L_position, localAxis) {
    const groupX = new THREE.Group();

    let geometry = new THREE.BufferGeometry();
    let vertices = [];

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
    vertices.push(new THREE.Vector3(arrow.size * 0.3, 0, len_L - arrow.size * 0.6));
    vertices.push(new THREE.Vector3(0, 0, len_L));
    vertices.push(new THREE.Vector3(arrow.size * -0.3, 0, len_L - arrow.size * 0.6));
    geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    let material = new THREE.LineBasicMaterial({ color: arrow.color });
    let mesh = new THREE.Line(geometry, material);
    groupX.add(mesh);

    // geometryとverticesの初期化
    geometry = new THREE.BufferGeometry();
    vertices = [];

    // 矢印の棒
    vertices.push(new THREE.Vector3(0, 0, 0));
    vertices.push(new THREE.Vector3(0, 0, len_L));

    geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    material = new THREE.LineDashedMaterial({ color: arrow.color, dashSize: 0.1, gapSize: 0.1 });
    mesh = new THREE.Line(geometry, material);
    mesh.computeLineDistances();
    groupX.add(mesh);

    groupX.up.x = localAxis.z.x;
    groupX.up.y = localAxis.z.y;
    groupX.up.z = localAxis.z.z;

    groupX.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
    groupX.position.set(L_position.x1, L_position.y1, L_position.z1);
    groupX.name = "qx";

    arrowlist.push(groupX);
    return arrowlist;
  }

  // 矢印（分布荷重Y）を描く
  public CreateArrow_Y(arrow, L_position, localAxis, Data): any[] {
    const arrowlist = [];
    const groupY = new THREE.Group();

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
    if (thickness <= 0.00005) {
      thickness = 0.0001;
    } //thickness <= 0.00005だと表示不可
    const cGeometry = new THREE.CylinderBufferGeometry(thickness, thickness, len, 12);
    const cMesh = new THREE.Mesh(cGeometry,
      new THREE.MeshBasicMaterial({ color: arrow.color }));
    cMesh.rotation.z = Math.acos(v.y / len);
    cMesh.rotation.y = 0.5 * Math.PI + Math.atan2(v.x, v.z);
    cMesh.position.set(x, y, z);
    groupY.add(cMesh);


    // 荷重の面Meshを作る
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x00cc00,
      opacity: 0.3
    });
    let vertices1 = new Float32Array([]);
    let vertices2 = new Float32Array([]);
    if (Data.P1 * Data.P2 >= 0) {
      vertices1 = new Float32Array([
        0, 0, 0,
        d1, 0, 0,
        d2, 0, Data.len_L
      ]);
      vertices2 = new Float32Array([
        0, 0, 0,
        d2, 0, Data.len_L,
        0, 0, Data.len_L
      ]);
    } else if (Data.P1 * Data.P2 < 0) {
      const zero = (Math.abs(Data.P1) / (Math.abs(Data.P1) + Math.abs(Data.P2))) * Data.len_L
      vertices1 = new Float32Array([
        0, 0, 0,
        d1, 0, 0,
        0, 0, zero
      ]);
      vertices2 = new Float32Array([
        d2, 0, Data.len_L,
        0, 0, Data.len_L,
        0, 0, zero
      ]);
    };
    geometry1.setAttribute('position', new THREE.BufferAttribute(vertices1, 3));
    groupY.add(new THREE.Mesh(geometry1, material));
    geometry2.setAttribute('position', new THREE.BufferAttribute(vertices2, 3));
    groupY.add(new THREE.Mesh(geometry2, material));

    groupY.up.set( localAxis.z.x, localAxis.z.y, localAxis.z.z);

    // groupの操作
    groupY.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
    groupY.position.set(L_position.x1, L_position.y1, L_position.z1);
    groupY.name = 'qy';
    arrowlist.push(groupY);
    return arrowlist;
  }

  // 矢印（分布荷重Z）を描く
  public CreateArrow_Z(arrow, L_position, localAxis, Data): any[] {
    const arrowlist = [];
    const groupZ = new THREE.Group();

    let geometry1 = new THREE.BufferGeometry(); // geometry1の初期化
    let geometry2 = new THREE.BufferGeometry(); // geometry2の初期化
     const offset: number = Math.max(-Data.p_one, -Data.p_two, 0);
    const d1: number = offset + Data.p_one * Math.sign(Data.P1) * (-1);
    const d2: number = offset + Data.p_two * Math.sign(Data.P2) * (-1);

    // 分布荷重をまとめる棒
    const i = new THREE.Vector3(0, d1, 0);
    const j = new THREE.Vector3(0, d2, Data.len_L);

    const v = new THREE.Vector3(j.x - i.x, j.y - i.y, j.z - i.z);
    const len: number = v.length();

    const x: number = (i.x + j.x) / 2;
    const y: number = (i.y + j.y) / 2;
    const z: number = (i.z + j.z) / 2;
    let thickness: number = this.baseScale() / 2000;
    if (thickness <= 0.00005) {
      thickness = 0.0001;
    } //thickness <= 0.00005だと表示不可
    const cGeometry = new THREE.CylinderBufferGeometry(thickness, thickness, len, 12);
    const cMesh = new THREE.Mesh(cGeometry,
      new THREE.MeshBasicMaterial({ color: arrow.color }));
    cMesh.rotation.z = Math.acos(v.y / len);
    cMesh.rotation.y = 0.5 * Math.PI + Math.atan2(v.x, v.z);
    cMesh.position.set(x, y, z);
    groupZ.add(cMesh);


    // 荷重の面Meshを作る
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x00cc00,
      opacity: 0.5
    });
    let vertice1 = new Float32Array([]);
    let vertice2 = new Float32Array([]);
    if (Data.P1 * Data.P2 >= 0) {
      vertice1 = new Float32Array([
        0, 0, 0,
        0, d1, 0,
        0, d2, Data.len_L
      ]);
      vertice2 = new Float32Array([
        0, 0, 0,
        0, d2, Data.len_L,
        0, 0, Data.len_L
      ]);
    } else if (Data.P1 * Data.P2 < 0) {
      const zero = (Math.abs(Data.P1) / (Math.abs(Data.P1) + Math.abs(Data.P2))) * Data.len_L;
      vertice1 = new Float32Array([
        0, 0, 0,
        0, d1, 0,
        0, 0, zero
      ]);
      vertice2 = new Float32Array([
        0, d2, Data.len_L,
        0, 0, Data.len_L,
        0, 0, zero
      ]);
    };
    geometry1.setAttribute('position', new THREE.BufferAttribute(vertice1, 3));
    groupZ.add(new THREE.Mesh(geometry1, material));
    geometry2.setAttribute('position', new THREE.BufferAttribute(vertice2, 3));
    groupZ.add(new THREE.Mesh(geometry2, material));

    groupZ.up.set( localAxis.z.x, localAxis.z.y, localAxis.z.z); 

    //groupの操作
    groupZ.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
    groupZ.position.set(L_position.x1, L_position.y1, L_position.z1);
    groupZ.name = 'qz';
    arrowlist.push(groupZ);
    return arrowlist
=======
>>>>>>> origin/develop
  }

  // #endregion

 
  // #region データをクリアする
  public ClearData(): void {
    // 既に存在する荷重を非表示にする
    this.ClearNodeLoad();
    this.ClearMemberLoad();
    // gui を非表示にする
    this.guiDisable();
  }

  // 節点荷重を非表示にする
  private ClearNodeLoad(): void {
    for (const n of Object.keys(this.pointLoadList)) {
      const dict = this.pointLoadList[n];
      for (let direction of Object.keys(dict)) {
        for (const load of dict[direction]) {
          load.visible = false;
        }
<<<<<<< HEAD
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
          const posX: number = direction.x * distance;
          const posY: number = direction.y * distance;
          const posZ: number = direction.z * distance;
          item.position.set(posX, posY, posZ);
          this.scene.render();
          // 当たってはいけないオブジェクトとして登録
          check_box[m].check_load.push(item);

        }

=======
>>>>>>> origin/develop
      }
    }
  }

  // 要素荷重を非表示にする
  private ClearMemberLoad(): void {
    for (const m of Object.keys(this.memberLoadList)) {
      const dict = this.memberLoadList[m];
      for (let key of ["wx", "wy", "wz", "wr"]) {
        for (const load of dict[key]) {
          load.visible = false;
        }
      }
    }
  }
  // #endregion

 
}
