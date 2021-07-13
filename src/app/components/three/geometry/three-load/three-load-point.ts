import { Injectable } from '@angular/core';
import * as THREE from "three";
import { LineBasicMaterial } from 'three';

import { ThreeLoadText } from "./three-load-text";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadPoint {

  private text: ThreeLoadText;
  private line_mat_Red: THREE.LineBasicMaterial;
  private line_mat_Green: THREE.LineBasicMaterial;
  private line_mat_Blue: THREE.LineBasicMaterial;
  private line_mat_Pick: THREE.LineBasicMaterial;  //ハイライトカラー
  private arrow_mat_Red: THREE.MeshBasicMaterial;
  private arrow_mat_Green: THREE.MeshBasicMaterial;
  private arrow_mat_Blue: THREE.MeshBasicMaterial;
  private arrow_mat_Pick: THREE.MeshBasicMaterial;  //ハイライトカラー

  constructor(text: ThreeLoadText) {
    this.text = text;
    this.line_mat_Red = new THREE.LineBasicMaterial({ color: 0xff0000 });
    this.line_mat_Green = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    this.line_mat_Blue = new THREE.LineBasicMaterial({ color: 0x0000ff });
    this.line_mat_Pick = new THREE.LineBasicMaterial({ color: 0xafeeee });  //ハイライトカラー
    this.arrow_mat_Red = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.arrow_mat_Green = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.arrow_mat_Blue = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    this.arrow_mat_Pick = new THREE.MeshBasicMaterial({ color: 0xafeeee });  //ハイライトカラー
    }

  /// 節点荷重を編集する
  // target: 編集対象の荷重,
  // node: 基準点,
  // offset: 配置位置（その他の荷重とぶつからない位置）
  // value: 荷重値,
  // length: 表示上の長さ,
  // direction: 荷重の向き(tx, ty, tz)
  public create( position: any, offset: number, value: number,
    length: number, direction: string, row: number ): THREE.Group {

    //線の色を決める
    let line_color = 0xff0000;
    if (direction === "ty") {
      line_color = 0x00ff00;
    } else if (direction === "tz") {
      line_color = 0x0000ff;
    }

    const child = new THREE.Group();
    child.name = "child";

    // 色を変更する
    const origin = new THREE.Vector3(-1, 0, 0);
    const dir = new THREE.Vector3(1, 0, 0); // 矢印の方向（単位ベクトル）
    const arrow = new THREE.ArrowHelper(dir, origin, 1, line_color);
    arrow.name = "arrow";
    child.add(arrow);

    // 長さを修正する
    if (value < 0) {
      child.rotation.set(-Math.PI, 0, -Math.PI);
    }
    child.scale.set(length, length, length);

    const group0 = new THREE.Group();

    // 文字を追加する
    // const textStr: string = value.toFixed(2);
    // const size: number = 0.1;
    // const vartical: string = 'bottom';
    // let horizontal: string;
    // let pos: THREE.Vector2;
    // if (value < 0) {
    //   horizontal = 'right';
    //   pos = new THREE.Vector2(length, 0);
    // } else {
    //   horizontal = 'left';
    //   pos = new THREE.Vector2(-length, 0);
    // }
    // const text = this.text.create(textStr, pos, size, horizontal, vartical);
    // text.name = "text";
    // text.visible = false;
    // group0.add(text);

    child.position.y = offset;

    group0.add(child);
    group0.name = "group";

    const group = new THREE.Group();
    group.add(group0);

    group.name = "PointLoad-" + row.toString() + '-' + direction.toString();
    group['value'] = value; //値を保存

    // 向きを変更する
    if (direction === "ty") {
      group.rotateZ(Math.PI / 2);
    } else if (direction === "tz") {
      group.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
    }

    // 位置を修正する
    group.position.set(position.x, position.y, position.z);

    return group;
  }

  // public dispose(group: any): void{
  //   const group0 = group.getObjectByName('group');

  //   for(const item of group0.children){
  //     if(item.name === 'text'){
  //       this.text.dispose(item);
  //     }
  //   }
  // }

  // 大きさを反映する
  public setSize(group: any, size: number): void {
    for (const item of group.children) {
      item.scale.set(size, size, size);
    }
  }

  // オフセットを反映する
  public setOffset(group: THREE.Group, offset: number): void {
    for (const item of group.children) {
      item.position.x = offset;
    }
  }

  // スケールを反映する
  public setScale(group: any, scale: number): void {
    group.scale.set(scale, scale, scale);
  }

  // ハイライトを反映させる
  public setColor(group: any, status: string): void {

    //置き換えるマテリアルを生成 -> colorを設定し，対象オブジェクトのcolorを変える
    const group0 = group.getObjectByName('group');
    
    for(const child of  group0.children){
      if(child.name === 'child'){
        for (let target of child.children[0].children) {
          if (status === "clear") {
            if (target.type === 'Line' && group.name.slice(-1) === 'x') {
              target.material = this.line_mat_Red; //デフォルトのカラー
            } else if (target.type === 'Line' && group.name.slice(-1) === 'y') {
              target.material = this.line_mat_Green; //デフォルトのカラー
            } else if (target.type === 'Line' && group.name.slice(-1) === 'z') {
              target.material = this.line_mat_Blue; //デフォルトのカラー
            } else if (target.type === 'Mesh' && group.name.slice(-1) === 'x') {
              target.material = this.arrow_mat_Red; //デフォルトのカラー
            } else if (target.type === 'Mesh' && group.name.slice(-1) === 'y') {
              target.material = this.arrow_mat_Green; //デフォルトのカラー
            } else if (target.type === 'Mesh' && group.name.slice(-1) === 'z') {
              target.material = this.arrow_mat_Blue; //デフォルトのカラー
            }
          } else if (status === "select") {
            if (target.type === 'Line') {
              target.material = this.line_mat_Pick; //ハイライト用のカラー
            } else if (target.type === 'Mesh' ) {
              target.material = this.arrow_mat_Pick; //ハイライト用のカラー
            }
    
          }
        }
      } else if(child.name === 'text'){
        if (status === "clear"){
          child.visible = false;  // 文字を非表示
        } else if (status === "select"){
          child.visible = true; // 文字を表示
        }
      }
    }


  }
  
}
