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

import { ThreeLoadText }  from "./three-load-text";
import { ThreeLoadDimension } from "./three-load-dimension";
import { ThreeLoadPoint } from "./three-load-point";
import { ThreeLoadDistribute } from "./three-load-distribute";

@Injectable({
  providedIn: "root",
})
export class ThreeLoadService {
  private isVisible = { object: false, gui: false };
  private targetCase: string;
  //private font: THREE.Font;

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
  private Distribute: ThreeLoadDistribute; // 分布荷重のテンプレート
  private mAxialbase: THREE.Group; // 軸方向荷重のテンプレート
  private mMomentbase: THREE.Group; // ねじり分布荷重のテンプレート
  private mTemperaturebase: THREE.Group; // 温度荷重のテンプレート
  private pointLoad: ThreeLoadPoint; // 節点荷重のテンプレート
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
      
      const text = new ThreeLoadText(font);
      const dim = new ThreeLoadDimension(text); //寸法戦を扱うモジュール

      // 荷重の雛形をあらかじめ生成する
      this.Distribute = new ThreeLoadDistribute(text, dim); // 分布荷重のテンプレート
      this.mAxialbase = this.createAxialbase(); // 軸方向荷重のテンプレート
      this.mMomentbase = this.createDistributedMomentLoad(); // ねじり分布荷重のテンプレート
      this.mTemperaturebase = this.createTemperatureLoad(); // 温度荷重のテンプレート
      this.pointLoad = new ThreeLoadPoint(text); // 節点荷重のテンプレート
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

  public baseScale(): number {
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
      this.createNodeLoad(nodeLoadData[targetCase], nodeData);
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
  private createNodeLoad(targetNodeLoad: any, nodeData: object): void {
    if (targetNodeLoad === undefined) {
      return;
    }

    // スケールを決定する 最大の荷重を 1とする
    let pMax = 0; // 最も大きい集中荷重値
    let mMax = 0; // 最も大きいモーメント
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
        this.pointLoad.changeLoad(arrow, node, offset, value, length, key);

        // リストに登録する
        target[key].push(arrow);
        if (already === false) {
          this.scene.add(arrow);
        }
        this.pointLoadList[n] = target;

      }

      // 曲げモーメント荷重 -------------------------
      for (let key of ["rx", "ry", "rz"]) {

        const value = load[key];
        if (value === 0) {
          continue;
        }


        // 非表示になっている余った荷重を見つける
        let arrow: THREE.Group = null;
        let already: boolean = false;
        arrow_loop:
        for (const k of ["rx", "ry", "rz"]) {
          const i = target[k].findIndex( a => { a.visible === false });
          if ( i> 0) {
            arrow = target[k][i];
            arrow.visible = true;
            target[k].splice(i, 1); // 一旦削除
            already = true;
            break arrow_loop;
          }
        }

        // 非表示になっている余った荷重がなければ新しいのを準備する
        if (already === false) {
          arrow = this.pMomentbase.clone();
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
        this.changeMomentLoad(arrow, node, offset, value, length, key);

        // リストに登録する
        target[key].push(arrow);
        if (already === false) {
          this.scene.add(arrow);
        }
        this.pointLoadList[n] = target;

      }

    }
  }

  /// 節点モーメント荷重を編集する
  // target: 編集対象の荷重,
  // node: 基準点,
  // offset: 配置位置（その他の荷重とぶつからない位置）
  // value: 荷重値,
  // length: 表示上の長さ,
  // direction: 荷重の向き(rx, ry, rz)
  private changeMomentLoad(    target: THREE.Group,
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
      child.rotation.set(-Math.PI, 0, -Math.PI);
    }
    child.scale.set(length, length, length);

    // 文字を追加する
    const oldText = target.getObjectByName("text");
    if (oldText !== undefined) {
      target.remove(oldText);
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
      target.rotation.set(Math.PI/2, Math.PI/2, 0);
    } else if (direction === "tz") {
      target.rotation.set(-Math.PI/2, 0, -Math.PI/2);
    }

    // 位置を修正する
    target.position.set(node.x, node.y, node.z);

  }

  /* 節点荷重を編集する
  // target: 編集対象の荷重,
  // node: 基準点,
  // offset: 配置位置（その他の荷重とぶつからない位置）
  // value: 荷重値,
  // length: 表示上の長さ,
  // direction: 荷重の向き(tx, ty, tz)
  private changePointLoad(
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
      child.rotation.set(-Math.PI, 0, -Math.PI);
    }
    child.scale.set(length, length, length);

    // 文字を追加する
    const oldText = target.getObjectByName("text");
    if (oldText !== undefined) {
      target.remove(oldText);
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
      target.rotation.set(Math.PI/2, Math.PI/2, 0);
    } else if (direction === "tz") {
      target.rotation.set(-Math.PI/2, 0, -Math.PI/2);
    }

    // 位置を修正する
    target.position.set(node.x, node.y, node.z);

  }
  */

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

  /* 文字を描く
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
  */


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

  /* 節点荷重の矢印を作成する
  private createPointLoad(): THREE.Group {
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
    group.name = "PointLoad";
    return group;
  }
  */
  // #endregion
}
