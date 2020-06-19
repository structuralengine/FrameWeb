import { SceneService } from '../scene.service';
import { InputNodesService } from '../../input/input-nodes/input-nodes.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { InputFixNodeService } from '../../input/input-fix-node/input-fix-node.service';
import { ThreeNodesService } from './three-nodes.service';
import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { ThreeMembersService } from './three-members.service';
import { CubeCamera } from 'three';
//import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

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
      let color = 0;

      //ピン支点の分岐
      if (target.rx === 0 && (target.tx === 1 || target.ty === 1 || target.tz === 1)){
        color = 0xff0000;
        geometry.vertices.push(new THREE.Vector3(position.x, position.y, position.z));
        if (position.x <= this.center().x){ 
          geometry.vertices.push(new THREE.Vector3(position.x, position.y + 0.1 * this.maxLength(), position.z - 0.2 * this.maxLength()));
          geometry.vertices.push(new THREE.Vector3(position.x, position.y - 0.1 * this.maxLength(), position.z - 0.2 * this.maxLength()));
          this.fixnode_pin_create(color, geometry);
        }else if(position.x > this.center().x){
          geometry.vertices.push(new THREE.Vector3(position.x, position.y + 0.1 * this.maxLength(), position.z + 0.2 * this.maxLength()));
          geometry.vertices.push(new THREE.Vector3(position.x, position.y - 0.1 * this.maxLength(), position.z + 0.2 * this.maxLength()));
          this.fixnode_pin_create(color, geometry);
        }
      }
      if (target.ry === 0 && (target.tx === 1 || target.ty === 1 || target.tz === 1)){
        color = 0x00ff00;
          geometry.vertices.push(new THREE.Vector3(position.x, position.y, position.z));
        if (position.y <= this.center().y){
          geometry.vertices.push(new THREE.Vector3(position.x + 0.1 * this.maxLength(), position.y, position.z - 0.2 * this.maxLength()));
          geometry.vertices.push(new THREE.Vector3(position.x - 0.1 * this.maxLength(), position.y, position.z - 0.2 * this.maxLength()));
          this.fixnode_pin_create(color, geometry);
        }else if(position.y > this.center().y){
          geometry.vertices.push(new THREE.Vector3(position.x + 0.1 * this.maxLength(), position.y, position.z + 0.2 * this.maxLength()));
          geometry.vertices.push(new THREE.Vector3(position.x - 0.1 * this.maxLength(), position.y, position.z + 0.2 * this.maxLength()));
          this.fixnode_pin_create(color, geometry);
        }
      }
      if (target.rz === 0 && (target.tx === 1 || target.ty === 1 || target.tz === 1)){
        color = 0x0000ff;
          geometry.vertices.push(new THREE.Vector3(position.x, position.y, position.z));
        if (position.z <= this.center().z){
          geometry.vertices.push(new THREE.Vector3(position.x + 0.1 * this.maxLength(), position.y - 0.2 * this.maxLength(), position.z));
          geometry.vertices.push(new THREE.Vector3(position.x - 0.1 * this.maxLength(), position.y - 0.2 * this.maxLength(), position.z));
          this.fixnode_pin_create(color, geometry);
        }else if(position.z > this.center().z){
          geometry.vertices.push(new THREE.Vector3(position.x + 0.1 * this.maxLength(), position.y + 0.2 * this.maxLength(), position.z));
          geometry.vertices.push(new THREE.Vector3(position.x - 0.1 * this.maxLength(), position.y + 0.2 * this.maxLength(), position.z));
          this.fixnode_pin_create(color, geometry);
        }
      }

      //固定支点の分岐
      let fixed = {direction: "x", relationship: "small", color: 0x808080};
      if (target.rx === 1 && (target.tx === 1 || target.ty === 1 || target.tz === 1)){
        fixed.color = 0xff0000;
        fixed.direction = "x";
        if(position.x <= this.center().x){
          fixed.relationship = "small";
        }else if(position.x > this.center().x){
          fixed.relationship = "large";
        }
        this.CreateFixed(position, fixed);
      }
      if (target.ry === 1 && (target.tx === 1 || target.ty === 1 || target.tz === 1)){
        fixed.color = 0x00ff00;
        fixed.direction = "y";
        if(position.y <= this.center().y){
          fixed.relationship = "small";
        }else if(position.y > this.center().y){
          fixed.relationship = "large";
        }
        this.CreateFixed(position, fixed);
      }
      if (target.rz === 1 && (target.tx === 1 || target.ty === 1 || target.tz === 1)){
        fixed.color = 0x0000ff;
        fixed.direction = "z";
        if(position.z <= this.center().z){
          fixed.relationship = "small";
        }else if(position.z > this.center().z){
          fixed.relationship = "large";
        }
        this.CreateFixed(position, fixed);
      }

      //完全な固定支点の分岐
      if (target.rx === 1 && target.ry === 1 && target.rz === 1 && (target.tx === 1 || target.ty === 1 || target.tz === 1)){
        this.CreateFixed_P(position, fixed);
      }

      //バネ支点の分岐
      let spring = {direction: "x", relationship: "small", color: 0x000000};
      if (target.tx**2 !== 0 && target.tx**2 !== 1){
        spring.color = 0xff0000;
        spring.direction = "x"
        if(position.x <= this.center().x){
          spring.relationship = "small";
        }else if(position.x > this.center().x){
          spring.relationship = "large";
        }
        this.CreateSpring(position, spring, this.maxLength());
      }
      if (target.ty**2 !== 0 && target.ty**2 !== 1){
        spring.color = 0x00ff00;
        spring.direction = "y"
        if(position.y <= this.center().y){
          spring.relationship = "small";
        }else if(position.y > this.center().y){
          spring.relationship = "large";
        }
        this.CreateSpring(position, spring, this.maxLength());
      }
      if (target.tz**2 !== 0 && target.tz**2 !== 1){
        spring.color = 0x0000ff;
        spring.direction = "z"
        if(position.z <= this.center().z){
          spring.relationship = "small";
        }else if(position.z > this.center().z){
          spring.relationship = "large";
        }
        this.CreateSpring(position, spring, this.maxLength());
      }

      //回転バネ支点の分岐
      let rotatingspring = {direction: "x", color: 0x000000};;
      if (target.rx**2 !== 0 && target.rx**2 !== 1){
        rotatingspring.color = 0xff0000;
        rotatingspring.direction = "x"
        this.CreateRotatingSpring(position, rotatingspring, this.maxLength());
      }
      if (target.ry**2 !== 0 && target.ry**2 !== 1){
        rotatingspring.color = 0x00ff00;
        rotatingspring.direction = "y";
        this.CreateRotatingSpring(position, rotatingspring, this.maxLength());
      }
      if (target.rz**2 !== 0 && target.rz**2 !== 1){
        rotatingspring.color = 0x0000ff;
        rotatingspring.direction = "z";
        this.CreateRotatingSpring(position, rotatingspring, this.maxLength());
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
    this.fixnodeList.push(mesh);
    this.scene.add(mesh);
    geometry = new THREE.Geometry;
  }

  //固定支点を描く
  public CreateFixed(position, fixed){
    //fixed.color = 0x808080;
    let fixed_geometry = new THREE.PlaneGeometry( 0.1*this.maxLength(), 0.3*this.maxLength() );
    const fixed_material = new THREE.MeshBasicMaterial( {color: fixed.color, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh(fixed_geometry, fixed_material);
    switch (fixed.direction){
      case "x":
        switch (fixed.relationship){
          case "small": plane.position.set(position.x - 0.1*this.maxLength()/2, position.y, position.z);
                        break;
          case "large": plane.position.set(position.x + 0.1*this.maxLength()/2, position.y, position.z);
                        break;
        }
      break;
      case "y":
        plane.rotation.z = Math.PI / 2;
        switch (fixed.relationship){
          case "small": plane.position.set(position.x, position.y - 0.1*this.maxLength()/2, position.z);
                        break;
          case "large": plane.position.set(position.x, position.y + 0.1*this.maxLength()/2, position.z);
                        break;
        }
        break;
      case "z":
        plane.rotation.y = Math.PI / 2;
        switch (fixed.relationship){
          case "small": plane.position.set(position.x, position.y, position.z - 0.1*this.maxLength()/2);
                        break;
          case "large": plane.position.set(position.x, position.y, position.z + 0.1*this.maxLength()/2);
                        break;
        }
        break;
    }
    this.fixnodeList.push(plane);
    this.scene.add(plane);
    fixed_geometry = new THREE.PlaneGeometry;
  }

  //完全な固定支点を描く
  public CreateFixed_P(position, fixed){
    fixed.color = 0x808080;
    const size = 0.3 * this.maxLength();
    const fixed_P_geometry = new THREE.BoxGeometry(size, size, size);
    const fixed_P_material = new THREE.MeshBasicMaterial( {color: fixed.color} );
    const cube = new THREE.Mesh( fixed_P_geometry, fixed_P_material );
    cube.lookAt(position.x + position.x, position.y + position.y, position.z + position.z);
    cube.position.set(position.x, position.y, position.z);
    this.fixnodeList.push(cube);
    this.scene.add(cube);
  }
  
  
  //バネ支点を描く
  public CreateSpring(position, spring, maxLength){
    let GeometrySpring = new THREE.Geometry();
    let Increase = 0.0002;
    switch (spring.relationship){
      case("small"):
        Increase = 0.0002;
        break;
      case("large"):
        Increase = -0.0002;
        break;
    }
    const laps = 5;
    const split = 10;
    const radius = 0.05;
    let x = position.x;
    let y = position.y;
    let z = position.z;
    for(let i = 0; i <= laps * 360; i += split){
      switch (spring.direction){
        case ("x"):
        x = position.x - i * Increase * maxLength;
        y = position.y + radius * Math.cos(Math.PI / 180 * i) * maxLength;
        z = position.z + radius * Math.sin(Math.PI / 180 * i) * maxLength;
        break;
        case ("y"):
        x = position.x + radius * Math.cos(Math.PI / 180 * i) * maxLength;
        y = position.y - i * Increase  * maxLength;
        z = position.z + radius * Math.sin(Math.PI / 180 * i) * maxLength;
        break;
        case ("z"):
        x = position.x + radius * Math.cos(Math.PI / 180 * i) * maxLength;
        y = position.y + radius * Math.sin(Math.PI / 180 * i) * maxLength;
        z = position.z - i * Increase  * maxLength;
        break;
      }
     GeometrySpring.vertices.push(new THREE.Vector3(x, y, z));
    }
    console.log(laps * 360 * Increase * maxLength);
    const LineSpring = new THREE.LineBasicMaterial({color: spring.color});
    const MeshSpring = new THREE.Line(GeometrySpring, LineSpring);
    this.fixnodeList.push(MeshSpring);
    this.scene.add(MeshSpring);
    GeometrySpring = new THREE.Geometry();
  }

  //回転バネ支点を描く
  public CreateRotatingSpring(position, rotatingspring, maxLength){
    let GeometryRotatingSpring = new THREE.Geometry();
    const laps = 3 + 0.25;
    const split = 10;
    const radius = 0.1 * 0.001;
    let x = position.x;
    let y = position.y;
    let z = position.z;
    for(let j = 0; j <= laps * 360; j += split){
      switch (rotatingspring.direction){
        case "x":
          x = position.x;
          y = position.y + radius * Math.cos(Math.PI / 180 * j) * maxLength * j;
          z = position.z + radius * Math.sin(Math.PI / 180 * j) * maxLength * j;
          break;
        case "y":
          x = position.x + radius * Math.cos(Math.PI / 180 * j) * maxLength * j;
          y = position.y;
          z = position.z + radius * Math.sin(Math.PI / 180 * j) * maxLength * j;
          break;
        case "z":
          x = position.x + radius * Math.cos(Math.PI / 180 * j) * maxLength * j;
          y = position.y + radius * Math.sin(Math.PI / 180 * j) * maxLength * j;
          z = position.z;
          break;
      }
      GeometryRotatingSpring.vertices.push(new THREE.Vector3(x, y, z));
    }
    const LineRotatingSpring = new THREE.LineBasicMaterial({color: rotatingspring.color});
    const MeshRotatingSpring = new THREE.Line(GeometryRotatingSpring, LineRotatingSpring);
    this.fixnodeList.push(MeshRotatingSpring);
    this.scene.add(MeshRotatingSpring);
    GeometryRotatingSpring = new THREE.Geometry();
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
