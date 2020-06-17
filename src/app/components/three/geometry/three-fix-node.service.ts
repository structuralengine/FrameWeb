import { SceneService } from '../scene.service';
import { InputNodesService } from '../../input/input-nodes/input-nodes.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { InputFixNodeService } from '../../input/input-fix-node/input-fix-node.service';
import { ThreeNodesService } from './three-nodes.service';
import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { ThreeMembersService } from './three-members.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeFixNodeService {

  private BufferGeometry: THREE.SphereBufferGeometry; // 支点
  private fixnodeList: any[];

  constructor(private scene: SceneService,
    private nodeThree: ThreeNodesService,
    private node: InputNodesService,
    private fixnode: InputFixNodeService,
    private three_member: ThreeMembersService) { 
      this.fixnodeList = new Array();
    }

  public maxLength(): number {
    // 最も距離の近い2つの節点距離
    return this.nodeThree.baseScale() * 60;
  }
  public center(): any {
    // 最も距離の近い2つの節点距離
    return this.nodeThree.center; 
  }
  
  public chengeData(index: number): void {

    this.ClearData();

    // 格点データを入手
    const nodeData = this.node.getNodeJson('calc');
    if (Object.keys(nodeData).length <= 0) {
      return;
    }
    // 支点データを入手
    const fixnodeData = this.fixnode.getFixNodeJson('calc');
    if (Object.keys(fixnodeData).length <= 0) {
      return;
    }

    const key_fixnode: string = index.toString();
    if( !(key_fixnode in fixnodeData) ){
      return;
    }
    const targetFixNode = fixnodeData[key_fixnode];
    for (const target of targetFixNode) {
      
      const position = {x: nodeData[target.n].x, y: nodeData[target.n].y, z: nodeData[target.n].z};
      let geometry = new THREE.Geometry;
      let fixed_geometry = new THREE.PlaneGeometry( 0.1*this.maxLength(), 0.3*this.maxLength() );
      let pin_color = 0;
      let fixed_position = {x:0, y:0, z:0};

      //ピン支点の分岐
      if (target.rx === 0 && (target.tx === 1 || target.ty === 1 || target.tz === 1)){
        pin_color = 0xff0000;
        if (position.x <= this.center().x){ 
          geometry.vertices.push(new THREE.Vector3(position.x, position.y, position.z));
          geometry.vertices.push(new THREE.Vector3(position.x, position.y + 0.1 * this.maxLength(), position.z - 0.2 * this.maxLength()));
          geometry.vertices.push(new THREE.Vector3(position.x, position.y - 0.1 * this.maxLength(), position.z - 0.2 * this.maxLength()));
          this.fixnode_pin_create(pin_color, geometry);
        }else if(position.x > this.center().x){
          geometry.vertices.push(new THREE.Vector3(position.x, position.y, position.z));
          geometry.vertices.push(new THREE.Vector3(position.x, position.y + 0.1 * this.maxLength(), position.z + 0.2 * this.maxLength()));
          geometry.vertices.push(new THREE.Vector3(position.x, position.y - 0.1 * this.maxLength(), position.z + 0.2 * this.maxLength()));
          this.fixnode_pin_create(pin_color, geometry);
        }
      }
      // geometry の初期化
      geometry = new THREE.Geometry;

      if (target.ry === 0 && (target.tx === 1 || target.ty === 1 || target.tz === 1)){
        pin_color = 0x00ff00;
        if (position.y <= this.center().y){
          geometry.vertices.push(new THREE.Vector3(position.x, position.y, position.z));
          geometry.vertices.push(new THREE.Vector3(position.x + 0.1 * this.maxLength(), position.y, position.z - 0.2 * this.maxLength()));
          geometry.vertices.push(new THREE.Vector3(position.x - 0.1 * this.maxLength(), position.y, position.z - 0.2 * this.maxLength()));
          this.fixnode_pin_create(pin_color, geometry);
        }else if(position.y > this.center().y){
          geometry.vertices.push(new THREE.Vector3(position.x, position.y, position.z));
          geometry.vertices.push(new THREE.Vector3(position.x + 0.1 * this.maxLength(), position.y, position.z + 0.2 * this.maxLength()));
          geometry.vertices.push(new THREE.Vector3(position.x - 0.1 * this.maxLength(), position.y, position.z + 0.2 * this.maxLength()));
          this.fixnode_pin_create(pin_color, geometry);
        }
      }
      // geometry の初期化
      geometry = new THREE.Geometry;

      if (target.rz === 0 && (target.tx === 1 || target.ty === 1 || target.tz === 1)){
        pin_color = 0x0000ff;
        if (position.z <= this.center().z){
          geometry.vertices.push(new THREE.Vector3(position.x, position.y, position.z));
          geometry.vertices.push(new THREE.Vector3(position.x + 0.1 * this.maxLength(), position.y - 0.2 * this.maxLength(), position.z));
          geometry.vertices.push(new THREE.Vector3(position.x - 0.1 * this.maxLength(), position.y - 0.2 * this.maxLength(), position.z));
          this.fixnode_pin_create(pin_color, geometry);
        }else if(position.z > this.center().z){
          geometry.vertices.push(new THREE.Vector3(position.x, position.y, position.z));
          geometry.vertices.push(new THREE.Vector3(position.x + 0.1 * this.maxLength(), position.y + 0.2 * this.maxLength(), position.z));
          geometry.vertices.push(new THREE.Vector3(position.x - 0.1 * this.maxLength(), position.y + 0.2 * this.maxLength(), position.z));
          this.fixnode_pin_create(pin_color, geometry);
        }
      }
      // geometry の初期化
      geometry = new THREE.Geometry;

      //固定支点の分岐
      let fixed_direction = null;
      if (target.rx === 1 && (target.tx === 1 || target.ty === 1 || target.tz === 1)){
        pin_color = 0xff0000;
        fixed_direction = "x"
        if (position.x <= this.center().x){
          fixed_position.x = position.x - 0.05*this.maxLength();
          fixed_position.y = position.y;
          fixed_position.z = position.z; 
          this.fixnode_fixed_create(fixed_geometry, fixed_position, fixed_direction);
        }else if(position.x > this.center().x){
          fixed_position.x = position.x + 0.05*this.maxLength();
          fixed_position.y = position.y;
          fixed_position.z = position.z; 
          this.fixnode_fixed_create(fixed_geometry, fixed_position, fixed_direction);
        }
      }
      // geometry の初期化
      geometry = new THREE.Geometry;

      if (target.ry === 1 && (target.tx === 1 || target.ty === 1 || target.tz === 1)){
        pin_color = 0xff0000;
        fixed_direction = "y"
        if (position.y <= this.center().y){
          fixed_position.x = position.x;
          fixed_position.y = position.y - 0.05*this.maxLength();
          fixed_position.z = position.z; 
          this.fixnode_fixed_create(fixed_geometry, fixed_position, fixed_direction);
        }else if(position.y > this.center().y){
          fixed_position.x = position.x;
          fixed_position.y = position.y + 0.05*this.maxLength();
          fixed_position.z = position.z; 
          this.fixnode_fixed_create(fixed_geometry, fixed_position, fixed_direction);
        }
      }
      // geometry の初期化
      geometry = new THREE.Geometry;

      if (target.rz === 1 && (target.tx === 1 || target.ty === 1 || target.tz === 1)){
        pin_color = 0xff0000;
        fixed_direction = "z"
        if (position.z <= this.center().z){
          fixed_position.x = position.x;
          fixed_position.y = position.y;
          fixed_position.z = position.z - 0.05*this.maxLength(); 
          this.fixnode_fixed_create(fixed_geometry, fixed_position, fixed_direction);
        }else if(position.z > this.center().z){
          fixed_position.x = position.x;
          fixed_position.y = position.y;
          fixed_position.z = position.z + 0.05*this.maxLength(); 
          this.fixnode_fixed_create(fixed_geometry, fixed_position, fixed_direction);
        }
      }
     
    }

  }
  //ピン支点を描く
  public fixnode_pin_create(pin_color, geometry){
    const material_pin = new THREE.MeshStandardMaterial({side: THREE.DoubleSide, color: pin_color});
    const normal = new THREE.Vector3(0, 0, 1);
    const face = new THREE.Face3(0, 1, 2, normal, pin_color);
    geometry.faces.push( face );
    var mesh = new THREE.Mesh(geometry, material_pin);
    if (mesh !== null) {
      this.fixnodeList.push(mesh);
      this.scene.add(mesh);
    }
  }

  //固定支点を描く                     かなり中途半端
  public fixnode_fixed_create(geometry, position, fixed_direction){
    const fixed_color = 0x808080;
    const fixed_material = new THREE.MeshBasicMaterial( {color: fixed_color, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh(geometry, fixed_material);
    switch (fixed_direction){
      case "x":
        ;
      case "y":
      plane.rotation.z = Math.PI / 2;
      case "z":
      plane.rotation.y = Math.PI / 2;
    }
    plane.position.set(position.x, position.y, position.z);
    if (plane !== null) {
      this.fixnodeList.push(plane);
      this.scene.add(plane);
    }
  }

  // データをクリアする
  public ClearData(): void {

    for (const mesh of this.fixnodeList) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
      // オブジェクトを削除する
      this.scene.remove(mesh);
    }
    this.fixnodeList = new Array();
  }

}
