import { SceneService } from '../scene.service';
import { InputNodesService } from '../../input/input-nodes/input-nodes.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { InputFixNodeService } from '../../input/input-fix-node/input-fix-node.service';
import { ThreeNodesService } from './three-nodes.service';
import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { ThreeMembersService } from './three-members.service';
import { CubeCamera } from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThreeFixNodeService {

  private fixnodeList: any[];
  private isVisible: boolean;
  private currentIndex: string;
  private currentIndex_sub: string;

  // 大きさを調整するためのスケール
  private scale: number;
  private params: any;          // GUIの表示制御
  private gui: any;

  constructor(private scene: SceneService,
              private nodeThree: ThreeNodesService,
              private node: InputNodesService,
              private fixnode: InputFixNodeService) {

    this.fixnodeList = new Array();
    this.isVisible = null;
    this.currentIndex = null;
    this.currentIndex_sub = null;

    // gui
    this.scale = 1.0;
    this.params = {
      fixnodeScale: this.scale
    };
    this.gui = null;

  }

  // 表示設定を変更する
  public visibleChange(flag: boolean): void {
    if (this.isVisible === flag) {
      return;
    }
    for (const mesh of this.fixnodeList) {
      mesh.visible = flag;
    }
    this.isVisible = flag;

    // guiの表示設定
    if (flag === true) {
      if (this.fixnodeList.length > 0){
        this.guiEnable();
      }
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
    this.gui = this.scene.gui.add(this.params, 'fixnodeScale', 0, 80).step(gui_step).onChange((value) => {
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

  public baseScale(): number {
    // 最も距離の近い2つの節点距離
    return this.nodeThree.minDistance;
  }

  public center(): any {
    // すべての節点の中心
    return this.nodeThree.center;
  }

  public changeData(index: number): void {

    this.ClearData();

    // 格点データを入手
    const nodeData = this.node.getNodeJson(0);
    if (Object.keys(nodeData).length <= 0) {
      return;
    }

    const key_fixnode: string = index.toString();

    // 支点データを入手
    const fixnodeData = this.fixnode.getFixNodeJson(0, key_fixnode);
    if (Object.keys(fixnodeData).length <= 0) {
      return;
    }

    const targetFixNode = fixnodeData[key_fixnode];
    for (const target of targetFixNode) {

      if (!(target.n in nodeData)){
        continue;
      }
      const n = nodeData[target.n];
      const x = n.x;
      const y = n.y;
      const z = n.z;
 
      const position = { x, y, z };

      
      // バネ支点の分岐
      let spring = { direction: 'x', relationship: 'small', color: 0x000000 };
      if (target.tx ** 2 !== 0 && target.tx ** 2 !== 1) {
        spring.color = 0xff0000;
        spring.direction = 'x'
        if (position.x <= this.center().x) {
          spring.relationship = 'small';
        } else if (position.x > this.center().x) {
          spring.relationship = 'large';
        }
        //this.CreateSpring(spring, position, this.baseScale(), target.n);
        this.CreateSpring(spring, position, this.baseScale(), target.row);
      }
      if (target.ty ** 2 !== 0 && target.ty ** 2 !== 1) {
        spring.color = 0x00ff00;
        spring.direction = 'y'
        if (position.y <= this.center().y) {
          spring.relationship = 'small';
        } else if (position.y > this.center().y) {
          spring.relationship = 'large';
        }
        //this.CreateSpring(spring, position, this.baseScale(), target.n);
        this.CreateSpring(spring, position, this.baseScale(), target.row);
      }
      if (target.tz ** 2 !== 0 && target.tz ** 2 !== 1) {
        spring.color = 0x0000ff;
        spring.direction = 'z'
        if (position.z <= this.center().z) {
          spring.relationship = 'small';
        } else if (position.z > this.center().z) {
          spring.relationship = 'large';
        }
        //this.CreateSpring(spring, position, this.baseScale(), target.n);
        this.CreateSpring(spring, position, this.baseScale(), target.row);
      }

      // 回転バネ支点の分岐
      let rotatingspring = { direction: 'x', color: 0x000000 };;
      if (target.rx ** 2 !== 0 && target.rx ** 2 !== 1) {
        rotatingspring.color = 0xff0000;
        rotatingspring.direction = 'x';
        //this.CreateRotatingSpring(rotatingspring, position, this.baseScale(), target.n);
        this.CreateRotatingSpring(rotatingspring, position, this.baseScale(), target.row);
      }
      if (target.ry ** 2 !== 0 && target.ry ** 2 !== 1) {
        rotatingspring.color = 0x00ff00;
        rotatingspring.direction = 'y';
        //this.CreateRotatingSpring(rotatingspring, position, this.baseScale(), target.n);
        this.CreateRotatingSpring(rotatingspring, position, this.baseScale(), target.row);
      }
      if (target.rz ** 2 !== 0 && target.rz ** 2 !== 1) {
        rotatingspring.color = 0x0000ff;
        rotatingspring.direction = 'z';
        //this.CreateRotatingSpring(rotatingspring, position, this.baseScale(), target.n);
        this.CreateRotatingSpring(rotatingspring, position, this.baseScale(), target.row);
      }

      // 完全な固定支点の分岐
      let fixed_Parfect = { relationshipX: 'small', relationshipY: 'small', relationshipZ: 'small', color: 0x808080 };
      if (target.rx === 1 && target.ry === 1 && target.rz === 1 
          && target.tx === 1 && target.ty === 1 && target.tz === 1) {
        if (position.x <= this.center().x) {
          fixed_Parfect.relationshipX = 'small';
        } else if (position.x > this.center().x) {
          fixed_Parfect.relationshipX = 'large';
        }
        if (position.y <= this.center().y) {
          fixed_Parfect.relationshipY = 'small';
        } else if (position.y > this.center().y) {
          fixed_Parfect.relationshipY = 'large';
        }
        if (position.z <= this.center().z) {
          fixed_Parfect.relationshipZ = 'small';
        } else if (position.z > this.center().z) {
          fixed_Parfect.relationshipZ = 'large';
        }
        //this.CreateFixed_P(fixed_Parfect, position, this.baseScale(), target.n);
        this.CreateFixed_P(fixed_Parfect, position, this.baseScale(), target.row);
        continue;
      }

      // ピン支点の分岐
      if( target.tx === 1 ){
        const pin = { direction: 'x', color: 0xff0000 };
        if (position.x <= this.center().x) {
          pin['relationship'] = 'small';
        } else if (position.x > this.center().x) {
          pin['relationship'] = 'large';
        }
        //this.CreatePin(pin, position, this.baseScale(), target.n);
        this.CreatePin(pin, position, this.baseScale(), target.row);
      }
      if( target.ty === 1 ){
        const pin = { direction: 'y', color: 0x00ff00 };
        if (position.y <= this.center().y) {
          pin['relationship'] = 'small';
        } else if (position.y > this.center().y) {
          pin['relationship'] = 'large';
        }
        //this.CreatePin(pin, position, this.baseScale(), target.n);
        this.CreatePin(pin, position, this.baseScale(), target.row);
      }
      if( target.tz === 1 ){
        const pin = { direction: 'z', color: 0x0000ff };
        if (position.z <= this.center().z) {
          pin['relationship'] = 'small';
        } else if (position.z > this.center().z) {
          pin['relationship'] = 'large';
        }
        //this.CreatePin(pin, position, this.baseScale(), target.n);
        this.CreatePin(pin, position, this.baseScale(), target.row);
      }

      // 固定支点の分岐
      let fixed = { direction: 'x', relationship: 'small', color: 0x808080 };
      if (target.rx === 1) {
        fixed.color = 0xff0000;
        fixed.direction = 'x';
        if (position.x <= this.center().x) {
          fixed.relationship = 'small';
        } else if (position.x > this.center().x) {
          fixed.relationship = 'large';
        }
        //this.CreateFixed(fixed, position, this.baseScale(), target.n);
        this.CreateFixed(fixed, position, this.baseScale(), target.row);
      }
      if (target.ry === 1) {
        fixed.color = 0x00ff00;
        fixed.direction = 'y';
        if (position.y <= this.center().y) {
          fixed.relationship = 'small';
        } else if (position.y > this.center().y) {
          fixed.relationship = 'large';
        }
        //this.CreateFixed(fixed, position, this.baseScale(), target.n);
        this.CreateFixed(fixed, position, this.baseScale(), target.row);
      }
      if (target.rz === 1) {
        fixed.color = 0x0000ff;
        fixed.direction = 'z';
        if (position.z <= this.center().z) {
          fixed.relationship = 'small';
        } else if (position.z > this.center().z) {
          fixed.relationship = 'large';
        }
        //this.CreateFixed(fixed, position, this.baseScale(), target.n);
        this.CreateFixed(fixed, position, this.baseScale(), target.row);
      }

    }
    this.onResize();
    this.guiEnable();
  }

  // ピン支点を描く
  public CreatePin(pin, position, maxLength, row) {

    const height: number = maxLength * 0.2;
    const radius: number = height * 0.3;
    const geometry = new THREE.ConeBufferGeometry( radius, height, 12, 1, false );
    geometry.translate( 0, -height/2, 0 );
    const material = new THREE.MeshBasicMaterial({ color: pin.color });
    const cone = new THREE.Mesh(geometry, material);
    cone.position.set(position.x, position.y, position.z);
    //cone.name = 'fixnode' + n.toString() + 't' + pin.direction.toString();  //例：fixnode2ty
    cone.name = 'fixnode' + row.toString() + 't' + pin.direction.toString();  //例：fixnode2ty
    
    switch (pin.direction) {
      case 'x':
        switch (pin.relationship) {
          case 'small':
            cone.rotation.z = Math.PI / 2 * 3;
            break;
          case 'large':
            cone.rotation.z = Math.PI / 2;
            break;
        }
        break;
      case 'y':
        switch (pin.relationship) {
          case 'small':
            // 何もしない
            break;
          case 'large':
            cone.rotation.y = Math.PI / 2;
            break;
        }
        break;
      case 'z':
        switch (pin.relationship) {
          case 'small':
            cone.rotation.x = Math.PI / 2;
            break;
          case 'large':
            cone.rotation.x = Math.PI / 2 * 3;
            break;
        }
        break;
    }
    this.fixnodeList.push(cone);
    this.scene.add(cone);
  }


  // 固定支点を描く
  public CreateFixed(fixed, position, maxLength, row) {
    const side = 0.06 * maxLength;
    let geometry = new THREE.PlaneBufferGeometry(side, 2.5 * side);
    const material = new THREE.MeshBasicMaterial({ color: fixed.color, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    plane.name = 'fixnode' + row.toString() + 'r' + fixed.direction.toString();  //例：fixnode2ry
    let x = position.x;
    let y = position.y;
    let z = position.z;
    switch (fixed.direction) {
      case 'x':
        plane.rotation.y = Math.PI / 2;
        break;
      case 'y':
        plane.rotation.z = Math.PI / 2;
        plane.rotation.x = Math.PI / 2;
        break;
    }
    plane.position.set(x, y, z);
    this.fixnodeList.push(plane);
    this.scene.add(plane);
    geometry = new THREE.PlaneBufferGeometry;
  }

  // 完全な固定支点を描く
  public CreateFixed_P(fixed_Parfect, position, maxLength, row) {
    fixed_Parfect.color = 0x808080;
    const size = 0.2 * maxLength;
    const geometry = new THREE.BoxBufferGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({ color: fixed_Parfect.color });
    const cube = new THREE.Mesh(geometry, material);
    cube.name = 'fixnode' + row.toString() + 'tp';  //例：fixnode2tx
    /*switch (fixed_Parfect.directionX) {
      case 'small': position.x = position.x - size / 2;
        break;
      case 'large': position.x = position.x + size / 2;
        break;
    };
    switch (fixed_Parfect.directionY) {
      case 'small': position.y = position.y - size / 2;
        break;
      case 'large': position.y = position.y + size / 2;
        break;
    };
    switch (fixed_Parfect.directionZ) {
      case 'small': position.z = position.z - size / 2;
        break;
      case 'large': position.z = position.z + size / 2;
        break;
    };*/
    cube.position.set(position.x, position.y, position.z);
    this.fixnodeList.push(cube);
    this.scene.add(cube);
  }

  // バネ支点を描く
  public CreateSpring(spring, position, maxLength, row) {
    let geometry = new THREE.BufferGeometry();
    let vertices = [];
    let increase = 0.00015;
    switch (spring.relationship) {
      case ('small'):
        increase = 0.0001;
        break;
      case ('large'):
        increase = -0.0001;
        break;
    }
    const laps = 5;
    const split = 10;
    const radius = 0.02;
    let x = position.x;
    let y = position.y;
    let z = position.z;
    for (let i = 0; i <= laps * 360; i += split) {
      switch (spring.direction) {
        case ('x'):
          x = - i * increase * maxLength;
          y = radius * Math.cos(Math.PI / 180 * i) * maxLength;
          z = radius * Math.sin(Math.PI / 180 * i) * maxLength;
          break;
        case ('y'):
          x = radius * Math.cos(Math.PI / 180 * i) * maxLength;
          y = - i * increase * maxLength;
          z = radius * Math.sin(Math.PI / 180 * i) * maxLength;
          break;
        case ('z'):
          x = radius * Math.cos(Math.PI / 180 * i) * maxLength;
          y = radius * Math.sin(Math.PI / 180 * i) * maxLength;
          z = - i * increase * maxLength;
          break;
      }
      vertices.push(new THREE.Vector3(x, y, z));
    }
    geometry = new THREE.BufferGeometry().setFromPoints( vertices );
    const line = new THREE.LineBasicMaterial({ color: spring.color });
    const mesh = new THREE.Line(geometry, line);
    mesh.position.set(position.x, position.y, position.z);
    mesh.name = 'fixnode' + row.toString() + 't' + spring.direction.toString();  //例：fixnode2ty
    this.fixnodeList.push(mesh);
    this.scene.add(mesh);
    geometry = new THREE.BufferGeometry();
  }

  // 回転バネ支点を描く
  public CreateRotatingSpring(rotatingspring, position, maxLength, row) {
    let geometry = new THREE.BufferGeometry();
    let vertices = [];
    const laps = 3 + 0.25;
    const split = 10;
    const radius = 0.1 * 0.001;
    let x = position.x;
    let y = position.y;
    let z = position.z;
    for (let j = 0; j <= laps * 360; j += split) {
      switch (rotatingspring.direction) {
        case 'x':
          x = 0;
          y = radius * Math.cos(Math.PI / 180 * j) * maxLength * j;
          z = radius * Math.sin(Math.PI / 180 * j) * maxLength * j;
          break;
        case 'y':
          x = radius * Math.cos(Math.PI / 180 * j) * maxLength * j;
          y = 0;
          z = radius * Math.sin(Math.PI / 180 * j) * maxLength * j;
          break;
        case 'z':
          x = radius * Math.cos(Math.PI / 180 * j) * maxLength * j;
          y = radius * Math.sin(Math.PI / 180 * j) * maxLength * j;
          z = 0;
          break;
      }
      vertices.push(new THREE.Vector3(x, y, z));
    }
    geometry = new THREE.BufferGeometry().setFromPoints( vertices );
    const line = new THREE.LineBasicMaterial({ color: rotatingspring.color });
    const mesh = new THREE.Line(geometry, line);
    mesh.name = 'fixnode' + row.toString() + 'r' + rotatingspring.direction.toString();  //例：fixnode2ry
    mesh.position.set(position.x, position.y, position.z);
    this.fixnodeList.push(mesh);
    this.scene.add(mesh);
  }

  //シートの選択行が指すオブジェクトをハイライトする
  public selectChange(index_row, index_column): void{

    if (this.currentIndex === index_row && this.currentIndex_sub === index_column){
      //選択行の変更がないとき，何もしない
      return
    }

    let column = "";
    const column_sub = "tp"
    if (index_column === 0){
      //column = "tx"
    } else if (index_column === 1){
      column = "tx"
    } else if (index_column === 2) {
      column = "ty"
    } else if (index_column === 3) {
      column = "tz"
    } else if (index_column === 4) {
      column = "rx"
    } else if (index_column === 5) {
      column = "ry"
    } else if (index_column === 6) {
      column = "rz"
    } else {
      //console.log("-----error-----three-fixnode.service.ts-----error-----");
    }

    //全てのハイライトを元に戻し，選択行のオブジェクトのみハイライトを適応する
    for (let item of this.fixnodeList){

      item['material']['color'].setHex(0X000000);

      if (item.name === 'fixnode' + index_row.toString() + column ||
          item.name === 'fixnode' + index_row.toString() + column_sub ){

        item['material']['color'].setHex(0X00A5FF);
      }
    }

    this.currentIndex = index_row;
    this.currentIndex_sub = index_column;

    this.scene.render();
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

  // スケールを反映する
  private onResize(): void {
    for (const item of this.fixnodeList) {
      item.scale.set(this.scale, this.scale, this.scale);
    }
  }

}
