import { Injectable } from "@angular/core";
import { SceneService } from "../../scene.service";
import { InputNodesService } from "../../../input/input-nodes/input-nodes.service";
import { InputMembersService } from "../../../input/input-members/input-members.service";
import { InputLoadService } from "../../../input/input-load/input-load.service";
import { ThreeNodesService } from "../three-nodes.service";

import * as THREE from "three";
import { ThreeMembersService } from "../three-members.service";

import { ThreeLoadText } from "./three-load-text";
import { ThreeLoadDimension } from "./three-load-dimension";
import { ThreeLoadPoint } from "./three-load-point";
import { ThreeLoadDistribute } from "./three-load-distribute";
import { ThreeLoadAxial } from "./three-load-axial";
import { ThreeLoadTorsion } from "./three-load-torsion";
import { ThreeLoadMoment } from "./three-load-moment";
import { ThreeLoadTemperature } from "./three-load-temperature";
import { ThreeLoadMemberPoint } from "./three-load-member-point";
import { ThreeLoadMemberMoment } from "./three-load-member-moment";
import { DataHelperModule } from "src/app/providers/data-helper.module";

@Injectable({
  providedIn: "root",
})
export class ThreeLoadService {
  private isVisible = { object: false, gui: false };
  private selectionItem: THREE.Object3D; // 選択中のアイテム

  // 全ケースの荷重を保存
  private AllCaseLoadList: {};
  private currentIndex: string;
  private currentIndex_child1: string;
  private currentIndex_child2: string;

  // 荷重のテンプレート
  private distributeLoad: ThreeLoadDistribute; // 分布荷重のテンプレート
  private axialLoad: ThreeLoadAxial; // 軸方向荷重のテンプレート
  private torsionLoad: ThreeLoadTorsion; // ねじり分布荷重のテンプレート
  private temperatureLoad: ThreeLoadTemperature; // 温度荷重のテンプレート
  private pointLoad: ThreeLoadPoint; // 節点荷重のテンプレート
  private momentLoad: ThreeLoadMoment; // 節点モーメントのテンプレート
  private memberPointLoad: ThreeLoadMemberPoint; // 部材の途中にある節点荷重のテンプレート
  private memberMomentLoad: ThreeLoadMemberMoment; // 部材の途中にある節点モーメントのテンプレート

  // 大きさを調整するためのスケール
  private LoadScale: number;
  private params: any; // GUIの表示制御
  private gui: any;

  private nodeData: any;    // 荷重図作成時の 節点データ
  private memberData: any;  // 荷重図作成時の 要素データ

  private newNodeData: any;    // 変更された 節点データ
  private newMemberData: any;  // 変更された 要素データ

  // 初期化
  constructor(
    private scene: SceneService,
    private helper: DataHelperModule,
    private nodeThree: ThreeNodesService,
    private node: InputNodesService,
    private member: InputMembersService,
    private load: InputLoadService,
    private three_member: ThreeMembersService
  ) {
    // フォントをロード
    const loader = new THREE.FontLoader();
    loader.load("./assets/fonts/helvetiker_regular.typeface.json", (font) => {
      // 荷重の雛形をあらかじめ生成する
      const text = new ThreeLoadText(font);
      const dim = new ThreeLoadDimension(text); //寸法戦を扱うモジュール
      this.pointLoad = new ThreeLoadPoint(text); // 節点荷重のテンプレート
      this.momentLoad = new ThreeLoadMoment(text); // 節点モーメントのテンプレート
      this.distributeLoad = new ThreeLoadDistribute(text, dim); // 分布荷重のテンプレート
      this.axialLoad = new ThreeLoadAxial(text, dim); // 軸方向荷重のテンプレート
      this.torsionLoad = new ThreeLoadTorsion(text, dim, this.momentLoad); // ねじり分布荷重のテンプレート
      this.temperatureLoad = new ThreeLoadTemperature(text, dim); // 温度荷重のテンプレート
      this.memberPointLoad = new ThreeLoadMemberPoint(text, dim, this.pointLoad); // 部材の途中にある節点荷重のテンプレート
      this.memberMomentLoad = new ThreeLoadMemberMoment(text, dim, this.momentLoad); // 部材の途中にある節点モーメントのテンプレート
    });
    this.AllCaseLoadList = {};
    this.currentIndex = null;
    this.currentIndex_child1 = null;
    this.currentIndex_child2 = null;

    // 節点、部材データ
    this.nodeData = null;
    this.memberData = null;
    this.newNodeData = null;
    this.newMemberData = null;

    // gui
    this.LoadScale = 100;
    this.params = {
      LoadScale: this.LoadScale,
    };
    this.gui = {};
  }

  // 荷重を再設定する
  public ClearData(): void {
    // 荷重を全部削除する
    for (const id of Object.keys(this.AllCaseLoadList)) {
      this.removeCase(id);
    }

    this.AllCaseLoadList = {};
    this.currentIndex = null;

    // 節点、部材データ
    this.nodeData = null;
    this.memberData = null;
    this.newNodeData = null;
    this.newMemberData = null;
  }

