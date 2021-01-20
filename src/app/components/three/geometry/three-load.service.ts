import { Injectable } from "@angular/core";
import { SceneService } from "../scene.service";
import { InputNodesService } from "../../input/input-nodes/input-nodes.service";
import { InputMembersService } from "../../input/input-members/input-members.service";
import { InputLoadService } from "../../input/input-load/input-load.service";
import { ThreeNodesService } from "./three-nodes.service";

import { Line2 } from "../libs/Line2.js";
import { LineMaterial } from "../libs/LineMaterial.js";
import { LineGeometry } from "../libs/LineGeometry.js";

import * as THREE from "three";
import { ThreeMembersService } from "./three-members.service";

@Injectable({
  providedIn: "root",
})
export class ThreeLoadService {
  private isVisible = { object: false, gui: false };

  private font: THREE.Font;

  // 節点荷重を格納する変数
  private pointLoadList: any;
  /*key: "節点番号",
  value: {
    tx: [], // 軸方向荷重のリスト
    ty: [], // y軸方向荷重のリスト
    tz: [], // z軸方向荷重のリスト
    tr: []  // ねじり方向荷重のリスト
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
  private mDistribase: THREE.Group; // 分布荷重のテンプレート
  private mAxialbase: THREE.Group; // 軸方向荷重のテンプレート
  private mMomentbase: THREE.Group; // ねじり分布荷重のテンプレート
  private mTemperaturebase: THREE.Group; // 温度荷重のテンプレート
  private pLoadbase: THREE.Group; // 節点荷重のテンプレート
  private pMomentbase: THREE.Group; // 節点モーメントのテンプレート

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
      this.font = font;
      // 荷重の雛形をあらかじめ生成する
      this.mDistribase = this.createDistributedLoad(); // 分布荷重のテンプレート
      this.mAxialbase = this.createAxialbase(); // 軸方向荷重のテンプレート
      this.mMomentbase = this.createDistributedMomentLoad(); // ねじり分布荷重のテンプレート
      this.mTemperaturebase = this.createTemperatureLoad(); // 温度荷重のテンプレート
      this.pLoadbase = this.createConcentratedLoad(); // 節点荷重のテンプレート
      this.pMomentbase = this.createMomentLoad(); // 節点モーメントのテンプレート
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

  public visible(flag: boolean, gui: boolean): void {
    console.log("three load!", "visible", "pass");

    // 非表示にする
    if (flag === false) {
      this.ClearData();
      this.guiDisable();
      return;
    }

    // gui の表示を切り替える
    if (gui === true) {
      this.guiEnable();
    } else {
      this.guiDisable();
    }
    this.isVisible.gui = gui;

    // 
    if (this.isVisible.object !== flag) {
      return
    }

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

  public baseScale(): number {
    console.log("three load!", "baseScale");
    // 最も距離の近い2つの節点距離
    return this.nodeThree.baseScale * 10;
  }

  // #region 荷重の変更を反映する

  public changeData(index: number): void {
    console.log('three load!', 'changeData');
    // 格点データを入手
    const nodeData = this.node.getNodeJson(0);
    if (Object.keys(nodeData).length <= 0) {
      return;
    }

    // 節点荷重データを入手
    const targetCase: string = index.toString();
    const nLoadData = this.load.getNodeLoadJson(0, targetCase);
    let nodeLoadData = {};
    if (targetCase in nLoadData) {
      nodeLoadData = nLoadData[targetCase];
    }
    if (Object.keys(nodeLoadData).length <= 0) {
      this.ClearNodeLoad();
    } else {
      // サイズを調整しオブジェクトを登録する
      this.createNodeLoad(nodeLoadData, nodeData);
    }

    // 要素データを入手
    const memberData = this.member.getMemberJson(0);
    if (Object.keys(memberData).length <= 0) {
      this.ClearMemberLoad();
      return;
    }

    // 要素荷重データを入手
    const mLoadData = this.load.getMemberLoadJson(0, targetCase);
    let memberLoadData = {};
    if (targetCase in mLoadData) {
      memberLoadData = mLoadData[targetCase];
    }
    if (Object.keys(memberLoadData).length <= 0) {
      this.ClearMemberLoad();
    } else {
      // サイズを調整しオブジェクトを登録する
      this.createMemberLoad(memberLoadData, nodeData, memberData);
    }

    this.onResize();

    this.guiEnable();
  }

  // 節点荷重の矢印を描く
  private createNodeLoad(targetNodeLoad: any, nodeData: object): void {
    if (targetNodeLoad === undefined) {
      return;
    }

    // スケールを決定する 最大の荷重を 1とする
    let pMax = 0;
    let mMax = 0;
    for (const load of targetNodeLoad) {
      pMax = Math.max(
        pMax,
        Math.abs(load.tx),
        Math.abs(load.ty),
        Math.abs(load.tz)
      );
      mMax = Math.max(
        mMax,
        Math.abs(load.rx),
        Math.abs(load.ry),
        Math.abs(load.rz)
      );
    }
    const maxLength = this.baseScale() * 2; // 最も大きい集中荷重矢印の長さは baseScale * 2 とする
    const maxRadius = this.baseScale() * 2; // 最も大きいモーメント矢印の径は baseScale * 2 とする


    // 集中荷重の矢印をシーンに追加する
    for (const load of targetNodeLoad) {
      const n = '41';//load.n;

      // 節点座標 を 取得する
      const node = nodeData[n];
      if (node === undefined) {
        continue;
      }

      // 集中荷重
      for (const key of ["tx", "ty", "tz"]) {

        let value = load[key];
        if (value === 0) {
          continue;
        }
        value = 16.1;
        // リストに登録する
        let target = { tx: [], ty: [], tz: [], tr: [] };
        if (n in this.pointLoadList) {
          target = this.pointLoadList[n];
        }

        // 非表示になっている余った荷重を見つける
        let arrow: THREE.Group;
        let already: boolean = false;
        arrow_loop: for (const k of ["tx", "ty", "tz"]) {
          for (const a of target[k]) {
            if (a.visible === false) {
              arrow = a;
              already = true;
              break arrow_loop;
            }
          }
        }

        // 非表示になっている余った荷重がなければ新しいのを準備する
        if (already === false) {
          arrow = this.pLoadbase.clone();
        }

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
        this.changeConcentratedLoad(arrow, node, offset, value, length, key);

        // リストに登録する
        if (already === false) {
          target[key].push(arrow);
          this.scene.add(arrow);
        }
        this.pointLoadList[n] = target;

      }

      // 曲げモーメント荷重
    }
  }

  /// 節点荷重を編集する
  // target: 編集対象の荷重,
  // node: 基準点,
  // offset: 配置位置（その他の荷重とぶつからない位置）
  // value: 荷重値,
  // length: 表示上の長さ,
  // direction: 荷重の向き(tx, ty, tz)
  private changeConcentratedLoad(
    target: THREE.Group,
    node: any,
    offset: THREE.Vector2,
    value: number,
    length: number,
    direction: string
  ): void {


    //線の色を決める
    let line_color = 0xff0000;
    if (direction === "ty") {
      line_color = 0x00ff00;
    } else if (direction === "tz") {
      line_color = 0x0000ff;
    }

    const child: any = target.getObjectByName("child");

    // 色を変更する
    const arrow: any = child.getObjectByName("arrow");
    arrow.line.material.color.set(line_color);
    arrow.cone.material.color.set(line_color);

    // 長さを修正する
    if (value < 0) {
      child.rotateY(Math.PI);
    }
    child.scale.set(length, length, length);

    // 文字を追加する
    const oldText = child.getObjectByName("text");
    if (oldText !== undefined) {
      child.remove(oldText);
    }
    const textStr: string = value.toFixed(2);
    const size: number = 0.2;
    const vartical: string = 'bottom';
    let horizontal: string;
    let pos: THREE.Vector2;
    if (value < 0) {
      horizontal = 'right';
      pos = new THREE.Vector2(length + offset.x, 0);
    } else {
      horizontal = 'left';
      pos = new THREE.Vector2(-length + offset.x, 0);
    }
    const text = this.createText(textStr, pos, size, horizontal, vartical);
    text.name = "text";
    target.add(text);

    child.position.x = offset.x;
    child.position.y = offset.y;


    // 向きを変更する
    if (direction === "ty") {
      target.rotateZ(Math.PI / 2);
    } else if (direction === "tz") {
      target.rotateY(-Math.PI / 2);
    }

    // 位置を修正する
    target.position.set(node.x, node.y, node.z);

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
  }

  // #endregion

  // #region 荷重を編集する

  // 寸法線を編集する
  private changeDimension(
    target: THREE.Group,
    points: THREE.Vector2[],
    textStr: string
  ): void {
    const pos0: THREE.Vector2 = points[0];
    const pos1: THREE.Vector2 = points[1];
    const pos2: THREE.Vector2 = points[2];
    const pos3: THREE.Vector2 = points[3];

    // 線の位置を更新する
    const line: any = target.getObjectByName("line");
    const line_geo = line.geometry;
    const array = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      const j = i * 3;
      const p = points[i];
      array[j + 0] = p.x;
      array[j + 1] = p.y;
      array[j + 2] = 0;
    }
    line_geo.attributes.position.array = array;
    line_geo.attributes.position.needsUpdate = true;

    // 矢印の位置を更新する
    const arrow1: any = target.getObjectByName("arrow1");
    arrow1.position.set(pos1.x + 0.5, pos1.y, 0);

    const arrow2: any = target.getObjectByName("arrow2");
    arrow2.position.set(pos2.x - 0.5, pos2.y, 0);

    // 文字を描く
    const oldText: any = target.getObjectByName("text");
    if (oldText !== undefined) {
      target.remove(oldText);
    }
    const x = pos1.x + (pos2.x - pos1.x) / 2;
    const y = pos1.y + (pos2.y - pos1.y) / 2;
    const horizontal: string = 'center';
    const vartical: string = (pos1.y > pos0.y) ? 'bottom' : 'top';

    const text = this.createText(textStr, new THREE.Vector2(x, y), 0.1, horizontal, vartical);
    text.name = "text";

    target.add(text);
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

  // #region 荷重の雛形をあらかじめ生成する

  // 文字を描く
  private createText(
    textString: string,
    position: THREE.Vector2,
    size: number,
    horizontal = 'center',
    vartical = 'bottom'): THREE.Mesh {

    const text_geo = new THREE.TextGeometry(textString, {
      font: this.font,
      size: size,
      height: 0.001,
      curveSegments: 4,
      bevelEnabled: false,
    });

    const text_mat = [
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    ];

    text_geo.center();

    const text = new THREE.Mesh(text_geo, text_mat);

    text.position.set(position.x, position.y, 0);

    if (vartical === 'bottom') {
      text.position.y +=
        0.5 *
        (text.geometry.boundingBox.max.y - text.geometry.boundingBox.min.y);
    } else if (vartical === 'top') {
      text.position.y -=
        0.5 *
        (text.geometry.boundingBox.max.y - text.geometry.boundingBox.min.y);
    }
    if (horizontal === 'left') {
      text.position.x +=
        0.5 *
        (text.geometry.boundingBox.max.x - text.geometry.boundingBox.min.x);
    } else if (horizontal === 'right') {
      text.position.x -=
        0.5 *
        (text.geometry.boundingBox.max.x - text.geometry.boundingBox.min.x);
    }


    return text;
  }
  // 温度荷重の雛形を X軸に生成する
  private createTemperatureLoad(): THREE.Group {
    const group = new THREE.Group();

    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)];

    const line_color = 0xff0000;

    // 線を描く
    const line_mat = new THREE.LineDashedMaterial({
      color: line_color,
      dashSize: 0.1,
      gapSize: 0.1,
      linewidth: 1,
    });
    const line_geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(line_geo, line_mat);
    line.name = "line";
    group.add(line);

    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////

    group.name = "mTemp";
    return group;
  }

  // 軸方向荷重の雛形を X軸に生成する
  private createAxialbase(): THREE.Group {
    const group = new THREE.Group();

    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)];

    const line_color = 0xff0000;

    // 線を描く
    const line_mat = new THREE.LineDashedMaterial({
      color: line_color,
      dashSize: 0.1,
      gapSize: 0.1,
      linewidth: 1,
    });
    const line_geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(line_geo, line_mat);
    line.name = "line";
    group.add(line);

    // 矢印を描く
    const arrow_geo = new THREE.ConeBufferGeometry(0.05, 0.25, 3, 1, false);
    const arrow_mat = new THREE.MeshBasicMaterial({ color: line_color });
    const arrow = new THREE.Mesh(arrow_geo, arrow_mat);
    arrow.rotation.z = -Math.PI / 2;
    arrow.position.set(1, 0, 0);
    arrow.name = "arrow";
    group.add(arrow);

    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////

    group.name = "mAxial";
    return group;
  }

  // ねじり分布荷重の雛形をX軸周りに生成する
  private createDistributedMomentLoad(): THREE.Group {
    const group = new THREE.Group();

    const face_color = 0x00cc00;

    const cylinder_mat = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: face_color,
      opacity: 0.3,
    });

    // i端側のコーン
    const cylinder_geo = new THREE.CylinderBufferGeometry(
      1,
      1, // radiusTop, radiusBottom
      0.5,
      12, // height, radialSegments
      1,
      true, // heightSegments, openEnded
      -Math.PI / 2,
      Math.PI * 1.5 // thetaStart, thetaLength
    );
    const mesh1 = new THREE.Mesh(cylinder_geo, cylinder_mat);
    mesh1.rotation.z = Math.PI / 2;
    mesh1.position.set(0.25, 0, 0);
    mesh1.name = "mesh1";
    group.add(mesh1);

    const mesh2 = mesh1.clone();
    mesh1.position.set(0.75, 0, 0);
    mesh2.name = "mesh2";
    group.add(mesh2);

    //
    const arrow1 = this.createMomentLoad();
    arrow1.name = "arrow1";
    group.add(arrow1);

    const arrow2 = arrow1.clone();
    arrow2.name = "arrow2";
    arrow2.position.set(1, 0, 0);
    group.add(arrow2);

    // 寸法線を描く
    const dim1 = this.createDimension();
    dim1.name = "Dimension1";
    group.add(dim1);

    const dim2 = this.createDimension();
    dim2.name = "Dimension2";
    group.add(dim2);

    const dim3 = this.createDimension();
    this.changeDimension(
      dim3,
      [
        new THREE.Vector2(1, 1.1),
        new THREE.Vector2(1, 2),
        new THREE.Vector2(2, 2),
        new THREE.Vector2(2, 0.1),
      ],
      "1.003"
    );
    dim3.name = "Dimension3";
    group.add(dim3);

    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////

    group.name = "DistributedMoment";
    return group;
  }

  // 等分布荷重の雛形をX-Y平面上に生成する
  private createDistributedLoad(): THREE.Group {
    const group = new THREE.Group();

    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0.5, 1, 0),
      new THREE.Vector3(1, 1, 0),
      new THREE.Vector3(1, 0, 0),
    ];

    const line_color = 0x0000ff;
    const face_color = 0x00cc00;

    // 面を作成する
    const face_mat = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: face_color,
      opacity: 0.3,
    });
    const face_geo = new THREE.Geometry();
    face_geo.vertices = points;
    face_geo.faces.push(new THREE.Face3(0, 1, 2));
    face_geo.faces.push(new THREE.Face3(2, 3, 4));
    face_geo.faces.push(new THREE.Face3(0, 2, 4));
    const mesh = new THREE.Mesh(face_geo, face_mat);
    mesh.name = "face";
    group.add(mesh);

    // 面の周りの枠線を描く
    const line_mat = new THREE.LineBasicMaterial({ color: line_color });
    const line_geo = new THREE.BufferGeometry().setFromPoints([
      points[1],
      points[2],
      points[3],
    ]);
    const line = new THREE.Line(line_geo, line_mat);
    line.name = "line";
    group.add(line);

    // 矢印を描く
    const dir = new THREE.Vector3(0, -1, 0); // 矢印の方向（単位ベクトル）
    const length = 1; // 長さ

    const origin1 = new THREE.Vector3(0, 1, 0);
    const arrow1 = new THREE.ArrowHelper(dir, origin1, length, line_color);
    arrow1.name = "arrow1";
    group.add(arrow1);

    const origin2 = new THREE.Vector3(1, 1, 0);
    const arrow2 = new THREE.ArrowHelper(dir, origin2, length, line_color);
    arrow2.name = "arrow2";
    group.add(arrow2);

    // 寸法線を描く
    const dim1 = this.createDimension();
    dim1.name = "Dimension1";
    group.add(dim1);

    const dim2 = this.createDimension();
    dim2.name = "Dimension2";
    group.add(dim2);

    const dim3 = this.createDimension();
    dim3.name = "Dimension3";
    group.add(dim3);

    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////

    group.name = "DistributedLoad";
    return group;
  }

  // 寸法線を作成する
  private createDimension(): THREE.Group {
    const group = new THREE.Group();

    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(1, 1, 0),
      new THREE.Vector3(1, 0, 0),
    ];

    const line_color = 0x000000;

    // 面の周りの枠線を描く
    const line_mat = new THREE.LineBasicMaterial({ color: line_color });
    const line_geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(line_geo, line_mat);
    line.name = "line";
    group.add(line);

    // 矢印を描く
    const length = 0.5; // 長さ
    const origin = new THREE.Vector3(length, 1, 0);

    const dir1 = new THREE.Vector3(-1, 0, 0); // 矢印の方向（単位ベクトル）
    const arrow1 = new THREE.ArrowHelper(dir1, origin, length, line_color);
    arrow1.name = "arrow1";
    group.add(arrow1);

    const dir2 = new THREE.Vector3(1, 0, 0); // 矢印の方向（単位ベクトル）
    const arrow2 = new THREE.ArrowHelper(dir2, origin, length, line_color);
    arrow2.name = "arrow2";
    group.add(arrow2);

    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////

    return group;
  }

  // 節点モーメントの矢印を作成する
  private createMomentLoad(): THREE.Group {
    const group = new THREE.Group();

    const line_color = 0x0000ff;

    const curve = new THREE.EllipseCurve(
      0,
      0, // ax, aY
      1,
      1, // xRadius, yRadius
      0,
      1.5 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0 // aRotation
    );

    const points = curve.getPoints(12);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ color: line_color });
    const ellipse = new THREE.Line(lineGeometry, lineMaterial);
    ellipse.rotation.y = Math.PI / 2;
    ellipse.name = "line";
    group.add(ellipse);

    // 矢印を描く
    const arrow_geo = new THREE.ConeBufferGeometry(0.05, 0.25, 3, 1, false);
    const arrow_mat = new THREE.MeshBasicMaterial({ color: line_color });
    const arrow = new THREE.Mesh(arrow_geo, arrow_mat);
    arrow.rotation.z = -Math.PI / 2;
    arrow.rotation.x = Math.PI / 6;
    arrow.position.set(-0.125, -1, 0);
    arrow.name = "arrow";
    group.add(arrow);

    group.name = "MomentLoad";

    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////

    return group;
  }

  // 節点荷重の矢印を作成する
  private createConcentratedLoad(): THREE.Group {
    const group = new THREE.Group();
    const line_color = 0x0000ff;

    const length = 1; // 長さ
    const origin = new THREE.Vector3(-1, 0, 0);

    const dir = new THREE.Vector3(1, 0, 0); // 矢印の方向（単位ベクトル）
    const arrow = new THREE.ArrowHelper(dir, origin, length, line_color);
    arrow.name = "arrow";

    // 矢印の原点を先端に変更する
    const child = new THREE.Group();
    child.add(arrow);
    child.name = "child";

    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////
    group.add(child);
    group.name = "ConcentratedLoad";
    return group;
  }
  // #endregion
}
