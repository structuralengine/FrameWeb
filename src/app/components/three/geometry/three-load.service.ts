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

  // 荷重を再設定する
  public ClearData(): void {
    // 荷重を全部削除する
    for (const id of Object.keys(this.AllCaseLoadList)) {
      this.removeCase(id);
    }

    this.AllCaseLoadList = {};
    this.currentIndex = null;

  }

  // ファイルを読み込むなど、再セットする
  public reSetData(): void {

    this.ClearData();

    // ファイルを開いたときの処理
    // 荷重を作成する
    for (const id of Object.keys(this.load.load)) {
      this.addCase(id);
    }

    // 格点データを入手
    const nodeData = this.node.getNodeJson(0);
    if (Object.keys(nodeData).length <= 0) {
      return; // 格点がなければ 以降の処理は行わない
    }
    // 節点荷重データを入手
    const nodeLoadData = this.load.getNodeLoadJson(0);
    // 要素データを入手
    const memberData = this.member.getMemberJson(0);
    // 要素荷重データを入手
    const memberLoadData = (Object.keys(memberData).length > 0) ? this.load.getMemberLoadJson(0, this.currentIndex) : {};

    // 荷重図を非表示のまま作成する
    for (const id of Object.keys(this.AllCaseLoadList)) {

      const LoadList = this.AllCaseLoadList[id];
      this.currentIndex = id; // カレントデータをセット

      // 節点荷重 --------------------------------------------
      const targetNodeLoad = nodeLoadData[id];
      // 節点荷重の最大値を調べる
      this.setMaxNodeLoad(targetNodeLoad);
      // 節点荷重を作成する
      this.createPointLoad(
        targetNodeLoad,
        nodeData,
        LoadList.ThreeObject,
        LoadList.pointLoadList
      );

      // 要素荷重 --------------------------------------------
      if (Object.keys(memberData).length > 0) {
        const targetMemberLoad = memberLoadData[id];
        // 要素荷重の最大値を調べる
        this.setMaxMemberLoad(targetMemberLoad);      
        // 要素荷重を作成する
        this.createMemberLoad(
          targetMemberLoad,
          nodeData,
          memberData,
          LoadList.ThreeObject,
          LoadList.memberLoadList
        );
      }

      // 重なりを調整する
      this.setOffset();
 
    }


  }

  // 表示ケースを変更する
  public changeCase(changeCase: number): void {
    const id: string = changeCase.toString();

    if (this.currentIndex === id) {
      // 同じなら何もしない
      return;
    }

    if (changeCase < 1) {
      // 非表示にして終わる
      for (const key of Object.keys(this.AllCaseLoadList)) {
        const targetLoad = this.AllCaseLoadList[key];
        const ThreeObject: THREE.Object3D = targetLoad.ThreeObject;
        ThreeObject.visible = false;
      }
      this.scene.render();
      this.currentIndex = id;
      return;
    }

    // 初めての荷重ケースが呼び出された場合
    if (!(id in this.AllCaseLoadList)) {
      this.addCase(id);
    }

    // 荷重の表示非表示を切り替える
    for (const key of Object.keys(this.AllCaseLoadList)) {
      const targetLoad = this.AllCaseLoadList[key];
      const ThreeObject: THREE.Object3D = targetLoad.ThreeObject;
      ThreeObject.visible = key === id ? true : false;
    }

    // カレントデータをセット
    this.currentIndex = id;

    this.scene.render();
  }

  // ケースを追加する
  private addCase(id: string): void {
    const ThreeObject = new THREE.Object3D();
    ThreeObject.name = id;
    ThreeObject.visible = false; // ファイルを読んだ時点では、全ケース非表示
    this.AllCaseLoadList[id] = {
      ThreeObject,
      pointLoadList: {},
      memberLoadList: {},
      pMax: 0, // 最も大きい集中荷重値
      mMax: 0, // 最も大きいモーメント
      wMax: 0 // 最も大きい分布荷重
    };

    this.scene.add(ThreeObject); // シーンに追加
  }

  // ケースの荷重図を消去する
  private removeCase(id: string): void {
    if (!(id in this.AllCaseLoadList)) {
      return;
    }

    const data = this.AllCaseLoadList[id];
    const ThreeObject = data.ThreeObject;
    this.scene.remove(ThreeObject);

    delete this.AllCaseLoadList[id];
  }

  public changeData(row: number = -1): void {

    // データになカレントデータがなければ
    if (!(this.currentIndex in this.load.load)) {
      this.removeCase(this.currentIndex);
      return;
    }

    const LoadList = this.AllCaseLoadList[this.currentIndex];

    // 格点データを入手
    const nodeData = this.node.getNodeJson(0);
    if (Object.keys(nodeData).length <= 0) {
      return; // 格点がなければ 以降の処理は行わない
    }

    // 節点荷重データを入手
    const nodeLoadData = this.load.getNodeLoadJson(0, this.currentIndex);

    if (this.currentIndex in nodeLoadData) {
      // 節点荷重の最大値を調べる
      const tempNodeLoad = nodeLoadData[this.currentIndex];
      this.setMaxNodeLoad(tempNodeLoad);

      // 対象業(row) に入力されている部材番号を調べる
      let targetNodeLoad = [];
      for (const load of tempNodeLoad) {
        if (load.row === row) {
          targetNodeLoad.push(load);
        }
      }
      for (const key of Object.keys(LoadList.pointLoadList)) {
        const list = LoadList.pointLoadList[key];
        for (const k of ["tx", "ty", "tz", "rx", "ry", "rz"]) {
          for (let i = list[k].length - 1; i >= 0; i--) {
            const item = list[k][i];
            if (item.row === row) {
              LoadList.ThreeObject.remove(item);
              list[k].splice(i, 1);
            }
          }
        }
      }
      
      this.createPointLoad(
        targetNodeLoad,
        nodeData,
        LoadList.ThreeObject,
        LoadList.pointLoadList
      );
    } else {
      // ケースが存在しなかった
      for (const key of Object.keys(LoadList.pointLoadList)) {
        for (const item of LoadList.pointLoadList[key]) {
          LoadList.ThreeObject.remove(item);
        }
        LoadList.pointLoadList[key] = [];
      }
    }

    // 要素データを入手
    const memberData = this.member.getMemberJson(0);
    if (Object.keys(memberData).length <= 0) {
      return; //要素がなければ 以降の処理は行わない
    }

    // 要素荷重データを入手
    const memberLoadData = this.load.getMemberLoadJson(0, this.currentIndex);

    if (this.currentIndex in memberLoadData) {
      // 対象業(row) に入力されている部材番号を調べる
      const tempMemberLoad = memberLoadData[this.currentIndex];
      // 要素荷重の最大値を調べる
      this.setMaxMemberLoad(tempMemberLoad);

      let targetMemberLoad = [];

      // 変更する行に指定がある場合
      for (const load of tempMemberLoad) {
        if (load.row === row) {
          targetMemberLoad.push(load);
        }
      }
      for (const key of Object.keys(LoadList.memberLoadList)) {
        const list = LoadList.memberLoadList[key];
        for (const k of ["wgy", "wgz", "wr", "wx", "wy", "wz"]) {
          for (let i = list[k].length - 1; i >= 0; i--) {
            const item = list[k][i];
            if (item.row === row) {
              LoadList.ThreeObject.remove(item);
              list[k].splice(i, 1);
            }
          }
        }
      }

      this.createMemberLoad(
        targetMemberLoad,
        nodeData,
        memberData,
        LoadList.ThreeObject,
        LoadList.memberLoadList
      );
    } else {
      // ケースが存在しなかった
      for (const key of Object.keys(LoadList.memberLoadList)) {
        for (const item of LoadList.memberLoadList[key]) {
          LoadList.ThreeObject.remove(item);
        }
        LoadList.memberLoadList[key] = [];
      }
    }

    // サイズや重なりを調整する
    this.onResize();
    // レンダリング
    this.scene.render();
    // 表示フラグを ON にする
    this.isVisible.object = true;
  }

  // 節点荷重の矢印を描く
  private createPointLoad(
    targetNodeLoad: any[],
    nodeData: object,
    ThreeObject: THREE.Object3D,
    pointLoadList: any
  ): void {
    if (targetNodeLoad === undefined) {
      return;
    }

    // 集中荷重の矢印をシーンに追加する
    for (const load of targetNodeLoad) {
      const n = load.n.toString();

      // 節点座標 を 取得する
      if (!(n in nodeData)) {
        continue;
      }
      const node = nodeData[n];

      // リストに登録する
      const target =
        n in pointLoadList
          ? pointLoadList[n]
          : { tx: [], ty: [], tz: [], rx: [], ry: [], rz: [] };

      // 集中荷重 ---------------------------------
      for (let key of ["tx", "ty", "tz"]) {
        const value = load[key];
        if (value === 0) {
          continue;
        }


        // 荷重を編集する
        // 長さを決める
        // scale = 1 の時 長さlength = maxLengthとなる
        const arrow = this.pointLoad.create(node, 0, value, 1, key);

        // リストに登録する
        arrow["row"] = load.row;
        target[key].push(arrow);
        ThreeObject.add(arrow);

        pointLoadList[n] = target;
      }

      // 曲げモーメント荷重 -------------------------
      for (let key of ["rx", "ry", "rz"]) {
        const value = load[key];
        if (value === 0) {
          continue;
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
        const scale = 1; //Math.abs(value) * 0.1;
        const Radius: number = scale;
        const arrow = this.momentLoad.create(node, offset, value, Radius, key);

        // リストに登録する
        arrow["row"] = load.row;
        target[key].push(arrow);
        ThreeObject.add(arrow);

        pointLoadList[n] = target;
      }
    }
  }

  // 節点荷重の最大値を調べる
  private setMaxNodeLoad(targetNodeLoad = null): void {

    const LoadList = this.AllCaseLoadList[this.currentIndex];
    LoadList.pMax = 0; // 最も大きい集中荷重値
    LoadList.mMax = 0; // 最も大きいモーメント

    if (targetNodeLoad === null) {
      const nodeLoadData = this.load.getNodeLoadJson(0, this.currentIndex);
      if (this.currentIndex in nodeLoadData) {
        targetNodeLoad = nodeLoadData[this.currentIndex];
      } else {
        return;
      }
    }

    targetNodeLoad.forEach((load) => {
      LoadList.pMax = Math.max(
        LoadList.pMax,
        Math.abs(load.tx),
        Math.abs(load.ty),
        Math.abs(load.tz)
      );
    });
    targetNodeLoad.forEach((load) => {
      LoadList.mMax = Math.max(
        LoadList.mMax,
        Math.abs(load.rx),
        Math.abs(load.ry),
        Math.abs(load.rz)
      );
    });
  }

  // 要素荷重の最大値を調べる
  private setMaxMemberLoad(targetMemberLoad = null): void {
    // スケールを決定する 最大の荷重を 1とする
    const LoadList = this.AllCaseLoadList[this.currentIndex];
    LoadList.wMax = 0;

    if (targetMemberLoad === null) {
      const memberLoadData = this.load.getMemberLoadJson(0, this.currentIndex);
      if (this.currentIndex in memberLoadData) {
        targetMemberLoad = memberLoadData[this.currentIndex];
      } else {
        return;
      }
    }

    // 値をスケールの決定に入れると入力を変更する度に全部書き直さなくてはならない
    targetMemberLoad.forEach((load) => {
      LoadList.wMax = Math.max(LoadList.wMax, Math.abs(load.P1));
      LoadList.wMax = Math.max(LoadList.wMax, Math.abs(load.P2));
    });
  }

  // 要素荷重の矢印を描く
  private createMemberLoad(
    memberLoadData: any[],
    nodeData: object,
    memberData: object,
    ThreeObject: THREE.Object3D,
    memberLoadList: any
  ): void {
    if (memberLoadData === undefined) {
      return;
    }

    // memberLoadData情報を書き換える可能性があるので、複製する
    const targetMemberLoad = JSON.parse(
      JSON.stringify({
        temp: memberLoadData,
      })
    ).temp;

    // 分布荷重の矢印をシーンに追加する
    for (const load of targetMemberLoad) {
      // 部材データを集計する
      if (!(load.m in memberData)) {
        continue;
      }
      const mNo: string = load.m.toString();
      const m = memberData[mNo];
      // 節点データを集計する
      if (!(m.ni in nodeData && m.nj in nodeData)) {
        continue;
      }

      if (load.P1 === 0 && load.P2 === 0) {
        continue;
      }

      // 部材の座標軸を取得
      const i = nodeData[m.ni];
      const j = nodeData[m.nj];
      const nodei = new THREE.Vector3(i.x, i.y, i.z);
      const nodej = new THREE.Vector3(j.x, j.y, j.z);
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
        mNo in memberLoadList
          ? memberLoadList[mNo]
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
      if (load.mark === 2) {
        if (
          direction === "y" ||
          direction === "z" ||
          direction === "gx" ||
          direction === "gy" ||
          direction === "gz"
        ) {
          // 方向を決定する
          const dir: string = "w" + direction;

          // 荷重を編集する
          const arrow = this.distributeLoad.create(
            nodei,
            nodej,
            localAxis,
            dir,
            load.L1,
            load.L2,
            P1,
            P2,
            0,
            1
          );

          // リストに登録する
          arrow["row"] = load.row;
          target[dir].push(arrow);
          ThreeObject.add(arrow);
          memberLoadList[mNo] = target;
        } else if (direction === "x") {
          // 軸方向分布荷重
        }
      } else if (load.mark === 1) {
        // 集中荷重荷重
      }
    }
  }

  public visibleChange(flag: boolean, gui: boolean): void {
    console.log("three load!", "visible", "pass");

    // 非表示にする
    if (flag === false) {
      this.guiDisable();
      this.changeCase(-1);
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
    this.changeCase(1);
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

  // スケールを反映する
  private onResize(): void {
    if (!(this.currentIndex in this.AllCaseLoadList)) {
      return;
    }
    const loadList = this.AllCaseLoadList[this.currentIndex];
    const scale1: number = this.LoadScale / 100;

    const pointLoadList = loadList.pointLoadList;
    for (const n of Object.keys(pointLoadList)) {
      const dict = pointLoadList[n];
      for (let direction of Object.keys(dict)) {
        for (const item of dict[direction]) {
          if (item.visible == false) {
            continue;
          }

          /* 配置位置（その他の荷重とぶつからない位置）を決定する
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
          */

          const scale2: number = this.baseScale();
          let scale3: number = item.value;
          if (item.name === "PointLoad") {
            scale3 /= loadList.pMax;
          } else if (item.name === "MomentLoad") {
            scale3 /= loadList.mMax;
          }
          const scale: number = scale1 * scale2 * scale3;
          item.scale.set(scale, scale, scale);
        }
      }
    }

    // 要素荷重のスケールを変更する
    const memberLoadList = loadList.memberLoadList;
    for (const m of Object.keys(memberLoadList)) {
      const dict = memberLoadList[m];
      for (const direction of ["wgy", "wgz", "wr", "wx", "wy", "wz"]) {
        for (const item of dict[direction]) {
          if (item.visible == false) {
            continue;
          }
          /* 配置位置（その他の荷重とぶつからない位置）を決定する
          let offset = 0;
          for (const a of target[dir]) {
            if (a.visible === false) {
              continue;
            }

            const group: any = a.getObjectByName("group");
            const Pmax: number = a.Pmax;
            if (P1 + P2 > 0 && Pmax > 0) {
              offset += a.scale.y; // プラス側にオフセット
            } else if (P1 + P2 < 0 && Pmax < 0) {
              offset -= a.scale.y; // マイナス側にオフセット
            }
          }
          */
          const scale2: number = this.baseScale();
          let scale3: number = Math.abs(item.Pmax);

          if (item.name === "DistributeLoad") {
            scale3 /= loadList.wMax;

            const scale: number = scale1 * scale2 * scale3;
            item.scale.set(1, scale, scale);
          } else if (item.name === "") {
          }
        }
      }
    }

    //this.scene.render();
  }

  // スケールを反映する
  private setOffset(): void {

    if (!(this.currentIndex in this.AllCaseLoadList)) {
      return;
    }

    const loadList = this.AllCaseLoadList[this.currentIndex];

    const pointLoadList = loadList.pointLoadList;
    for (const n of Object.keys(pointLoadList)) {
      const dict = pointLoadList[n];
      for (let direction of Object.keys(dict)) {
        for (const item of dict[direction]) {
          if (item.visible == false) {
            continue;
          }

          /* 配置位置（その他の荷重とぶつからない位置）を決定する
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
          */

          const scale2: number = this.baseScale();
          let scale3: number = item.value;
          if (item.name === "PointLoad") {
            scale3 /= loadList.pMax;
          } else if (item.name === "MomentLoad") {
            scale3 /= loadList.mMax;
          }
          const scale: number = scale1 * scale2 * scale3;
          item.scale.set(scale, scale, scale);
        }
      }
    }

    // 要素荷重のスケールを変更する
    const memberLoadList = loadList.memberLoadList;
    for (const m of Object.keys(memberLoadList)) {
      const dict = memberLoadList[m];
      for (const direction of ["wgy", "wgz", "wr", "wx", "wy", "wz"]) {
        for (const item of dict[direction]) {
          if (item.visible == false) {
            continue;
          }
          /* 配置位置（その他の荷重とぶつからない位置）を決定する
          let offset = 0;
          for (const a of target[dir]) {
            if (a.visible === false) {
              continue;
            }

            const group: any = a.getObjectByName("group");
            const Pmax: number = a.Pmax;
            if (P1 + P2 > 0 && Pmax > 0) {
              offset += a.scale.y; // プラス側にオフセット
            } else if (P1 + P2 < 0 && Pmax < 0) {
              offset -= a.scale.y; // マイナス側にオフセット
            }
          }
          */
          const scale2: number = this.baseScale();
          let scale3: number = Math.abs(item.Pmax);

          if (item.name === "DistributeLoad") {
            scale3 /= loadList.wMax;

            const scale: number = scale1 * scale2 * scale3;
            item.scale.set(1, scale, scale);
          } else if (item.name === "") {
          }
        }
      }
    }

  }

}