  // ファイルを読み込むなど、りセットする
  public ResetData(): void {

    this.ClearData();

    // ファイルを開いたときの処理
    // 荷重を作成する
    for (const id of Object.keys(this.load.load)) {
      this.addCase(id);
    }

    // 格点データを入手
    this.nodeData = this.node.getNodeJson(0);
    this.newNodeData = null;
    if (Object.keys(this.nodeData).length <= 0) {
      return; // 格点がなければ 以降の処理は行わない
    }
    // 節点荷重データを入手
    const nodeLoadData = this.load.getNodeLoadJson(0);

    // 荷重図を非表示のまま作成する
    for (const id of Object.keys(this.AllCaseLoadList)) {

      const LoadList = this.AllCaseLoadList[id];
      this.currentIndex = id; // カレントデータをセット

      // 節点荷重 --------------------------------------------
      if (id in nodeLoadData) {
        const targetNodeLoad = nodeLoadData[id];
        // 節点荷重の最大値を調べる
        this.setMaxNodeLoad(targetNodeLoad);
        // 節点荷重を作成する
        this.createPointLoad(
          targetNodeLoad,
          this.nodeData,
          LoadList.ThreeObject,
          LoadList.pointLoadList
        );
      }

      // 要素荷重 --------------------------------------------
      // 要素データを入手
      this.memberData = this.member.getMemberJson(0);
      this.newMemberData = null;
      if (Object.keys(this.memberData).length > 0) {
        // 要素荷重データを入手
        const memberLoadData = this.load.getMemberLoadJson(0);
        if (id in memberLoadData) {
          const targetMemberLoad = memberLoadData[id];
          // 要素荷重の最大値を調べる
          this.setMaxMemberLoad(targetMemberLoad);
          // 要素荷重を作成する
          this.createMemberLoad(
            targetMemberLoad,
            this.nodeData,
            this.memberData,
            LoadList.ThreeObject,
            LoadList.memberLoadList
          );
        }
      }

      // 重なりを調整する
      this.setOffset(id);
      // 重なりを調整する
      this.onResize(id);
    }

    this.currentIndex = '-1';
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
      wMax: 0, // 最も大きい分布荷重
      rMax: 0, // 最も大きいねじり分布荷重
      qMax: 0  // 最も大きい軸方向分布荷重
    };

