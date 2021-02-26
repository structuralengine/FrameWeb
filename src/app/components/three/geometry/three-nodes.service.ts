import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';
import * as THREE from 'three';
import { CSS2DObject } from '../libs/CSS2DRenderer.js';

@Injectable({
  providedIn: 'root'
})
export class ThreeNodesService {

  private geometry: THREE.SphereBufferGeometry;

  public baseScale: number;   // 最近点から求める基準のスケール

  public maxDistance: number;
  public minDistance: number;

  private nodeList: THREE.Object3D;
  private selectionItem: THREE.Object3D;     // 選択中のアイテム
  public center: any; // すべての点の重心位置

  // 大きさを調整するためのスケール
  private scale: number;
  private params: any;          // GUIの表示制御
  private gui: any;

  private objVisible: boolean;
  private txtVisible: boolean;
 
  constructor(private scene: SceneService,
              private node: InputNodesService) {

    this.geometry = new THREE.SphereBufferGeometry(1);
    this.nodeList = new THREE.Object3D();
    this.ClearData();
    this.scene.add(this.nodeList);

    this.objVisible = true;
    this.txtVisible = false;

    // gui
    this.scale = 100;
    this.params = {
      nodeNo: this.txtVisible,
      nodeScale: this.scale
    };
    this.gui = null;

  }

  // 初期化
  public OnInit(): void { 
    // 節点番号の表示を制御する gui を登録する
    this.scene.gui.add( this.params, 'nodeNo' ).onChange( ( value ) => {
      for (const mesh of this.nodeList.children) {
        mesh.getObjectByName('font').visible = value;
      }
      this.txtVisible = value;
      this.scene.render();
    });

  }

  // データが変更された時の処理
  public changeData(): void {

    // 入力データを入手
    const jsonData = this.node.getNodeJson(0);
    const jsonKeys = Object.keys(jsonData);
    if (jsonKeys.length <= 0) {
      this.ClearData();
      return;
    }

    // 入力データに無い要素を排除する
    for (let i = this.nodeList.children.length - 1; i >= 0; i--) {
      const item = jsonKeys.find((key) => {
        return key === this.nodeList.children[i].name;
      });
      if (item === undefined) {
        const target = this.nodeList.children[i];
        while (target.children.length > 0) {
          const object = target.children[0];
          object.parent.remove(object);
        }
        this.nodeList.children.splice(i, 1);
      }
    }

    // 新しい入力を適用する
    for (const key of jsonKeys) {
      // 既に存在しているか確認する
      const item = this.nodeList.children.find((target) => {
        return (target.name === key);
      });
      if (item !== undefined) {
        // すでに同じ名前の要素が存在している場合座標の更新
        item.position.x = jsonData[key].x;
        item.position.y = jsonData[key].y;
        item.position.z = jsonData[key].z;
      } else {
        // ジオメトリを生成してシーンに追加
        const mesh = new THREE.Mesh(this.geometry,
          new THREE.MeshBasicMaterial({ color: 0x000000 }));
        mesh.name = 'node' + key;
        mesh.position.x = jsonData[key].x;
        mesh.position.y = jsonData[key].y;
        mesh.position.z = jsonData[key].z;

        this.nodeList.children.push(mesh);
        // this.scene.add(mesh);

        // 文字をシーンに追加
        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = key;
        div.style.marginTop = '-1em';
        const label = new CSS2DObject(div);
        label.position.set(0, 0.27, 0);
        label.name = 'font';
        label.visible = this.txtVisible;
        mesh.add(label);
      }
    }
    // サイズを調整する
    this.setBaseScale();
    this.onResize();
  }

