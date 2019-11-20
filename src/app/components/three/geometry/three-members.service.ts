import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputMembersService } from '../../../components/input/input-members/input-members.service';
import * as THREE from 'three';
import { NumberValueAccessor } from '@angular/forms';
import { CSS2DRenderer, CSS2DObject } from '../libs/CSS2DRenderer.js';

@Injectable({
  providedIn: 'root'
})
export class ThreeMembersService {

  private memberList: THREE.Line[];

  constructor(private member: InputMembersService) {
    this.memberList = new Array();
  }
  public getSelectiveObject(): THREE.Line[] {
    return this.memberList;
  }

  public chengeData(scene: SceneService): void {

    // 入力データを入手
    const jsonData = this.member.getMemberJson('calc');
    const jsonKeys = Object.keys(jsonData);
    if (jsonKeys.length <= 0) {
      this.ClearData(scene);
      return;
    }

    // 入力データに無い要素を排除する
    for (let i = this.memberList.length - 1; i >= 0; i--) {
      const item = jsonKeys.find((key) => {
        return key === this.memberList[i].name;
      });
      if (item === undefined) {
        scene.remove(this.memberList[i]);
        this.memberList.splice(i, 1);
      }
    }

    // 新しい入力を適用する
    for (const key of jsonKeys) {
      // 既に存在しているか確認する
      const item = this.memberList.find((target) => {
        return (target.name === key);
      });
      if (item !== undefined) {
        // すでに同じ名前の要素が存在している場合座標の更新
        item.position.x = jsonData[key].x;
        item.position.y = jsonData[key].y;
        item.position.z = jsonData[key].z;
      } else {
        // 要素をシーンに追加
        const geometry = new THREE.Geometry();
        // 頂点座標の追加
        geometry.vertices.push( new THREE.Vector3( 150, 0, 0) );
        geometry.vertices.push( new THREE.Vector3( 0, 150, 0) );

        // 線オブジェクトの生成	
        const line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x990000} ) );

        // sceneにlineを追加
        this.memberList.push(line);
        scene.add( line );

        // 文字をシーンに追加
        // const moonDiv = document.createElement( 'div' );
        // moonDiv.className = 'label';
        // moonDiv.textContent = key;
        // moonDiv.style.marginTop = '-1em';
        // const moonLabel = new CSS2DObject( moonDiv );
        // moonLabel.position.set( 0, 0.27, 0 );
        // moonLabel.name = 'font';
        // mesh.add( moonLabel );

      }
    }
    // サイズを調整する
    // this.setBaseScale();
    // this.onResize();
  }

  // データをクリアする
  public ClearData(scene: SceneService): void {
    for (const mesh of this.memberList) {
      scene.remove(mesh);
    }
    this.memberList = new Array();
  }


  // 文字を消す
  public Disable(): void {
    for (const mesh of this.memberList) {
      mesh.getObjectByName('font').visible = false;
    }
  }

  // 文字を表示する
  public Enable(): void {
    for (const mesh of this.memberList) {
      mesh.getObjectByName('font').visible = true;
    }
  }

}


