import { Injectable } from '@angular/core';
import { InputDataService } from 'src/app/providers/input-data.service';
import { SceneService } from './scene.service';
import * as THREE from 'three';
import { DataHelperModule } from 'src/app/providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  private geometry: THREE.BoxBufferGeometry;
  private material: THREE.MeshLambertMaterial;

  constructor(private helper: DataHelperModule,
    private input: InputDataService,
    private scene: SceneService) {
    this.geometry = new THREE.BoxBufferGeometry(20, 20, 20);
    this.material = new THREE.MeshLambertMaterial({ color: 0x000000 });
  }

  public chengeData(): void {
    // 入力データを入手
    const jsonData = this.input.node.getNodeJson('calc');
    const jsonKeys = Object.keys(jsonData);
    if (jsonKeys.length <= 0) { return; }

    // 入力データに無い要素を排除する
    const filtered = this.scene.selectiveObjects.filter((target) => {
      return (jsonKeys.find((key) => key = target.name) !== undefined);
    });
    this.scene.selectiveObjects = filtered;

    // 新しい入力を適用する
    for (const key of jsonKeys) {
      const item = this.scene.selectiveObjects.find((target) => {
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
        this.scene.selectiveObjects.push(mesh);
        this.scene.scene.add(mesh);
      }
    }
    this.scene.render();
  }

  public ClearData(): void {

  }

  public ChengeMode(ModeName: string, currentPage: number = null): void {

    switch (ModeName) {
      case 'nodes':
        break;

      case 'fix_nodes':
        break;

      case 'members':
        break;

      case 'joints':
        break;

      case 'loads':
        break;

      case 'notice_points':
        break;

      case 'comb_disg':
        break;

      case 'comb_fsec':
        break;

      case 'comb_reac':
        break;

      case 'disg':
        break;

      case 'fsec':
        break;

      case 'pik_disg':
        break;

      case 'pik_fsec':
        break;

      case 'pik_reac':
        break;

      case 'reac':
        break;
    }

  }
}
