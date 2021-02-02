/// <reference lib="webworker" />

import * as THREE from "three";

import { ThreeLoadText } from "../three-load/three-load-text";
import { ThreeLoadDimension } from "../three-load/three-load-dimension";
import { ThreeLoadPoint } from "../three-load/three-load-point";
import { ThreeLoadDistribute } from "../three-load/three-load-distribute";
import { ThreeLoadAxial } from "../three-load/three-load-axial";
import { ThreeLoadTorsion } from "../three-load/three-load-torsion";
import { ThreeLoadMoment } from "../three-load/three-load-moment";
import { ThreeLoadTemperature } from "../three-load/three-load-temperature";

addEventListener("message", ({ data }) => {
  /*
  // 荷重の雛形をあらかじめ生成する
  let pointLoad: ThreeLoadPoint; // 節点荷重のテンプレート
  let momentLoad: ThreeLoadMoment; // 節点モーメントのテンプレート
  let distributeLoad: ThreeLoadDistribute; // 分布荷重のテンプレート
  let axialLoad: ThreeLoadAxial; // 軸方向荷重のテンプレート
  let torsionLoad: ThreeLoadTorsion; // ねじり分布荷重のテンプレート
  let temperatureLoad: ThreeLoadTemperature; // 温度荷重のテンプレート

  // フォントをロード
  const loader = new THREE.FontLoader();
  loader.load("./assets/fonts/helvetiker_regular.typeface.json", (font) => {
    const text = new ThreeLoadText(font);
    const dim = new ThreeLoadDimension(text); //寸法戦を扱うモジュール

    // 荷重の雛形をあらかじめ生成する
    pointLoad = new ThreeLoadPoint(text); // 節点荷重のテンプレート
    momentLoad = new ThreeLoadMoment(text); // 節点モーメントのテンプレート
    distributeLoad = new ThreeLoadDistribute(text, dim); // 分布荷重のテンプレート
    axialLoad = new ThreeLoadAxial(text); // 軸方向荷重のテンプレート
    torsionLoad = new ThreeLoadTorsion(text, dim, momentLoad); // ねじり分布荷重のテンプレート
    temperatureLoad = new ThreeLoadTemperature(text, dim); // 温度荷重のテンプレート
  });

  const LoadList = data.LoadList;
  const row = data.row;

  // 格点データを入手
  const nodeData = data.nodeData;
  if (Object.keys(nodeData).length <= 0) {
    return; // 格点がなければ 以降の処理は行わない
  }

  // 節点荷重データを入手
  const nodeLoadData = data.nodeLoadData;
  if (data.currentIndex in nodeLoadData) {
    // 対象業(row) に入力されている部材番号を調べる
    const tempNodeLoad = nodeLoadData[data.currentIndex];
    let targetNodeLoad = [];
    if (row < 0) {
      // 全データ対象の場合
      targetNodeLoad = tempNodeLoad;
      for (const key of Object.keys(LoadList.pointLoadList)) {
        for (const item of LoadList.pointLoadList[key]) {
          LoadList.ThreeObject.remove(item);
        }
        LoadList.pointLoadList[key] = [];
      }
    } else {
      // 変更する行に指定がある場合
      for (const load of tempNodeLoad) {
        if (load.row === row) {
          targetNodeLoad.push(load);
        }
      }
      for (const key of Object.keys(LoadList.pointLoadList)) {
        const list = LoadList.pointLoadList[key];
        for (let i = list.length - 1; i >= 0; i--) {
          const item = list[i];
          if (item.row === row) {
            LoadList.ThreeObject.remove(item);
            list.splice(i, 1);
          }
        }
      }
    }

    ///////////////////////////////////////////
    // this.createPointLoad(
    //   targetNodeLoad,
    //   nodeData,
    //   LoadList.ThreeObject,
    //   LoadList.pointLoadList
    // );

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

    const maxLength = data.baseScale * 2; // 最も大きい集中荷重矢印の長さは baseScale * 2 とする
    const maxRadius = data.baseScale(); // 最も大きいモーメント矢印の半径は baseScale とする

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
        n in LoadList.pointLoadList
          ? LoadList.pointLoadList[n]
          : { tx: [], ty: [], tz: [], rx: [], ry: [], rz: [] };

      // 集中荷重 ---------------------------------
      for (let key of ["tx", "ty", "tz"]) {
        const value = load[key];
        if (value === 0) {
          continue;
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
        const arrow = pointLoad.create(node, offset, value, length, key);

        // リストに登録する
        arrow["row"] = load.row;
        target[key].push(arrow);
        LoadList.ThreeObject.add(arrow);

        LoadList.pointLoadList[n] = target;
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
        const scale = Math.abs(value / mMax);
        const Radius: number = maxRadius * scale;
        const arrow = momentLoad.create(node, offset, value, Radius, key);

        // リストに登録する
        arrow["row"] = load.row;
        target[key].push(arrow);
        LoadList.ThreeObject.add(arrow);

        LoadList.pointLoadList[n] = target;
      }
    }
    ////////////////////////////////////////////////////////////////

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
  const memberData = data.memberData;
  if (Object.keys(memberData).length <= 0) {
    return; //要素がなければ 以降の処理は行わない
  }

  // 要素荷重データを入手
  const memberLoadData = data.memberLoadData;
  if (data.currentIndex in memberLoadData) {
    // 対象業(row) に入力されている部材番号を調べる
    const tempMemberLoad = memberLoadData[data.currentIndex];
    let targetMemberLoad = [];
    if (row < 0) {
      // 全データ対象の場合
      targetMemberLoad = tempMemberLoad;
      for (const key of Object.keys(LoadList.memberLoadList)) {
        for (const item of LoadList.memberLoadList[key]) {
          LoadList.ThreeObject.remove(item);
        }
        LoadList.memberLoadList[key] = [];
      }
    } else {
      // 変更する行に指定がある場合
      for (const load of tempMemberLoad) {
        if (load.row === row) {
          targetMemberLoad.push(load);
        }
      }
      for (const key of Object.keys(LoadList.memberLoadList)) {
        const list = LoadList.memberLoadList[key];
        for (let i = list.length - 1; i >= 0; i--) {
          const item = list[i];
          if (item.row === row) {
            LoadList.ThreeObject.remove(item);
            list.splice(i, 1);
          }
        }
      }
    }

    ///////////////////////////////////////////
    // this.createMemberLoad(
    //   targetMemberLoad,
    //   nodeData,
    //   memberData,
    //   LoadList.ThreeObject,
    //   LoadList.memberLoadList
    // );

    ///////////////////////////////////////////

  } else {
    // ケースが存在しなかった
    for (const key of Object.keys(LoadList.memberLoadList)) {
      for (const item of LoadList.memberLoadList[key]) {
        LoadList.ThreeObject.remove(item);
      }
      LoadList.memberLoadList[key] = [];
    }
  }
*/

  postMessage({ messagew: true });
});
