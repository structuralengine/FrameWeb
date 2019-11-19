import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';
import * as THREE from 'three';
import { NumberValueAccessor } from '@angular/forms';
import font from '../fonts/helvetiker_regular.typeface.json';

@Injectable({
  providedIn: 'root'
})
export class ThreeNodesService {

  private geometry: THREE.SphereBufferGeometry;
  private material: THREE.MeshLambertMaterial;
  private fontMaterial: THREE.MeshLambertMaterial;

  private baseScale: number; // 最近点から求めるスケール
  private scale: number;     // 外部から調整するためのスケール
  
  private nodeList: THREE.Mesh[];
  private fontList: THREE.Mesh[];
  private fontParams: any;

  constructor(private node: InputNodesService) {
    this.scale = 1;
    this.geometry = new THREE.SphereBufferGeometry(1);
    this.material = new THREE.MeshLambertMaterial({ color: 0x00bbff });
    this.fontMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    this.nodeList = new Array();
    this.fontList = new Array();
    this.fontParams = {
      size: 1,
      height: 0,
      weight: 'normal',
      font: new THREE.Font(font),
    };
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
        scene.remove(this.fontList[i]);
        this.nodeList.splice(i, 1);
        this.fontList.splice(i, 1);
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

        // 文字の座標の更新
        const fontKey: string =  'font-' + key;
        const fontItem = this.fontList.find((target) => {
          return (target.name ===  fontKey);
        });
        fontItem.position.x = jsonData[key].x;
        fontItem.position.y = jsonData[key].y - this.fontParams.size;
        fontItem.position.z = jsonData[key].z;

      } else {
        // 要素をシーンに追加
        const mesh = new THREE.Mesh(this.geometry, this.material);
        mesh.name = key;
        mesh.position.x = jsonData[key].x;
        mesh.position.y = jsonData[key].y;
        mesh.position.z = jsonData[key].z;

        this.nodeList.push(mesh);
        scene.add(mesh);

        // 文字をシーンに追加
        const textGeometry = new THREE.TextGeometry(key, this.fontParams);
        const textMesh = new THREE.Mesh(textGeometry, this.fontMaterial);
        textMesh.name = 'font-' + key;
        textMesh.position.x = jsonData[key].x;
        textMesh.position.y = jsonData[key].y - this.fontParams.size;
        textMesh.position.z = jsonData[key].z;
        textMesh.rotateX(Math.PI / 2);

        this.fontList.push(textMesh);
        scene.add(textMesh);

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
      scene.removeByName('font-' + mesh.name);
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
      this.fontParams.size = this.baseScale;
    }
  }


  // スケールを反映する
  private onResize(): void {
    for (const item of this.nodeList) {
      item.scale.x = this.baseScale * this.scale;
      item.scale.y = this.baseScale * this.scale;
      item.scale.z = this.baseScale * this.scale;
    }
    for (const item of this.fontList) {
      item.scale.x = this.baseScale * this.scale;
      item.scale.y = this.baseScale * this.scale;
      item.scale.z = this.baseScale * this.scale;
    }
  }

}


