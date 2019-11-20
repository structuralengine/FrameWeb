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

  private baseScale: number; // 最近点から求めるスケール
  private scale: number;     // 外部から調整するためのスケール
  private nodeList: THREE.Mesh[];

  constructor(private node: InputNodesService) {
    this.scale = 1;
    this.geometry = new THREE.SphereBufferGeometry(1);
    // this.material = new THREE.MeshLambertMaterial({ color: 0x00bbff });
    this.nodeList = new Array();
  }
  public getSelectiveObject(): THREE.Mesh[] {
    return this.nodeList;
  }

  public chengeData(scene: SceneService): void {

    // 入力データを入手
    const jsonData = this.node.getNodeJson('calc');
    const jsonKeys = Object.keys(jsonData);
    if (jsonKeys.length <= 0) {
      this.ClearData(scene);
      return;
    }

    // 入力データに無い要素を排除する
    for (let i = this.nodeList.length - 1; i >= 0; i--) {
      const item = jsonKeys.find((key) => {
        return key === this.nodeList[i].name;
      });
      if (item === undefined) {
        scene.remove(this.nodeList[i]);
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
          new THREE.MeshLambertMaterial({ color: 0xff0000 }));
        mesh.name = key;
        mesh.position.x = jsonData[key].x;
        mesh.position.y = jsonData[key].y;
        mesh.position.z = jsonData[key].z;

        this.nodeList.push(mesh);
        scene.add(mesh);

        // 文字をシーンに追加
        const moonDiv = document.createElement( 'div' );
        moonDiv.className = 'label';
        moonDiv.textContent = key;
        moonDiv.style.marginTop = '-1em';
        const moonLabel = new CSS2DObject( moonDiv );
        moonLabel.position.set( 0, 0.27, 0 );
        moonLabel.name = 'font';
        mesh.add( moonLabel );

      }
    }
    // サイズを調整する
    this.setBaseScale();
    this.onResize();
  }

  // データをクリアする
  public ClearData(scene: SceneService): void {
    for (const mesh of this.nodeList) {
      scene.remove(mesh);
    }
    this.nodeList = new Array();
  }

  // 外部からスケールの調整を受ける
  public setScale(newScale: number): void {
    this.scale = newScale;
    this.onResize();
  }

  // 最近点からスケールを求める
  private setBaseScale(): void {
    this.baseScale = 1;
    // 最近傍点を探す
    let minDistance: number = Number.MAX_VALUE;
    for (const item1 of this.nodeList) {
      for (const item2 of this.nodeList) {
        const x = item1.position.x - item2.position.x;
        const y = item1.position.y - item2.position.y;
        const z = item1.position.z - item2.position.z;
        const l = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
        if (l === 0) {
          continue;
        }
        minDistance = (l < minDistance) ? l : minDistance;
      }
    }
    // baseScale を決定する
    if (minDistance !== Number.MAX_VALUE) {
      // baseScale は最近点の 1/20 とする
      this.baseScale = minDistance / 20;
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

  // 文字を消す
  public Disable(): void {
    for (const mesh of this.nodeList) {
      mesh.getObjectByName('font').visible = false;
    }
  }

  // 文字を表示する
  public Enable(): void {
    for (const mesh of this.nodeList) {
      mesh.getObjectByName('font').visible = true;
    }
  }

}


