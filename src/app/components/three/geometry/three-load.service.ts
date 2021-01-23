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

 
}