  // データをクリアする
  public ClearData(): void {
    for (const mesh of this.nodeList.children) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
    }
    // オブジェクトを削除する
    this.nodeList.children= new Array();
    // this.nodeList = new Array();
    this.baseScale = 1;
    this.maxDistance = 0;
    this.minDistance = 0;
    this.center = { x: 0, y: 0, z: 0 };
  }


  // 最近点からスケールを求める
  private setBaseScale(): void {

    // 入力データを入手
    const jsonData = this.node.getNodeJson(0);
    const jsonKeys = Object.keys(jsonData);
    if (jsonKeys.length <= 0) {
      this.ClearData();
      return;
    }

    // # region 最近傍点を探す
    this.minDistance = Number.MAX_VALUE;
    this.maxDistance = 0;
    for (const key1 of jsonKeys) {
      const item1 = jsonData[key1];
      for (const key2 of jsonKeys) {
        const item2 = jsonData[key2];
        const l = Math.sqrt((item1.x - item2.x) ** 2 + (item1.y - item2.y) ** 2 + (item1.z - item2.z) ** 2);
        if (l === 0) {
          continue;
        }
        this.minDistance = Math.min(l, this.minDistance);
        this.maxDistance = Math.max(l, this.maxDistance);
      }
    }
    //#endregion

    // # region baseScale を決定する
    this.baseScale = 1;
    if (this.minDistance !== Number.MAX_VALUE) {
      // baseScale は最遠点の 1/500 以下
      // baseScale は最近点の 1/50 以上とする
      this.baseScale = Math.max(this.maxDistance / 500, this.minDistance / 50);
    }

    // 重心位置を計算する
    let counter: number = 0;
    this.center = new THREE.Vector3();
    for (const key of jsonKeys) {
      const p = jsonData[key];
      this.center.x += p.x;
      this.center.y += p.y;
      this.center.z += p.z;
      counter++;
    }
    if (counter > 0) {
      this.center.x = this.center.x / counter;
      this.center.y = this.center.y / counter;
      this.center.z = this.center.z / counter;
    }

  }

  // スケールを反映する
  private onResize(): void {

    let sc = this.scale / 100; // this.scale は 100 が基準値なので、100 のとき 1 となるように変換する
    sc = Math.max(sc, 0.001); // ゼロは許容しない

    for (const item of this.nodeList.children) {
      item.scale.x = this.baseScale * sc;
      item.scale.y = this.baseScale * sc;
      item.scale.z = this.baseScale * sc;
    }
  }

  // 表示設定を変更する
  public visibleChange(flag: boolean, text: boolean, gui: boolean): void {

    // 表示設定
    if (this.objVisible !== flag) {
      this.nodeList.visible = flag;
      this.objVisible = flag;
    }

    // guiの表示設定
    if (gui === true) {
      this.guiEnable();
    } else {
      this.guiDisable();
    }

  }

  // guiを表示する
  private guiEnable(): void {
    if (this.gui !== null) {
      return;
    }
    this.gui = this.scene.gui.add(this.params, 'nodeScale', 0, 1000).step(1).onChange((value) => {
      this.scale = value;
      this.onResize();
      this.scene.render();
    });
  }

  // guiを非表示にする
  private guiDisable(): void {
    if (this.gui === null) {
      return;
    }
    this.scene.gui.remove(this.gui);
    this.gui = null;
  }

  // マウス位置とぶつかったオブジェクトを検出する
  public detectObject(raycaster: THREE.Raycaster, action: string): void {

    if (this.nodeList.children.length === 0) {
      return; // 対象がなければ何もしない
    }

    // 交差しているオブジェクトを取得
    const intersects = raycaster.intersectObjects(this.nodeList.children);
    if ( intersects.length <= 0 ){
      return;
    }

    switch (action) {
      case 'click':
        this.nodeList.children.map(item => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            const material = item['material'];
            material['color'].setHex(0xff0000);
            material['opacity'] = 1.00;
          }
        });
        break;

      case 'select':
        this.selectionItem = null;
        this.nodeList.children.map(item => {
          const material = item['material'];
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            material['color'].setHex(0xff0000);
            material['opacity'] = 1.00;
            this.selectionItem = item;
          } else {
            // それ以外は元の色にする
            material['color'].setHex(0x000000);
            material['opacity'] = 1.00;
          }
        });
        break;

      case 'hover':
        this.nodeList.children.map(item => {
          const material = item['material'];
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            material['color'].setHex(0xff0000);
            material['opacity'] = 0.25;
          } else {
            if (item === this.selectionItem) {
              material['color'].setHex(0xff0000);
              material['opacity'] = 1.00;
            } else {
              // それ以外は元の色にする
              material['color'].setHex(0x000000);
              material['opacity'] = 1.00;
            }
          }
        });
        break;

      default:
        return;
    }
    this.scene.render();
  }

}


