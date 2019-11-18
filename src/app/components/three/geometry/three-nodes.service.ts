import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThreeNodesService {

  private geometry: THREE.SphereBufferGeometry;
  private material: THREE.MeshLambertMaterial;
  private nodeList: THREE.Mesh[];

  constructor(private node: InputNodesService) {
    this.geometry = new THREE.SphereBufferGeometry(1);
    this.material = new THREE.MeshLambertMaterial({ color: 0x000000 });
    this.nodeList = new Array();
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
    const filtered = this.nodeList.filter((target) => {
      return (jsonKeys.find((key) => key = target.name) !== undefined);
    });
    this.nodeList = filtered;

    // 新しい入力を適用する
    for (const key of jsonKeys) {
      const item = this.nodeList.find((target) => {
        return (target.name === key);
      });
      if (item !== undefined) {
        // すでに同じ名前の要素が存在している場合座標の更新のみ
        item.position.x = jsonData[key].x;
        item.position.y = jsonData[key].y;
        item.position.z = jsonData[key].z;
      } else {
        // 要素をシーンに追加
        const mesh = new THREE.Mesh(this.geometry, this.material);
        mesh.name = key;
        mesh.position.x = jsonData[key].x;
        mesh.position.y = jsonData[key].y;
        mesh.position.z = jsonData[key].z;
        this.nodeList.push(mesh);
        scene.add(mesh);
      }
    }
  }

  public ClearData(scene: SceneService): void {
    for ( const mesh of this.nodeList) {
      scene.remove(mesh);
    }
  }


}


