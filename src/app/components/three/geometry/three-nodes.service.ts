import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';
import * as THREE from 'three';
import { NumberValueAccessor } from '@angular/forms';
import { CSS2DRenderer, CSS2DObject } from '../libs/CSS2DRenderer.js';

@Injectable({
  providedIn: 'root'
})
export class ThreeNodesService {

  private geometry: THREE.SphereBufferGeometry;
  private isVisible: boolean[];

  public baseScale: number;   // 最近点から求めるスケール

  public maxDistance: number;
  public minDistance: number;

  private nodeList: THREE.Mesh[];
  private selectionItem: THREE.Mesh;     // 選択中のアイテム
  public center: any; // すべての点の重心位置

  // 大きさを調整するためのスケール
  private scale: number;
  private params: any;          // GUIの表示制御
  private gui: any;
 
  constructor(private scene: SceneService,
              private node: InputNodesService) {

    this.geometry = new THREE.SphereBufferGeometry(1);
    this.nodeList = new Array();
    this.ClearData();
    this.isVisible = [null, null];

    // gui
    this.scale = 1;
    this.params = {
      nodeScale: this.scale
    };
    this.gui = null;

  }

  public chengeData(): void {

    // 入力データを入手
    const jsonData = this.node.getNodeJson(0);
    const jsonKeys = Object.keys(jsonData);
    if (jsonKeys.length <= 0) {
      this.ClearData();
      return;
    }

    // 入力データに無い要素を排除する
    for (let i = this.nodeList.length - 1; i >= 0; i--) {
      const item = jsonKeys.find((key) => {
        return key === this.nodeList[i].name;
      });
      if (item === undefined) {
        while (this.nodeList[i].children.length > 0) {
          const object = this.nodeList[i].children[0];
          object.parent.remove(object);
        }
        this.scene.remove(this.nodeList[i]);
        this.nodeList.splice(i, 1);
      }
    }

    // 新しい入力を適用する
    for (const key of jsonKeys) {
      // 既に存在しているか確認する
      const item = this.nodeList.find((target) => {
        return (target.name === key);
      });
      if (item !== undefined) {
        // すでに同じ名前の要素が存在している場合座標の更新
        item.position.x = jsonData[key].x;
        item.position.y = jsonData[key].y;
        item.position.z = jsonData[key].z;
      } else {
        // 要素をシーンに追加
        const mesh = new THREE.Mesh(this.geometry,
          new THREE.MeshBasicMaterial({ color: 0x000000 }));
        mesh.name = 'node' + key;
        mesh.position.x = jsonData[key].x;
        mesh.position.y = jsonData[key].y;
        mesh.position.z = jsonData[key].z;

        this.nodeList.push(mesh);
        this.scene.add(mesh);

        // 文字をシーンに追加
        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = key;
        div.style.marginTop = '-1em';
        const label = new CSS2DObject(div);
        label.position.set(0, 0.27, 0);
        label.name = 'font';
        mesh.add(label);
      }
    }
    // サイズを調整する
    this.setBaseScale();
    this.onResize();

  }

  // データをクリアする
  public ClearData(): void {
    for (const mesh of this.nodeList) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
      // オブジェクトを削除する
      this.scene.remove(mesh);
    }
    this.nodeList = new Array();
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
      // baseScale は最近点の 1/20 とする
      this.baseScale = this.minDistance / 80;
    }

    // 重心位置を計算する
    let counter: number = 0;
    this.center = { x: 0, y: 0, z: 0 };
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
    for (const item of this.nodeList) {
      item.scale.x = this.baseScale * this.scale;
      item.scale.y = this.baseScale * this.scale;
      item.scale.z = this.baseScale * this.scale;
    }
  }

  // 表示設定を変更する
  public visible(flag: boolean, text: boolean, gui: boolean): void {

    // 表示設定
    if (this.isVisible[0] !== flag) {
      for (const mesh of this.nodeList) {
        mesh.visible = flag;
      }
      this.isVisible[0] = flag;
    }

    // 文字の表示設定
    if (this.isVisible[1] !== text) {
      for (const mesh of this.nodeList) {
        mesh.getObjectByName('font').visible = text;
      }
      this.isVisible[1] = text;
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

    const gui_step: number = 80 * 0.001;
    this.gui = this.scene.gui.add(this.params, 'nodeScale', 0, 80).step(gui_step).onChange((value) => {
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

    if (this.nodeList.length === 0) {
      return; // 対象がなければ何もしない
    }

    // 交差しているオブジェクトを取得
    const intersects = raycaster.intersectObjects(this.nodeList);

    switch (action) {
      case 'click':
        this.nodeList.map(item => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            item.material['color'].setHex(0xff0000);
            item.material['opacity'] = 1.00;
          }
        });
        break;

      case 'select':
        this.selectionItem = null;
        this.nodeList.map(item => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            item.material['color'].setHex(0xff0000);
            item.material['opacity'] = 1.00;
            this.selectionItem = item;
          } else {
            // それ以外は元の色にする
            item.material['color'].setHex(0x000000);
            item.material['opacity'] = 1.00;
          }
        });
        break;

      case 'hover':
        this.nodeList.map(item => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            item.material['color'].setHex(0xff0000);
            item.material['opacity'] = 0.25;
          } else {
            if (item === this.selectionItem) {
              item.material['color'].setHex(0xff0000);
              item.material['opacity'] = 1.00;
            } else {
              // それ以外は元の色にする
              item.material['color'].setHex(0x000000);
              item.material['opacity'] = 1.00;
            }
          }
        });
        break;

      default:
        return;
    }
  }

}


