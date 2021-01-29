import { Injectable } from "@angular/core";
import { SceneService } from "../scene.service";
import { InputNodesService } from "../../input/input-nodes/input-nodes.service";
import { InputMembersService } from "../../input/input-members/input-members.service";
import { InputLoadService } from "../../input/input-load/input-load.service";
import { ThreeNodesService } from "./three-nodes.service";

import * as THREE from "three";
import { ThreeMembersService } from "./three-members.service";

import { ThreeLoadText } from "./three-load/three-load-text";
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

  // 全ケースの荷重を保存
  private AllCaseLoadList: {};
  private currentIndex: string;

  /* 節点荷重を格納する変数
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

  /* 要素荷重を格納する変数
  private memberLoadList: any;
  /*key: "要素番号",
  value: {
    localAxcis: 部材のローカル座標
    wx: [], // 軸方向荷重のリスト
    wy: [], // y軸方向荷重のリスト
    wz: [], // z軸方向荷重のリスト
    wgy: [], // 絶対座標系y軸方向荷重のリスト
    wgz: [], // 絶対座標系z軸方向荷重のリスト
    wr: []  // ねじり方向荷重のリスト
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
  private params: any; // GUIの表示制御
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
      this.pointLoad = new ThreeLoadPoint(text); // 節点荷重のテンプレート
      this.momentLoad = new ThreeLoadMoment(text); // 節点モーメントのテンプレート
      this.distributeLoad = new ThreeLoadDistribute(text, dim); // 分布荷重のテンプレート
      this.axialLoad = new ThreeLoadAxial(text); // 軸方向荷重のテンプレート
      this.torsionLoad = new ThreeLoadTorsion(text, dim, this.momentLoad); // ねじり分布荷重のテンプレート
      this.temperatureLoad = new ThreeLoadTemperature(text, dim); // 温度荷重のテンプレート
    });

    // gui
    this.LoadScale = 100;
    this.params = {
      LoadScale: this.LoadScale,
    };
    this.gui = {};


    this.AllCaseLoadList = {};
    this.currentIndex = null;
  }

  // 荷重を全部削除する
  public ClearData(): void {

    for(const key of Object.keys(this.AllCaseLoadList)){
      const targetLoad = this.AllCaseLoadList[key];
      const ThreeObject: THREE.Object3D = targetLoad.ThreeObject;
      this.scene.remove(ThreeObject);
    }

    this.AllCaseLoadList = {};
    this.currentIndex = null;
  }


  // ファイルを開いたときの処理
  public fileload() {

    // 今までの荷重を削除する
    this.ClearData();

    // 荷重を作成する
    for( const id of Object.keys(this.load.load)){
      this.addCase(id);
    }

    // 荷重図を非表示のまま作成する
    for(const id of Object.keys(this.AllCaseLoadList)){
      this.currentIndex = id; // カレントデータをセット
      this.changeData(); // 荷重図を追加する
    }

  }

  
  // 表示ケースを変更する
  public changeCase(id: string): void {

    if(this.currentIndex === id){
      return;
    }

    // 初めての荷重ケースが呼び出された場合
    if(!(id in this.AllCaseLoadList)){
      this.addCase(id);
    }

    // 荷重の表示非表示を切り替える
    for(const key of Object.keys(this.AllCaseLoadList)){
      const targetLoad = this.AllCaseLoadList[key];
      const ThreeObject: THREE.Object3D = targetLoad.ThreeObject;
      ThreeObject.visible = ( key === id) ? true : false;
    }

    // カレントデータをセット
    this.currentIndex = id;

  }

  // ケースを追加する
  private addCase(id: string): void {
    const ThreeObject = new THREE.Object3D();
    ThreeObject.name = id;
    ThreeObject.visible = false;　// ファイルを読んだ時点では、全ケース非表示

    this.AllCaseLoadList[id] = {
      ThreeObject,
      pointLoadList: {},
      memberLoadList: {}
    }

    this.scene.add(ThreeObject); // シーンに追加
  }

  // ケースの荷重図を消去する
  private removeCase(id: string): void {

    if(!(id in this.AllCaseLoadList)) {
      return;
    }

    const data =  this.AllCaseLoadList[id];
    const ThreeObject = data.ThreeObject;
    this.scene.remove(ThreeObject);

  }

  public changeData(row: number = -1): void {

    // データになカレントデータがなければ
    if ( !(this.currentIndex in this.load.load)){
      this.removeCase(this.currentIndex);
      return;
    }

    // ケースの荷重図を表示する
    if (!(this.currentIndex in this.AllCaseLoadList)) {
      this.addCase(this.currentIndex);
    }
    const data =  this.AllCaseLoadList[this.currentIndex];
    const ThreeObject = data.ThreeObject;
    ThreeObject.visible = true;

    // 格点データを入手
    const nodeData = this.node.getNodeJson(0);
    if (Object.keys(nodeData).length <= 0) {
      return; // 格点がなければ 以降の処理は行わない
    }

    // 節点荷重データを入手
    const nodeLoadData = this.load.getNodeLoadJson(0, this.currentIndex);
    if (this.currentIndex in nodeLoadData) {
      this.createPointLoad(nodeLoadData[this.currentIndex], row, nodeData);
    }

    // 要素データを入手
    const memberData = this.member.getMemberJson(0);
    if (Object.keys(memberData).length <= 0) {
      return; //要素がなければ 以降の処理は行わない
    }

    // 要素荷重データを入手
    const memberLoadData = this.load.getMemberLoadJson(0, this.currentIndex);
    if (this.currentIndex in memberLoadData) {
      this.createMemberLoad(memberLoadData[this.currentIndex], row, nodeData, memberData);
    }

    // サイズや重なりを調整する
    this.onResize();

    // 表示フラグを ON にする
    this.isVisible.object = true;
  }

  // 節点荷重の矢印を描く
  private createPointLoad(targetNodeLoad: any[], nodeData: object): void {
    if (targetNodeLoad === undefined) {
      return;
    }

    // スケールを決定する 最大の荷重を 1とする
    let pMax = 0; // 最も大きい集中荷重値
    targetNodeLoad.forEach((load) => {
      pMax = Math.max(
        pMax,
        Math.abs(load.tx),
        Math.abs(load.ty),
        Math.abs(load.tz)
      );
    });
    let mMax = 0; // 最も大きいモーメント
    targetNodeLoad.forEach((load) => {
      mMax = Math.max(
        mMax,
        Math.abs(load.rx),
        Math.abs(load.ry),
        Math.abs(load.rz)
      );
    });
    if (pMax === 0 && mMax === 0) {
      return;
    }

    const maxLength = this.baseScale() * 2; // 最も大きい集中荷重矢印の長さは baseScale * 2 とする
    const maxRadius = this.baseScale(); // 最も大きいモーメント矢印の半径は baseScale とする

    // 集中荷重の矢印をシーンに追加する
    for (const load of targetNodeLoad) {
      const n = load.n;

      // 節点座標 を 取得する
      if (!(n in nodeData)) {
        continue;
      }
      const node = nodeData[n];

      // リストに登録する
      const target =
        n in this.pointLoadList
          ? this.pointLoadList[n]
          : { tx: [], ty: [], tz: [], rx: [], ry: [], rz: [] };

      // 集中荷重 ---------------------------------
      for (let key of ["tx", "ty", "tz"]) {
        const value = load[key];
        if (value === 0) {
          continue;
        }

        // 非表示になっている余った荷重を見つける
        let arrow: THREE.Group = null;
        let already: boolean = false;
        for (const k of ["tx", "ty", "tz"]) {
          const i = target[k].findIndex((a) => {
            a.visible === false;
          });
          if (i > 0) {
            arrow = target[k][i];
            arrow.visible = true;
            target[k].splice(i, 1); // 一旦削除
            already = true;
            break;
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
          const direction: boolean = Math.round(child.rotation.x) < 0;
          if (value < 0 && direction === true) {
            // マイナス
            offset.x += child.scale.x;
          }
          if (value > 0 && direction === false) {
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
        for (const k of ["rx", "ry", "rz"]) {
          const i = target[k].findIndex((a) => {
            a.visible === false;
          });
          if (i > 0) {
            arrow = target[k][i];
            arrow.visible = true;
            target[k].splice(i, 1); // 一旦削除
            already = true;
            break;
          }
        }

        // 非表示になっている余った荷重がなければ新しいのを準備する
        if (already === false) {
          arrow = this.momentLoad.clone();
        }

        // 配置位置（その他の荷重とぶつからない位置）を決定する
        let offset = 0;
        for (const a of target[key]) {
          if (a.visible === false) {
            continue;
          }
          offset += 0.1;
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
    memberLoadData: any[],
    nodeData: object,
    memberData: object
  ): void {
    if (memberLoadData === undefined) {
      return;
    }

    // スケールを決定する 最大の荷重を 1とする
    let pMax = 0;
    memberLoadData.forEach((load) => {
      pMax = Math.max(pMax, Math.abs(load.P1));
      pMax = Math.max(pMax, Math.abs(load.P2));
    });
    if (pMax === 0) {
      return;
    }

    // memberLoadData情報を書き換える可能性があるので、複製する
    const targetMemberLoad = JSON.parse(
      JSON.stringify({
        temp: memberLoadData,
      })
    ).temp;

    const maxLength = this.baseScale(); // 最も大きい集中荷重矢印の長さは baseScale * 2 とする

    // スケールを決める
    // 荷重値 = pMax の時 表示長さ = maxLength となる
    const scale = maxLength / pMax * 10;

    // 分布荷重の矢印をシーンに追加する
    for (const load of targetMemberLoad) {
      if (load.P1 === 0 && load.P2 === 0) {
        continue;
      }

      // 部材データを集計する
      if (!(load.m in memberData)) {
        continue;
      }
      const m = memberData[load.m];
      // 節点データを集計する
      if (!(m.ni in nodeData && m.nj in nodeData)) {
        continue;
      }
      const i = nodeData[m.ni];
      const j = nodeData[m.nj];
      const nodei = new THREE.Vector3(i.x, i.y, i.z);
      const nodej = new THREE.Vector3(j.x, j.y, j.z);

      // 部材の座標軸を取得
      const localAxis = this.three_member.localAxis(
        i.x,
        i.y,
        i.z,
        j.x,
        j.y,
        j.z,
        m.cg
      );

      // リストに登録する
      const target =
        m in this.memberLoadList
          ? this.memberLoadList[m]
          : { localAxis, wx: [], wy: [], wz: [], wgy: [], wgz: [], wr: [] };

      // 荷重値と向き -----------------------------------
      let P1: number = load.P1;
      let P2: number = load.P2;
      let direction: string = load.direction;
      if (localAxis.x.y === 0 && localAxis.x.z === 0) {
        //console.log(load.m, m, 'は x軸に平行な部材です')
        if (direction === "gx") direction = "x";
        if (direction === "gy") direction = "y";
        if (direction === "gz") direction = "z";
      } else if (localAxis.x.x === 0 && localAxis.x.z === 0) {
        //console.log(load.m, m, 'は y軸に平行な部材です')
        if (direction === "gx") {
          direction = "y";
          P1 = -P1;
          P2 = -P2;
        }
        if (direction === "gy") direction = "x";
        if (direction === "gz") direction = "z";
      } else if (localAxis.x.x === 0 && localAxis.x.y === 0) {
        //console.log(load.m, m, 'は z軸に平行な部材です')
        if (direction === "gx") {
          direction = "y";
          P1 = -P1;
          P2 = -P2;
        }
        if (direction === "gy") direction = "z";
        if (direction === "gz") {
          direction = "x";
          P1 = -P1;
          P2 = -P2;
        }
      }

      // 分布荷重 wy, wz -------------------------------
      // mark=2, direction=x
      if (
        load.mark === 2 &&
        (direction === "y" ||
          direction === "z" ||
          direction === "gx" ||
          direction === "gy" ||
          direction === "gz")
      ) {
        // 非表示になっている余った荷重を見つける
        let arrow: THREE.Group = null;
        let already: boolean = false;
        for (const k of ["wy", "wz", "wgy", "wgz"]) {
          const i = target[k].findIndex((a) => {
            a.visible === false;
          });
          if (i > 0) {
            arrow = target[k][i];
            arrow.visible = true;
            target[k].splice(i, 1); // 一旦削除
            already = true;
            break;
          }
        }

        // 非表示になっている余った荷重がなければ新しいのを準備する
        if (already === false) {
          arrow = this.distributeLoad.clone();
        }

        // 方向を決定する
        const key: string = "w" + direction;

        // 配置位置（その他の荷重とぶつからない位置）を決定する
        let offset = 0;
        for (const a of target[key]) {
          if (a.visible === false) {
            continue;
          }
          const child: any = a.getObjectByName("child");
          const mesh: any = child.getObjectByName("face");
          const face_geo = mesh.geometry;
          const points = face_geo.vertices;
          const h = Math.abs(points[1].y - points[3].y);
          if (P1 + P2 > 0) {
            // プラス側にオフセット
            offset += h;
          } else {
            // マイナス側にオフセット
            offset -= h;
          }
        }
        // 荷重を編集する
        this.distributeLoad.change(
          arrow,
          nodei,
          nodej,
          localAxis,
          key,
          load.L1,
          load.L2,
          P1,
          P2,
          offset,
          scale
        );

        // リストに登録する
        target[key].push(arrow);
        if (already === false) {
          this.scene.add(arrow);
        }
        this.memberLoadList[m] = target;
        return; // sasa
      }
    }
  }


  public visibleChange(flag: boolean, gui: boolean): void {
    console.log("three load!", "visible", "pass");
    return; // sasa
    // 非表示にする
    if (flag === false) {
      this.DisableData();
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
      return;
    }

    // 表示する
    this.changeData(0);
    this.isVisible.object = true;
  }

  // guiを表示する
  private guiEnable(): void {
    console.log("three load!", "guiEnable");

    if (!("LoadScale" in this.gui)) {
      const gui_step: number = 1;
      this.gui["LoadScale"] = this.scene.gui
        .add(this.params, "LoadScale", 0, 200)
        .step(gui_step)
        .onChange((value) => {
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
    return this.nodeThree.baseScale * 10;
  }





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
    // 要素荷重のスケールを変更する
  }

  // #endregion

  // #region データをクリアする


  private DisableData(): void {
      // 既に存在する荷重を非表示にする
    this.ClearNodeLoad();
    this.ClearMemberLoad();
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
}
