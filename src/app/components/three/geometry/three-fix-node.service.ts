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

    // gui
    this.scale = 1.0;
    this.params = {
      fixnodeScale: this.scale
    };
    this.gui = null;

  }

  // 表示設定を変更する
  public visible(flag: boolean): void {
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

    const gui_step: number = 2 * 0.001;
    this.gui = this.scene.gui.add(this.params, 'fixnodeScale', 0, 2).step(gui_step).onChange((value) => {
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

  public chengeData(index: number): void {

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

      const position = { x: nodeData[target.n].x, y: nodeData[target.n].y, z: nodeData[target.n].z };

      // ピン支点の分岐
      let pin = { direction: 'x', relationship: 'small', color: 0x000000 };
      if (target.rx === 0 && (target.tx === 1 || target.ty === 1 || target.tz === 1)) {
        pin.direction = 'x';
        pin.color = 0xff0000;
        if (position.x <= this.center().x) {
          pin.relationship = 'small';
        } else if (position.x > this.center().x) {
          pin.relationship = 'large';
        }
        this.CreatePinfix(pin, position, this.baseScale());
      }
      if (target.ry === 0 && (target.tx === 1 || target.ty === 1 || target.tz === 1)) {
        pin.direction = 'y';
        pin.color = 0x00ff00;
        if (position.y <= this.center().y) {
          pin.relationship = 'small';
        } else if (position.y > this.center().y) {
          pin.relationship = 'large';
        }
        this.CreatePinfix(pin, position, this.baseScale());
      }
      if (target.rz === 0 && (target.tx === 1 || target.ty === 1 || target.tz === 1)) {
        pin.direction = 'z';
        pin.color = 0x0000ff;
        if (position.z <= this.center().z) {
          pin.relationship = 'small';
        } else if (position.z > this.center().z) {
          pin.relationship = 'large';
        }
        this.CreatePinfix(pin, position, this.baseScale());
      }

      // 固定支点の分岐
      let fixed = { direction: 'x', relationship: 'small', color: 0x808080 };
      if (target.rx === 1 && (target.tx === 1 || target.ty === 1 || target.tz === 1)) {
        fixed.color = 0xff0000;
        fixed.direction = 'x';
        if (position.x <= this.center().x) {
          fixed.relationship = 'small';
        } else if (position.x > this.center().x) {
          fixed.relationship = 'large';
        }
        this.CreateFixed(fixed, position, this.baseScale());
      }
      if (target.ry === 1 && (target.tx === 1 || target.ty === 1 || target.tz === 1)) {
        fixed.color = 0x00ff00;
        fixed.direction = 'y';
        if (position.y <= this.center().y) {
          fixed.relationship = 'small';
        } else if (position.y > this.center().y) {
          fixed.relationship = 'large';
        }
        this.CreateFixed(fixed, position, this.baseScale());
      }
      if (target.rz === 1 && (target.tx === 1 || target.ty === 1 || target.tz === 1)) {
        fixed.color = 0x0000ff;
        fixed.direction = 'z';
        if (position.z <= this.center().z) {
          fixed.relationship = 'small';
        } else if (position.z > this.center().z) {
          fixed.relationship = 'large';
        }
        this.CreateFixed(fixed, position, this.baseScale());
      }

      // 完全な固定支点の分岐
      let fixed_Parfect = { relationshipX: 'small', relationshipY: 'small', relationshipZ: 'small', color: 0x808080 };
      if (target.rx === 1 && target.ry === 1 && target.rz === 1 && (target.tx === 1 || target.ty === 1 || target.tz === 1)) {
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
        this.CreateFixed_P(fixed_Parfect, position, this.baseScale());
      }

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
        this.CreateSpring(spring, position, this.baseScale());
      }
      if (target.ty ** 2 !== 0 && target.ty ** 2 !== 1) {
        spring.color = 0x00ff00;
        spring.direction = 'y'
        if (position.y <= this.center().y) {
          spring.relationship = 'small';
        } else if (position.y > this.center().y) {
          spring.relationship = 'large';
        }
        this.CreateSpring(spring, position, this.baseScale());
      }
      if (target.tz ** 2 !== 0 && target.tz ** 2 !== 1) {
        spring.color = 0x0000ff;
        spring.direction = 'z'
        if (position.z <= this.center().z) {
          spring.relationship = 'small';
        } else if (position.z > this.center().z) {
          spring.relationship = 'large';
        }
        this.CreateSpring(spring, position, this.baseScale());
      }

      // 回転バネ支点の分岐
      let rotatingspring = { direction: 'x', color: 0x000000 };;
      if (target.rx ** 2 !== 0 && target.rx ** 2 !== 1) {
        rotatingspring.color = 0xff0000;
        rotatingspring.direction = 'x'
        this.CreateRotatingSpring(rotatingspring, position, this.baseScale());
      }
      if (target.ry ** 2 !== 0 && target.ry ** 2 !== 1) {
        rotatingspring.color = 0x00ff00;
        rotatingspring.direction = 'y';
        this.CreateRotatingSpring(rotatingspring, position, this.baseScale());
      }
      if (target.rz ** 2 !== 0 && target.rz ** 2 !== 1) {
        rotatingspring.color = 0x0000ff;
        rotatingspring.direction = 'z';
        this.CreateRotatingSpring(rotatingspring, position, this.baseScale());
      }

    }
    this.onResize();
  }

  // ピン支点を描く
  public CreatePinfix(pin, position, maxLength) {
    let geometry = new THREE.Geometry;
    const material = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, color: pin.color });
    let x = position.x;
    let y = position.y;
    let z = position.z;
    geometry.vertices.push(new THREE.Vector3(x, y, z));  //一点目
    switch (pin.direction) {
      case 'x':
        x = position.x
        switch (pin.relationship) {
          case 'small':
            y = position.y + 0.1 * maxLength;
            z = position.z - 0.2 * maxLength;
            geometry.vertices.push(new THREE.Vector3(x, y, z));  //二点目
            y = position.y - 0.1 * maxLength;
            geometry.vertices.push(new THREE.Vector3(x, y, z));  //三点目
            break;
          case 'large':
            y = position.y + 0.1 * maxLength;
            z = position.z + 0.2 * maxLength;
            geometry.vertices.push(new THREE.Vector3(x, y, z));  //二点目
            y = position.y - 0.1 * maxLength;
            geometry.vertices.push(new THREE.Vector3(x, y, z));  //三点目
            break;
        }
        break;
      case 'y':
        y = position.y;
        switch (pin.relationship) {
          case 'small':
            x = position.x + 0.1 * maxLength;
            z = position.z - 0.2 * maxLength;
            geometry.vertices.push(new THREE.Vector3(x, y, z));  //二点目
            x = position.x - 0.1 * maxLength;
            geometry.vertices.push(new THREE.Vector3(x, y, z));  //三点目
            break;
          case 'large':
            x = position.x + 0.1 * maxLength;
            z = position.z + 0.2 * maxLength;
            geometry.vertices.push(new THREE.Vector3(x, y, z));  //二点目
            x = position.x - 0.1 * maxLength;
            geometry.vertices.push(new THREE.Vector3(x, y, z));  //三点目
            break;
        }
        break;
      case 'z':
        z = position.z;
        switch (pin.relationship) {
          case 'small':
            x = position.x + 0.1 * maxLength;
            y = position.y - 0.2 * maxLength;
            geometry.vertices.push(new THREE.Vector3(x, y, z));  //二点目
            x = position.x - 0.1 * maxLength;
            geometry.vertices.push(new THREE.Vector3(x, y, z));  //三点目
            break;
          case 'large':
            x = position.x + 0.1 * maxLength;
            y = position.y + 0.2 * maxLength;
            geometry.vertices.push(new THREE.Vector3(x, y, z));  //二点目
            x = position.x - 0.1 * maxLength;
            geometry.vertices.push(new THREE.Vector3(x, y, z));  //三点目
            break;
        }
        break;
    }
    const normal = new THREE.Vector3(0, 0, 1);
    const face = new THREE.Face3(0, 1, 2, normal, pin.color);
    geometry.faces.push(face);
    let mesh = new THREE.Mesh(geometry, material);
    this.fixnodeList.push(mesh);
    this.scene.add(mesh);
    geometry = new THREE.Geometry;
  }

  // 固定支点を描く
  public CreateFixed(fixed, position, maxLength) {
    const side = 0.06 * maxLength;
    let geometry = new THREE.PlaneGeometry(side, 2.5 * side);
    const material = new THREE.MeshBasicMaterial({ color: fixed.color, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    let x = position.x;
    let y = position.y;
    let z = position.z;
    switch (fixed.direction) {
      case 'x':
        switch (fixed.relationship) {
          case 'small':
            x = position.x - side / 2;
            break;
          case 'large':
            x = position.x + side / 2;
            break;
        }
        plane.position.set(x, y, z);
        break;
      case 'y':
        plane.rotation.z = Math.PI / 2;
        switch (fixed.relationship) {
          case 'small':
            y = position.y - side / 2;
            break;
          case 'large':
            y = position.y + side / 2;
            break;
        }
        plane.position.set(x, y, z);
        break;
      case 'z':
        plane.rotation.y = Math.PI / 2;
        switch (fixed.relationship) {
          case 'small':
            z = position.z - side / 2;
            break;
          case 'large':
            z = position.z + side / 2;
            break;
        }
        plane.position.set(x, y, z);
        break;
    }
    this.fixnodeList.push(plane);
    this.scene.add(plane);
    geometry = new THREE.PlaneGeometry;
  }

  // 完全な固定支点を描く
  public CreateFixed_P(fixed_Parfect, position, maxLength) {
    fixed_Parfect.color = 0x808080;
    const size = 0.2 * maxLength;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({ color: fixed_Parfect.color });
    const cube = new THREE.Mesh(geometry, material);
    switch (fixed_Parfect.directionX) {
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
    };
    cube.position.set(position.x, position.y, position.z);
    this.fixnodeList.push(cube);
    this.scene.add(cube);
  }

  // バネ支点を描く
  public CreateSpring(spring, position, maxLength) {
    let geometry = new THREE.Geometry();
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
          x = position.x - i * increase * maxLength;
          y = position.y + radius * Math.cos(Math.PI / 180 * i) * maxLength;
          z = position.z + radius * Math.sin(Math.PI / 180 * i) * maxLength;
          break;
        case ('y'):
          x = position.x + radius * Math.cos(Math.PI / 180 * i) * maxLength;
          y = position.y - i * increase * maxLength;
          z = position.z + radius * Math.sin(Math.PI / 180 * i) * maxLength;
          break;
        case ('z'):
          x = position.x + radius * Math.cos(Math.PI / 180 * i) * maxLength;
          y = position.y + radius * Math.sin(Math.PI / 180 * i) * maxLength;
          z = position.z - i * increase * maxLength;
          break;
      }
      geometry.vertices.push(new THREE.Vector3(x, y, z));
    }
    const line = new THREE.LineBasicMaterial({ color: spring.color });
    const mesh = new THREE.Line(geometry, line);
    this.fixnodeList.push(mesh);
    this.scene.add(mesh);
    geometry = new THREE.Geometry();
  }

  // 回転バネ支点を描く
  public CreateRotatingSpring(rotatingspring, position, maxLength) {
    let geometry = new THREE.Geometry();
    const laps = 3 + 0.25;
    const split = 10;
    const radius = 0.1 * 0.002;
    let x = position.x;
    let y = position.y;
    let z = position.z;
    for (let j = 0; j <= laps * 360; j += split) {
      switch (rotatingspring.direction) {
        case 'x':
          x = position.x;
          y = position.y + radius * Math.cos(Math.PI / 180 * j) * maxLength * j;
          z = position.z + radius * Math.sin(Math.PI / 180 * j) * maxLength * j;
          break;
        case 'y':
          x = position.x + radius * Math.cos(Math.PI / 180 * j) * maxLength * j;
          y = position.y;
          z = position.z + radius * Math.sin(Math.PI / 180 * j) * maxLength * j;
          break;
        case 'z':
          x = position.x + radius * Math.cos(Math.PI / 180 * j) * maxLength * j;
          y = position.y + radius * Math.sin(Math.PI / 180 * j) * maxLength * j;
          z = position.z;
          break;
      }
      geometry.vertices.push(new THREE.Vector3(x, y, z));
    }
    const line = new THREE.LineBasicMaterial({ color: rotatingspring.color });
    const mesh = new THREE.Line(geometry, line);
    this.fixnodeList.push(mesh);
    this.scene.add(mesh);
    geometry = new THREE.Geometry();
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