    this.scene.add(ThreeObject); // シーンに追加
  }

  //シートの選択行が指すオブジェクトをハイライトする
  public selectChange(index_row, index_column): void {
    const id: string = this.currentIndex;
    //console.log("three-load.service.ts selectChange index =", index_row, index_column);
    //console.log(this.AllCaseLoadList[id]);

    if (this.currentIndex_child1 === index_row) {
      if (this.currentIndex_child2 === index_column) {
        //選択行の変更がないとき，何もしない
        return
      }
    }

    let column = "";
    if (index_column >= 0 && index_column <= 8) {
      //何もなし
    } else if (index_column === 9) {
      column = "tx"
    } else if (index_column === 10) {
      column = "ty"
    } else if (index_column === 11) {
      column = "tz"
    } else if (index_column === 12) {
      column = "rx"
    } else if (index_column === 13) {
      column = "ry"
    } else if (index_column === 14) {
      column = "rz"
    } else {
      //console.log("-----error-----three-load.service.ts(selectChenge)-----error-----");
    }

    //全てのハイライトを元に戻し，選択行のオブジェクトのみハイライトを適応する
    for (let item of this.AllCaseLoadList[id].ThreeObject.children) {

      //全てのオブジェクトをデフォルトの状態にする
      if (item.name.includes('AxialLoad-')){
        this.axialLoad.setColor(item, "clear");
      } else if (item.name.includes('DistributeLoad')){
        this.distributeLoad.setColor(item, "clear");
      } else if (item.name.includes('MemberPointLoad')){
        this.memberPointLoad.setColor(item, "clear");
      } else if (item.name.includes('MemberMomentLoad')){
        this.memberMomentLoad.setColor(item, "clear");
      } else if (item.name.includes('MomentLoad')){
        this.momentLoad.setColor(item, "clear");
      } else if (item.name.includes('PointLoad')){
        this.pointLoad.setColor(item, "clear");
      } else if (item.name.includes('TemperatureLoad')) {
        this.temperatureLoad.setColor(item, "clear");
      } else if (item.name.includes('TorsionLoad')) {
        this.torsionLoad.setColor(item, "clear");
      }

      //カレント行のオブジェクトをハイライトする
      //列によりハイライトするオブジェクトが変化する場合があるため，分岐により制御
      if (index_column >= 0 && index_column <= 7) {
        if (item.name === 'AxialLoad-' + index_row.toString()) {
          this.axialLoad.setColor(item, "select");
        } else if ( item.name === 'DistributeLoad-' + index_row.toString() + '-y' ||
                    item.name === 'DistributeLoad-' + index_row.toString() + '-z' ) {
          this.distributeLoad.setColor(item, "select");
        } else if ( item.name === 'MemberPointLoad-' + index_row.toString() + '-x' ||
                    item.name === 'MemberPointLoad-' + index_row.toString() + '-y' ||
                    item.name === 'MemberPointLoad-' + index_row.toString() + '-z' ) {
          this.memberPointLoad.setColor(item, "select");
        } else if ( item.name === 'MemberMomentLoad-' + index_row.toString() + '-x' ||
                    item.name === 'MemberMomentLoad-' + index_row.toString() + '-y' ||
                    item.name === 'MemberMomentLoad-' + index_row.toString() + '-z' ) {
          this.memberMomentLoad.setColor(item, "select");
        } else if (item.name === 'TemperatureLoad-' + index_row.toString()) {
          this.temperatureLoad.setColor(item, "select");
        } else if (item.name === 'TorsionLoad-' + index_row.toString()) {
          this.torsionLoad.setColor(item, "select");
        }

      } else if (index_column === 8) {
        if (item.name.includes('MomentLoad-' + index_row.toString() + '-')){
          this.momentLoad.setColor(item, "select");
        } else if (item.name.includes('PointLoad-' + index_row.toString() + '-')) {
          this.pointLoad.setColor(item, "select");
        }

      } else if (index_column >= 9 && index_column <= 14) {
        if (item.name === 'MomentLoad-' + index_row.toString() + '-' + column.toString()) {
          this.momentLoad.setColor(item, "select");
        } else if (item.name === 'PointLoad-' + index_row.toString() + '-' + column.toString()) {
          this.pointLoad.setColor(item, "select");
        }
      }
    }
    
    this.currentIndex_child1 = index_row;
    this.currentIndex_child2 = index_column;

    this.scene.render();
  }

  // ケースの荷重図を消去する
  public removeCase(id: string): void {
    if (!(id in this.AllCaseLoadList)) {
      return;
    }

    const data = this.AllCaseLoadList[id];
    const ThreeObject = data.ThreeObject;
    this.scene.remove(ThreeObject);

    delete this.AllCaseLoadList[id];

    this.scene.render();
  }

  // 節点の入力が変更された場合 新しい入力データを保持しておく
  public changeNode(jsonData): void {
    this.newNodeData = jsonData;
  }

  // 要素の入力が変更された場合 新しい入力データを保持しておく
  public changeMember(jsonData): void {
    this.newMemberData = jsonData;
  }

  // 節点や要素が変更された部分を描きなおす
  public reDrawNodeMember(): void {

    if (this.newNodeData === null && this.newMemberData === null) {
      return;
    }

    // 格点の変わった部分を探す
    const changeNodeList = {};
    if(this.nodeData !== null ){
      if (this.newNodeData !== null) {
        for (const key of Object.keys(this.nodeData)) {
          if (!(key in this.newNodeData)) {
            // 古い情報にあって新しい情報にない節点
            changeNodeList[key] = 'delete';
          }
        }
        for (const key of Object.keys(this.newNodeData)) {
          if (!(key in this.nodeData)) {
            // 新しい情報にあって古い情報にない節点
            changeNodeList[key] = 'add';
            continue;
          }
          const oldNode = this.nodeData[key];
          const newNode = this.newNodeData[key];
          if (oldNode.x !== newNode.x || oldNode.y !== newNode.y || oldNode.z !== newNode.z) {
            changeNodeList[key] = 'change';
          }
        }
      }
    } 

    const changeMemberList = {};
    if(this.memberData !== null){
      // 部材の変わった部分を探す
      if (this.newMemberData !== null) {
        for (const key of Object.keys(this.memberData)) {
          if (!(key in this.newMemberData)) {
            // 古い情報にあって新しい情報にない節点
            changeMemberList[key] = 'delete';
          }
        }
        for (const key of Object.keys(this.newMemberData)) {
          if (!(key in this.memberData)) {
            // 新しい情報にあって古い情報にない節点
            changeMemberList[key] = 'add';
            continue;
          }
          const oldMember = this.memberData[key];
          const newMember = this.newMemberData[key];
          if (oldMember.ni !== newMember.ni ||
            oldMember.nj !== newMember.nj) {
            changeMemberList[key] = 'change';
          }
        }
      }
    }
    // 格点の変更によって影響のある部材を特定する
    const targetMemberData = (this.newMemberData !== null) ? this.newMemberData : this.memberData;
    for (const key of Object.keys(targetMemberData)) {
      const newMember = targetMemberData[key];
      if (newMember.ni in changeNodeList || newMember.nj in changeNodeList) {
        changeMemberList[key] = 'node change'
      }
    }

    // 荷重を変更する
    const oldIndex = this.currentIndex;
    this.nodeData = (this.newNodeData !== null) ? this.newNodeData : this.nodeData;
    this.memberData = (this.newMemberData !== null) ? this.newMemberData : this.memberData;
    // 荷重データを入手
    const nodeLoadData = this.load.getNodeLoadJson(0);
    const memberLoadData = this.load.getMemberLoadJson(0);
    // 荷重を修正
    for (const id of Object.keys(this.AllCaseLoadList)) {
      this.currentIndex = id;
      let editFlg = false;
      if (this.currentIndex in nodeLoadData) {
        for (const load of nodeLoadData[this.currentIndex]) {
          if (load.n.toString() in changeNodeList)
            this.changeNodeLode(load.row, nodeLoadData);
          editFlg = true;
        }
      }
      if (this.currentIndex in memberLoadData) {
        for (const load of memberLoadData[this.currentIndex]) {
          if (load.m.toString() in changeMemberList) {
            this.changeMemberLode(load.row, memberLoadData);
            editFlg = true;
          }
        }
      }
      if (editFlg === true) {
        this.setOffset();
        this.onResize();
      }
    }

    this.newNodeData = null;
    this.newMemberData = null;
    this.currentIndex = oldIndex;
  }

  // 荷重の入力が変更された場合
  public changeData(row: number): void {

    // データになカレントデータがなければ
    if (!(this.currentIndex in this.load.load)) {
      this.removeCase(this.currentIndex);
      return;
    }

    // 格点データを入手
    //const nodeData = this.node.getNodeJson(0);
    if (Object.keys(this.nodeData).length <= 0) {
      return; // 格点がなければ 以降の処理は行わない
    }

    // 節点荷重データを入手
    const nodeLoadData = this.load.getNodeLoadJson(0, this.currentIndex);
    // 節点荷重を変更
    this.changeNodeLode(row, nodeLoadData);


    // 要素データを入手
    //const memberData = this.member.getMemberJson(0);
    if (Object.keys(this.memberData).length <= 0) {
      return; //要素がなければ 以降の処理は行わない
    }

    // 要素荷重データを入手
    const memberLoadData = this.load.getMemberLoadJson(0, this.currentIndex);
    // 要素荷重を変更
    this.changeMemberLode(row, memberLoadData);

    // 重なりを調整する
    this.setOffset();
    // サイズを調整する
    this.onResize();
    // レンダリング
    this.scene.render();
    // 表示フラグを ON にする
    this.isVisible.object = true;
  }

  // 節点荷重を変更
  private changeNodeLode(row: number, nodeLoadData: any): void {

    const LoadList = this.AllCaseLoadList[this.currentIndex];

    if (this.currentIndex in nodeLoadData) {
      // 節点荷重の最大値を調べる
      const tempNodeLoad = nodeLoadData[this.currentIndex];
      this.setMaxNodeLoad(tempNodeLoad);

      // 対象行(row) に入力されている部材番号を調べる
      const targetNodeLoad = tempNodeLoad.filter(load => load.row === row);
      // 同じ行にあった荷重を一旦削除
      /*for (const n of Object.keys(LoadList.pointLoadList)) {
        const list = LoadList.pointLoadList[n];
        ["tx", "ty", "tz", "rx", "ry", "rz"].forEach(k => {
          for (let i = list[k].length - 1; i >= 0; i--) {
            const item = list[k][i];
            if (item.row === row) {
              LoadList.ThreeObject.remove(item);
              list[k].splice(i, 1);
            }
          }
        });
      }*/
      for (const key of Object.keys(LoadList.pointLoadList)) { // 格点node
        const list = LoadList.pointLoadList[key];
        for (const key2 of ["tx", "ty", "tz", "rx", "ry", "rz"]) {
          for (let i = list[key2].length - 1; i >= 0; i--) {
            const item = list[key2][i];
            if (item.row === row) {
              LoadList.ThreeObject.remove(item);
              list[key2].splice(i, 1);
            }
          }
        }
      }

      this.createPointLoad(
        targetNodeLoad,
        this.nodeData,
        LoadList.ThreeObject,
        LoadList.pointLoadList
      );
    } else {
      // ケースが存在しなかった
      for (const key of Object.keys(LoadList.pointLoadList)) {//格点node
        const list = LoadList.pointLoadList[key];
        for (const key2 of ["tx", "ty", "tz", "rx", "ry", "rz"]) {
          for (const item of list[key2]) {
            LoadList.ThreeObject.remove(item);
          }
        }
        LoadList.pointLoadList[key] = { tx: [], ty: [], tz: [], rx: [], ry: [], rz: [] };
      }
    }
  }

  // 要素荷重を変更
  private changeMemberLode(row: number, memberLoadData: any): void {

    const LoadList = this.AllCaseLoadList[this.currentIndex];

    if (this.currentIndex in memberLoadData) {
      // 対象業(row) に入力されている部材番号を調べる
      const tempMemberLoad = memberLoadData[this.currentIndex];
      // 要素荷重の最大値を調べる
      this.setMaxMemberLoad(tempMemberLoad);

      // 対象行(row) に入力されている部材番号を調べる
      const targetMemberLoad = tempMemberLoad.filter(load => load.row === row);
      // 同じ行にあった荷重を一旦削除
      for (const key of Object.keys(LoadList.memberLoadList)) { // 格点node
        const list = LoadList.memberLoadList[key];
        for (const key2 of ["gy", "gx", "gz", "x", "y", "z", "t", "r"]) {
          for (let i = list[key2].length - 1; i >= 0; i--) {
            const item = list[key2][i];
            if (item.row === row) {
              LoadList.ThreeObject.remove(item);
              list[key2].splice(i, 1);
            }
          }
        }
      }

      this.createMemberLoad(
        targetMemberLoad,
        this.nodeData,
        this.memberData,
        LoadList.ThreeObject,
        LoadList.memberLoadList
      );
    } else {
      // ケースが存在しなかった
      for (const key of Object.keys(LoadList.memberLoadList)) { //格点node
        const list = LoadList.memberLoadList[key];
        for (const key2 of ["gx", "gy", "gz", "x", "y", "z", "t", "r"]) {
          for (const item of list[key2]) {
            LoadList.ThreeObject.remove(item);
          }
        }
        LoadList.memberLoadList[key] = { gx: [], gy: [], gz: [], x: [], y: [], z: [], t: [], r: [] };
      }
    }
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
      const target = n in pointLoadList ? pointLoadList[n]
      : { tx: [], ty: [], tz: [], rx: [], ry: [], rz: [] };

      // 集中荷重 ---------------------------------
      for (let key of ["tx", "ty", "tz"]) {

        if (load[key] === 0) continue;

        const value = load[key];

        // 荷重を編集する
        // 長さを決める
        // scale = 1 の時 長さlength = maxLengthとなる
        const arrow = this.pointLoad.create(node, 0, value, 1, key, load.row);

        // リストに登録する
        arrow["row"] = load.row;
        target[key].push(arrow);
        ThreeObject.add(arrow);

        // pointLoadList[n] = target;
      }
      // 強制変位(仮：集中荷重と同じとしている) ---------------------------------
      for (let k of ["x", "y", "z"]) {
        const key1 = 'd' + k;
        if (load[key1] === 0) continue;

        const value = load[key1] * 1000;

        const key = 't' + k;
        // 荷重を編集する
        // 長さを決める
        // scale = 1 の時 長さlength = maxLengthとなる
        const arrow = this.pointLoad.create(node, 0, value, 1, key, load.row);

        // リストに登録する
        arrow["row"] = load.row;
        target[key].push(arrow);
        ThreeObject.add(arrow);

        // pointLoadList[n] = target;
      }

      // 曲げモーメント荷重 -------------------------
      for (let key of ["rx", "ry", "rz"]) {

        if (load[key] === 0) continue;

        const value = load[key];

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
        const arrow = this.momentLoad.create(node, offset, value, Radius, key, load.row);

        // リストに登録する
        arrow["row"] = load.row;
        target[key].push(arrow);
        ThreeObject.add(arrow);

        // pointLoadList[n] = target;
      }
      // 強制変位(仮：集中荷重と同じとしている) ---------------------------------
      for (let k of ["x", "y", "z"]) {
        const key1 = 'a' + k;

        if (load[key1] === 0) continue;

        const value = load[key1] * 1000;

        const key = 'r' + k;
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
        const arrow = this.momentLoad.create(node, offset, value, Radius, key, load.row);

        // リストに登録する
        arrow["row"] = load.row;
        target[key].push(arrow);
        ThreeObject.add(arrow);

        // pointLoadList[n] = target;
      }
      pointLoadList[n] = target;


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
      for(const k of ['tx', 'ty', 'tz']){
        if(k in load){
          LoadList.pMax = Math.max(LoadList.pMax, Math.abs(load[k]));
        }
      }
      for(const k of ['dx', 'dy', 'dz']){
        if(k in load){
          LoadList.pMax = Math.max(LoadList.pMax, Math.abs(load[k]*1000));
        }
      }
    });
    targetNodeLoad.forEach((load) => {
      for(const k of ['rx', 'ry', 'rz']){
        if(k in load){
          LoadList.mMax = Math.max(LoadList.mMax, Math.abs(load[k]));
        }
      }
      for(const k of ['ax', 'ay', 'az']){
        if(k in load){
          LoadList.mMax = Math.max(LoadList.mMax, Math.abs(load[k]*1000));
        }
      }      
    });
  }

  // 要素荷重の最大値を調べる
  private setMaxMemberLoad(targetMemberLoad = null): void {
    // スケールを決定する 最大の荷重を 1とする
    const LoadList = this.AllCaseLoadList[this.currentIndex];
    LoadList.wMax = 0;
    LoadList.rMax = 0;
    LoadList.qMax = 0;

    if (targetMemberLoad === null) {
      const memberLoadData = this.load.getMemberLoadJson(0, this.currentIndex);
      if (this.currentIndex in memberLoadData) {
        targetMemberLoad = memberLoadData[this.currentIndex];
      } else {
        return;
      }
    }

    // 値をスケールの決定に入れると入力を変更する度に全部書き直さなくてはならない
    for (const load of targetMemberLoad) {

      const value = Math.max(Math.abs(load.P1), Math.abs(load.P2));

      if (load.mark === 2) {
        if (load.direction === 'r') {
          LoadList.rMax = Math.max(LoadList.rMax, value);
        } else if (load.direction === 'x') {
          LoadList.qMax = Math.max(LoadList.qMax, value);
        } else {
          LoadList.wMax = Math.max(LoadList.wMax, value);
        }
      } else if (load.mark === 1) {
        LoadList.pMax = Math.max(LoadList.pMax, value);
      } else if (load.mark === 11) {
        LoadList.mMax = Math.max(LoadList.mMax, value);
      }
    }

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
        i.x, i.y, i.z, j.x, j.y, j.z, m.cg);

      // リストに登録する
      const target =
        mNo in memberLoadList
          ? memberLoadList[mNo]
          : { localAxis, x: [], y: [], z: [], gx: [], gy: [], gz: [], r: [], t: [] };

      // 荷重値と向き -----------------------------------
      let P1: number = load.P1;
      let P2: number = load.P2;
      let direction: string = load.direction;
      if (direction === null || direction === undefined) {
        direction = '';
      } else {
        direction = direction.trim();
        direction = direction.toLowerCase();
      }
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

      let arrow: THREE.Group = null;

      // 分布荷重 y, z -------------------------------
      // mark=2, direction=x
      if (load.mark === 2) {

        if (direction === "y" || direction === "z" ||
          direction === "gx" || direction === "gy" || direction === "gz") {
          arrow = this.distributeLoad.create(
            nodei, nodej, localAxis,
            direction, load.L1, load.L2, P1, P2, load.row);

        } else if (direction === "r") {
          // ねじり布荷重
          arrow = this.torsionLoad.create(
            nodei, nodej, localAxis,
            direction, load.L1, load.L2, P1, P2, load.row);

        } else if (direction === "x") {
          // 軸方向分布荷重
          arrow = this.axialLoad.create(
            nodei, nodej, localAxis,
            direction, load.L1, load.L2, P1, P2, load.row);
        }
      } else if (load.mark === 9) {
        // 温度荷重
        arrow = this.temperatureLoad.create(
          nodei, nodej, localAxis, P1, load.row);
        direction = 't';

      } else if (load.mark === 1) {
        // 集中荷重荷重
        if (["x", "y", "z", "gx", "gy", "gz"].includes(direction)) {
          arrow = this.memberPointLoad.create(
            nodei, nodej, localAxis,
            direction, load.L1, load.L2, P1, P2, load.row);
        }
      } else if (load.mark === 11) {
        // モーメント荷重
        if (["x", "y", "z", "gx", "gy", "gz"].includes(direction)) {
          arrow = this.memberMomentLoad.create(
            nodei, nodej, localAxis,
            direction, load.L1, load.L2, P1, P2, load.row);
          direction = 'r';
        }
      }

      // リストに登録する
      if (arrow === null) {
        continue
      };

      arrow["row"] = load.row;
      target[direction].push(arrow);
      ThreeObject.add(arrow);
      memberLoadList[mNo] = target;

    }
  }

  public visibleChange(flag: boolean, gui: boolean): void {

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
      // 黒に戻す
      this.selectionItem = null;
      /*
      this.memberList.children.map((item) => {
        // 元の色にする
        const material = item['material'];
        material["color"].setHex(0x000000);
        material["opacity"] = 1.0;
      });
      this.axisList.map((item) => {
        item.visible = false;
      });
      */
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
    return this.nodeThree.baseScale * 10;
  }

  // スケールを反映する
  private onResize(id: string = this.currentIndex): void {
    if (!(id in this.AllCaseLoadList)) {
      return;
    }
    const loadList = this.AllCaseLoadList[id];

    const scale1: number = this.LoadScale / 100;
    const scale2: number = this.baseScale();

    // 節点荷重のスケールを変更する
    const scale: number = scale1 * scale2;
    for (const n of Object.keys(loadList.pointLoadList)) {
      const dict = loadList.pointLoadList[n];
      for (let k of Object.keys(dict)) {
        dict[k].forEach(item => {
          if (item.name.includes("PointLoad")) {
            // 集中荷重
            this.pointLoad.setScale(item, scale);
          } else if (item.name.includes("MomentLoad")) {
            // 集中曲げモーメント荷重
            this.momentLoad.setScale(item, scale);
          }
        });
      }
    }

    // 要素荷重のスケールを変更する
    for (const m of Object.keys(loadList.memberLoadList)) {
      const dict = loadList.memberLoadList[m];
      for (const direction of ["gx", "gy", "gz", "r", "x", "y", "z"]) {
        dict[direction].forEach(item => {
          if (item.name.includes("DistributeLoad")) {
            // 分布荷重
            this.distributeLoad.setScale(item, scale);
          } else if (item.name.includes("TorsionLoad")) {
            // ねじり分布荷重
            this.torsionLoad.setScale(item, scale);
          } else if (item.name.includes("AxialLoad")) {
            // 軸方向分布荷重
            this.axialLoad.setScale(item, scale);
          } else if (item.name.includes("MemberPointLoad")) {
            // 部材途中集中荷重
            this.memberPointLoad.setScale(item, scale);
          } else if (item.name.includes("MemberMomentLoad")) {
            // 部材途中モーメント
            this.memberMomentLoad.setScale(item, scale);
          }
        });
      }
    }

    //this.scene.render(); //コメントアウト：レンダリング不要の場合があるため、レンダリングはこの関数の外側で行う
  }

  // 重なりを調整する
  private setOffset(id: string = this.currentIndex): void {

    if (!(id in this.AllCaseLoadList)) {
      return;
    }
    const loadList = this.AllCaseLoadList[id];

    // 配置位置（その他の荷重とぶつからない位置）を決定する
    for (const n of Object.keys(loadList.pointLoadList)) {
      const list = loadList.pointLoadList[n];
      // 集中荷重:ThreeLoadPoint
      ["tx", "ty", "tz"].forEach(k => {
        let offset1 = 0;
        let offset2 = 0;
        for (const item of list[k]) {
          // 大きさを変更する
          const scale: number = 4 * Math.abs(item.value) / loadList.pMax;
          this.pointLoad.setSize(item, scale);
          // オフセットする
          if (item.value > 0) {
            this.pointLoad.setOffset(item, offset1);
            offset1 -= (scale * 1.0); // オフセット距離に高さを加算する
          } else {
            this.pointLoad.setOffset(item, offset2);
            offset2 += (scale * 1.0); // オフセット距離に高さを加算する
          }
        }
      });
      // 集中荷重:ThreeLoadPoint
      ["rx", "ry", "rz"].forEach(k => {
        let offset = 0;
        for (const item of list[k]) {
          const scale: number = item.value / loadList.mMax;
          this.momentLoad.setSize(item, scale);
          this.momentLoad.setOffset(item, offset);
          offset += this.baseScale() * 0.1;
        }
      });
    }

    // 要素荷重のスケールを変更する
    for (const m of Object.keys(loadList.memberLoadList)) {
      const list = loadList.memberLoadList[m];

      // ねじりモーメント
      let offset0 = 0;
      for (const item of list['r']) {
        if (item.name.includes("MemberMomentLoad")) {
          const scale: number = 1 * Math.abs(item.value) / loadList.mMax;
          this.memberMomentLoad.setSize(item, scale);
        } else if (item.name.includes("TorsionLoad")) {
          // 大きさを変更する
          const scale: number = 1 * Math.abs(item.value / loadList.rMax);
          this.torsionLoad.setSize(item, scale);
          offset0 += (scale * 0.5);
        }
      }

      // 分布荷重（部材軸座標方向）
      ["y", "z"].forEach(k => {
        let offset1 = offset0;
        let offset2 = offset0;
        let offset3 = offset0;
        let offset4 = offset0;
        
        // const Xarea = []; //不要？
        const Xarea1 = [];
        list[k].forEach(item => {
          // 大きさを変更する
          if (item.name.includes("DistributeLoad")) {
            // 分布荷重
            const scale: number = 1 * Math.abs(item.value) / loadList.wMax;
            this.distributeLoad.setSize(item, scale);
            //以降は当たり判定に用いる部分
            const vertice_points = [];
            //当たり判定のエリアを登録
            for (let num of item.children[0].children[0].children[0].geometry.vertices) {
              vertice_points.push(num.x)
              vertice_points.push(num.y)
            }
            if (Xarea1.length === 0) {
              this.distributeLoad.setOffset(item, 0);
            }

            all_check: //次のforループの名称 -> breakで使用
            for (let hit_points of Xarea1) {
              const pre_scale: number = 1 * Math.abs(hit_points[10]) / loadList.wMax;
              for (let num2 = 0; num2 < 5; num2++) {

                //接触判定
                let judgeX = this.self_raycaster(vertice_points, hit_points, "x");
                let judgeY = this.self_raycaster(vertice_points, hit_points, "y");

                if (judgeX === "Hit" && (judgeY === "Hit" || judgeY === "Touch")) {
                  // オフセットする
                  if (item.value > 0) {
                    offset1 += (pre_scale * 1.0); // オフセット距離に高さを加算する
                    this.distributeLoad.setOffset(item, offset1);
                    vertice_points[1] += offset1;
                    vertice_points[3] += offset1;
                    vertice_points[5] += offset1;
                    vertice_points[7] += offset1;
                    vertice_points[9] += offset1;
                  } else {
                    offset2 -= (pre_scale * 1.0); // オフセット距離に高さを加算する
                    this.distributeLoad.setOffset(item, offset2);
                    vertice_points[1] += offset2;
                    vertice_points[3] += offset2;
                    vertice_points[5] += offset2;
                    vertice_points[7] += offset2;
                    vertice_points[9] += offset2;
                  }
                } else if (judgeX === "NotHit" || judgeY === "NotHit") {
                  //オフセットしない
                  if (item.value > 0) {
                    this.distributeLoad.setOffset(item, offset1);
                  } else {
                    this.distributeLoad.setOffset(item, offset2);
                  }
                  break;
                } else {
                  //現状ケースを確認できていない
                  break all_check;
                }
              }
            }

            Xarea1.push( [vertice_points[0], vertice_points[1],
              vertice_points[2], vertice_points[3],
              vertice_points[4], vertice_points[5],
              vertice_points[6], vertice_points[7],
              vertice_points[8], vertice_points[9],
              item.value]);  //メッシュの5点の2次元座標と，valueの値を保存する

            const pre_scale: number = 1 * Math.abs(item.value) / loadList.wMax;
            offset3 = offset1 + pre_scale;
            offset4 = offset2 - pre_scale;
            offset1 = offset0;
            offset2 = offset0;


          } else if (item.name.includes("MemberPointLoad")) {
            // 集中荷重
            const scale: number = 1 * Math.abs(item.value) / loadList.pMax;
            this.memberPointLoad.setSize(item, scale);
            // オフセットする
            if (item.value > 0) {
              this.memberPointLoad.setOffset(item, offset3);
              offset3 += (scale * 1.0); // オフセット距離に高さを加算する
            } else {
              this.memberPointLoad.setOffset(item, offset4);
              offset4 -= (scale * 1.0); // オフセット距離に高さを加算する
            }
            offset1 = offset3;
            offset2 = offset4;
          }

          
        });
        // Xarea.push(Xarea1);//不要？現状は未使用
      });

      // 分布荷重（絶対座標方向）
      ["gx", "gy", "gz"].forEach(k => {
        let offset1 = offset0;
        let offset2 = offset0;
        list[k].forEach(item => {
          // 大きさを変更する
          if (item.name.includes("DistributeLoad")) {
            // 分布荷重
            const scale: number = 1 * Math.abs(item.value) / loadList.wMax;
            this.distributeLoad.setSize(item, scale);
            // オフセットする
            if (item.value > 0) {
              this.distributeLoad.setGlobalOffset(item, offset1, k);
              offset1 -= (scale * 1.0); // オフセット距離に高さを加算する
            } else {
              this.distributeLoad.setGlobalOffset(item, offset2, k);
              offset2 += (scale * 1.0); // オフセット距離に高さを加算する
            }
          } else if (item.name.includes("MemberPointLoad")) {
            // 集中荷重
            const scale: number = 1 * Math.abs(item.value) / loadList.pMax;
            this.memberPointLoad.setSize(item, scale);
            // オフセットする
            if (item.value > 0) {
              this.memberPointLoad.setGlobalOffset(item, offset1, k);
              offset1 -= (scale * 1.0); // オフセット距離に高さを加算する
            } else {
              this.memberPointLoad.setGlobalOffset(item, offset2, k);
              offset2 += (scale * 1.0); // オフセット距離に高さを加算する
            }
          }

        });
      });

      // 部材軸方向荷重
      list['x'].forEach(item => {
        // 大きさを変更する
        if (item.name.includes("MemberPointLoad")) {
          const scale: number = 1 * Math.abs(item.value) / loadList.pMax;
          this.memberPointLoad.setSize(item, scale);
        } else if (item.name.includes("AxialLoad")) {
          const scale: number = 1 * Math.abs(item.value) / loadList.qMax;
          this.axialLoad.setSize(item, scale);
        }
      });

    }

  }

  //当たり判定を行う
  private self_raycaster(points, area, pattern: string) {

    const d = 0.001 //当たり判定の緩和値

    //接触判定->結果はjudgeで返す
    let judge: string = "";
    switch (pattern) {
      case ('x'):
        if (points[2] - d > area[2] && points[2] + d < area[6]) {
          judge = "Hit";  //荷重の左側が既存面の内部にある状態
        } else if (points[6] - d > area[2] && points[6] + d < area[6]) {
          judge = "Hit";  //荷重の右側が既存面の内部にある状態
        } else if ((points[2] - d < area[2] && points[2] - d < area[6]) &&
          (points[6] + d > area[2] && points[6] + d > area[6])) {
          judge = "Hit";  //荷重の面が既存の面を全て含む状態
        } else {
          judge = "NotHit"
        }
        break;
      case ('y'):
        if (points[1] > area[1] && (points[1] < area[3] || points[1] < area[7])) {
          judge = "Hit";  //荷重の左下が既存面の内部にある状態
        } else if (points[1] === area[1]) {
          judge = "Touch";  //荷重の左下が既存面と同じ高さにある状態
        } else if (points[9] > area[1] && (points[9] < area[3] || points[9] < area[7])) {
          judge = "Hit";  //荷重の右下が既存面の内部にある状態
        } else if (points[9] === area[1]) {
          judge = "Touch";  //荷重の右下が既存面と同じ高さにある状態
        } else {
          if (points[3] > area[1] && (points[3] <= area[3] || points[3] <= area[7])) {
            judge = "Hit";  //荷重の左上が既存面の内部にある状態
          } else if (points[3] === area[1]) {
            judge = "Touch";
          } else if (points[7] > area[1] && (points[7] <= area[3] || points[7] <= area[7])) {
            judge = "Hit";  //荷重の右上が既存面の内部にある状態
          } else if (points[7] === area[1]) {
            judge = "Touch";
          } else if (points[3] <= area[1] && (points[7] >= area[3] || points[7] >= area[7])) {
            judge = "Hit";  //荷重の左上が既存面の下側，右上が既存面の上側にある状態
          } else if (points[7] <= area[1] && (points[3] >= area[3] || points[3] >= area[7])) {
            judge = "Hit";  //荷重の右上が既存面の下側，左上が既存面の上側にある状態
          } else {
            judge = "NotHit"
          }
        }
        break;
    }

    return judge
  }


  // マウス位置とぶつかったオブジェクトを検出する
  public detectObject(raycaster: THREE.Raycaster, action: string): void {
    return; // 軽量化のため 何もしない

    if (!(this.currentIndex in this.AllCaseLoadList)) {
      return; // 対象がなければ何もしない
    }
    const targetLoad = this.AllCaseLoadList[this.currentIndex];
    const ThreeObject: THREE.Object3D = targetLoad.ThreeObject;

    // 交差しているオブジェクトを取得
    const intersects = raycaster.intersectObjects(ThreeObject.children, true);
    if (intersects.length <= 0) {
      return;
    }

    //
    const target: any = this.getParent(intersects[0].object);


    switch (action) {
      case "click":
      case "select":
      case "hover":
        if (intersects.length > 0) {
          ThreeObject.children.map((item) => {
            if (item === target) {
              // 寸法線を表示する
              this.textVisible(item, true);
              this.selectionItem = item;
            } else {
              // それ以外は寸法線を非表示にする
              this.textVisible(item, false);
            }
          });
        }
        break;

      default:
        return;
    }
    this.scene.render();
  }

  private getParent(item): any {

    if (['AxialLoad',
      'DistributeLoad',
      'MemberMomentLoad',
      'MemberPointLoad',
      'MomentLoad',
      'PointLoad',
      'TemperatureLoad',
      'TorsionLoad'].includes(item.name)) {
      return item;
    } else {
      return this.getParent(item.parent);
    }
  }

  private textVisible(item: any, flag: boolean): void {
    if ('name' in item) {
      if (item.name === 'Dimension') {
        item.visible = flag;
      }
      if (item.name === 'text') {
        item.visible = flag;
      }
      if (item.name === 'points_center') {
        item.visible = flag;
      }
    }
    if (!('children' in item)) {
      return;
    }
    for (const child of item.children) {
      this.textVisible(child, flag);
    }
  }

}
