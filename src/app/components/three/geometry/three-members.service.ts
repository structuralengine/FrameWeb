import { Injectable } from "@angular/core";
import { SceneService } from "../scene.service";
import { InputNodesService } from "../../../components/input/input-nodes/input-nodes.service";
import { InputMembersService } from "../../../components/input/input-members/input-members.service";
import { ThreeNodesService } from "./three-nodes.service";
import * as THREE from "three";
import { CSS2DObject } from "../libs/CSS2DRenderer.js";
import { Vector3 } from "three";

@Injectable({
  providedIn: "root",
})
export class ThreeMembersService {

  private geometry: THREE.CylinderBufferGeometry;

  public maxDistance: number;
  public minDistance: number;

  private memberList: THREE.Object3D;
  private axisList: THREE.Group[]; // 軸は、メンバーのスケールと関係ないので、分けて管理する
  private selectionItem: THREE.Object3D; // 選択中のアイテム

  // 大きさを調整するためのスケール
  private scale: number;
  private params: any; // GUIの表示制御
  private gui: any;

  private objVisible: boolean;
  private txtVisible: boolean;

  constructor( private scene: SceneService,
              private nodeThree: ThreeNodesService,
              private node: InputNodesService,
              private member: InputMembersService) {

    this.geometry = new THREE.CylinderBufferGeometry();
    this.memberList = new THREE.Object3D();
    this.axisList = new Array();
    this.ClearData();
    this.scene.add(this.memberList);

    this.objVisible = true;
    this.txtVisible = false;

    // gui
    this.scale = 100;
    this.params = {
      memberNo: this.txtVisible,
      memberScale: this.scale,
    };
    this.gui = null;
  }

  // 初期化
  public OnInit(): void {
    // 部材番号の表示を制御する gui を登録する
    this.scene.gui.add(this.params, "memberNo").onChange((value) => {
      for (const mesh of this.memberList.children) {
        mesh.getObjectByName("font").visible = value;
      }
      this.txtVisible = value;
      this.scene.render();
    });

  }

  // 要素の太さを決定する基準値
  public baseScale(): number {
    const scale = this.nodeThree.baseScale;
    return scale * 0.3;
  }

  // データが変更された時の処理
  public changeData(): void {
    
    // 格点データを入手
    const nodeData = this.node.getNodeJson(0);
    const nodeKeys = Object.keys(nodeData);
    if (nodeKeys.length <= 0) {
      this.ClearData();
      return;
    }

    // メンバーデータを入手
    const jsonData = this.member.getMemberJson(0);
    const jsonKeys = Object.keys(jsonData);
    if (jsonKeys.length <= 0) {
      this.ClearData();
      return;
    }

    // 要素を排除する
    this.ClearData();

    // 新しい入力を適用する
    for (const key of jsonKeys) {
      // 節点データを集計する
      const member = jsonData[key];
      const i = nodeData[member.ni];
      const j = nodeData[member.nj];
      if (i === undefined || j === undefined) {
        continue;
      }

      const v = new THREE.Vector3(j.x - i.x, j.y - i.y, j.z - i.z);
      const len: number = v.length();
      if (len < 0.001) {
        continue;
      }
      this.minDistance = Math.min(len, this.minDistance);
      this.maxDistance = Math.max(len, this.maxDistance);

      const x: number = (i.x + j.x) / 2;
      const y: number = (i.y + j.y) / 2;
      const z: number = (i.z + j.z) / 2;
      // 要素をシーンに追加
      const geometry = new THREE.CylinderBufferGeometry(1, 1, len, 12);

      // 要素をシーンに追加
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );
      mesh.name = "member" + key;
      mesh.rotation.z = Math.acos(v.y / len);
      mesh.rotation.y = 0.5 * Math.PI + Math.atan2(v.x, v.z);
      mesh.position.set(x, y, z);

      this.memberList.children.push(mesh);

      // 文字をシーンに追加
      const div = document.createElement("div");
      div.className = "label";
      div.textContent = key;
      div.style.marginTop = "-1em";
      const label = new CSS2DObject(div);

      label.position.set(0, 0, 0);
      label.name = "font";
      label.visible = this.txtVisible;
      mesh.add(label);

      // ローカル座標を示す線を追加
      const group = new THREE.Group();
      const axis = this.localAxis(x, y, z, j.x, j.y, j.z, member.cg);
      const origin = new THREE.Vector3(x, y, z);
      const length = len * 0.2;

      // x要素軸
      const dirX = new THREE.Vector3(axis.x.x, axis.x.y, axis.x.z);
      const xline = new THREE.ArrowHelper(dirX, origin, length, 0xff0000);
      xline.name = "x";
      group.add(xline);
      // y要素軸
      const dirY = new THREE.Vector3(axis.y.x, axis.y.y, axis.y.z);
      const yline = new THREE.ArrowHelper(dirY, origin, length, 0x00ff00);
      yline.name = "y";
      group.add(yline);
      // z要素軸
      const dirZ = new THREE.Vector3(axis.z.x, axis.z.y, axis.z.z);
      const zline = new THREE.ArrowHelper(dirZ, origin, length, 0x0000ff);
      zline.name = "z";
      group.add(zline);

      group.name = mesh.name + "axis";
      group.visible = false;
      this.axisList.push(group);
      this.scene.add(group);
    }
    this.onResize();
  }

  // データをクリアする
  public ClearData(): void {
    // 線を削除する
    for (const mesh of this.memberList.children) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
      this.scene.remove(mesh);
    }
    this.memberList.children = new Array();

    // ローカル座標を示す線を削除する
    for (const group of this.axisList) {
      this.scene.remove(group);
    }
    this.axisList = new Array();

    this.minDistance = Number.MAX_VALUE;
    this.maxDistance = 0;
  }

  // スケールを反映する
  private onResize(): void {

    let sc = this.scale / 100; // this.scale は 100 が基準値なので、100 のとき 1 となるように変換する
    sc = Math.max(sc, 0.001); // ゼロは許容しない

    let scale: number = this.baseScale() * sc;
  
    for (const item of this.memberList.children) {
      item.scale.set(scale, 1, scale);
    }
    scale *= 50 ;
    for (const arrows of this.axisList) {
      for (const item of arrows.children) {
        item.scale.set(scale, scale, scale);
      }
    }
  }

  // 表示設定を変更する
  public visibleChange(flag: boolean, text: boolean, gui: boolean): void {

    // 表示設定
    if (this.objVisible !== flag) {
      this.memberList.visible = flag;
      this.objVisible = flag;
    }

    // 部材軸の表示設定
    if (text === false) {
      // テキストが非表示なら部材軸の表示も消す
      for (const group of this.axisList) {
        group.visible = false;
      }
    }

    // guiの表示設定
    if (gui === true) {
      this.guiEnable();
    } else {
      // 黒に戻す
      this.selectionItem = null;
      this.memberList.children.map((item) => {
        // 元の色にする
        const material = item['material'];
        material["color"].setHex(0x000000);
        material["opacity"] = 1.0;
      });
      this.axisList.map((item) => {
        item.visible = false;
      });
      this.guiDisable();
    }
  }

  // guiを表示する
  private guiEnable(): void {
    if (this.gui !== null) {
      return;
    }

    this.gui = this.scene.gui
      .add(this.params, "memberScale", 0, 1000)
      .step(1)
      .onChange((value) => {
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

  // 部材座標軸を
  public localAxis(
    xi: number,
    yi: number,
    zi: number,
    xj: number,
    yj: number,
    zj: number,
    theta: number
  ): any {
    const xM: number[] = [1, 0, 0]; // x だけ1の行列
    const yM: number[] = [0, 1, 0]; // y だけ1の行列
    const zM: number[] = [0, 0, 1]; // z だけ1の行列

    const DX: number = xj - xi;
    const DY: number = yj - yi;
    const DZ: number = zj - zi;
    const EL: number = Math.sqrt(
      Math.pow(DX, 2) + Math.pow(DY, 2) + Math.pow(DZ, 2)
    );

    const ll: number = DX / EL;
    const mm: number = DY / EL;
    const nn: number = DZ / EL;

    const qq = Math.sqrt(Math.pow(ll, 2) + Math.pow(mm, 2));

    const t1: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const t2: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    // 座標変換ベクトルを用意
    t1[0][0] = 1;
    t1[1][1] = Math.cos(theta);
    t1[1][2] = Math.sin(theta);
    t1[2][1] = -Math.sin(theta);
    t1[2][2] = Math.cos(theta);

    if (DX === 0 && DY === 0) {
      t2[0][2] = nn;
      t2[1][0] = nn;
      t2[2][1] = 1;
    } else {
      t2[0][0] = ll;
      t2[0][1] = mm;
      t2[0][2] = nn;
      t2[1][0] = -mm / qq;
      t2[1][1] = ll / qq;
      t2[2][0] = (-ll * nn) / qq;
      t2[2][1] = (-mm * nn) / qq;
      t2[2][2] = qq;
    }

    // 座標変換ベクトル × 荷重ベクトル
    const t3 = this.dot(t1, t2);
    const tt = this.getInverse(t3);

    const X = new Vector3(
      tt[0][0] * xM[0] + tt[0][1] * xM[1] + tt[0][2] * xM[2],
      tt[1][0] * xM[0] + tt[1][1] * xM[1] + tt[1][2] * xM[2],
      tt[2][0] * xM[0] + tt[2][1] * xM[1] + tt[2][2] * xM[2],
    );
    const Y = new Vector3(
      tt[0][0] * yM[0] + tt[0][1] * yM[1] + tt[0][2] * yM[2],
      tt[1][0] * yM[0] + tt[1][1] * yM[1] + tt[1][2] * yM[2],
      tt[2][0] * yM[0] + tt[2][1] * yM[1] + tt[2][2] * yM[2],
    );
    const Z = new Vector3(
      tt[0][0] * zM[0] + tt[0][1] * zM[1] + tt[0][2] * zM[2],
      tt[1][0] * zM[0] + tt[1][1] * zM[1] + tt[1][2] * zM[2],
      tt[2][0] * zM[0] + tt[2][1] * zM[1] + tt[2][2] * zM[2],
    );
    const result = {
      x: X,
      y: Y,
      z: Z,
    };
    return result;
  }

  private dot(a: number[][], B: number[][]): number[][] {
    const u: number = a.length;

    const AB = Array(u)
      .fill(0)
      .map((x) => Array(u).fill(0));
    // 行列の計算を行う
    for (let i = 0; i < u; i++) {
      for (let j = 0; j < u; j++) {
        let sum = 0;
        for (let k = 0; k < u; k++) {
          sum = sum + a[i][k] * B[k][j];
        }
        AB[i][j] = sum;
      }
    }
    return AB;
  }

  private getInverse(t3: number[][]): number[][] {
    const m = t3.length;
    const n = t3[0].length;
    const tt = Array(m)
      .fill(0)
      .map((x) => Array(n).fill(0));
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        tt[j][i] = t3[i][j];
      }
    }
    return tt;
  }

  // マウス位置とぶつかったオブジェクトを検出する
  public detectObject(raycaster: THREE.Raycaster, action: string): void {
    
    if (this.memberList.children.length === 0) {
      return; // 対象がなければ何もしない
    }

    // 交差しているオブジェクトを取得
    const intersects = raycaster.intersectObjects(this.memberList.children);
    if ( intersects.length <= 0 ){
      return;
    }

    switch (action) {
      case "click":
        this.memberList.children.map((item) => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            const material = item['material'];
            material["color"].setHex(0xff0000);
            material["opacity"] = 1.0;
          }
        });
        break;

      case "select":
        if (intersects.length > 0) {
          this.selectionItem = null;
          this.memberList.children.map((item) => {
            const material = item['material'];
            if (item === intersects[0].object) {
              // 色を赤くする
              material["color"].setHex(0xff0000);
              material["opacity"] = 1.0;
              this.selectionItem = item;
            } else {
              // それ以外は元の色にする
              material["color"].setHex(0x000000);
              material["opacity"] = 1.0;
            }
          });
          // 選択されたアイテムの軸を表示する
          if (this.selectionItem !== null) {
            this.axisList.map((item) => {
              const key: string = this.selectionItem.name + "axis";
              if (item.name === key) {
                item.visible = true;
              } else {
                item.visible = false;
              }
            });
          }
        }
        break;

      case "hover":
        this.memberList.children.map((item) => {
          const material = item['material'];
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            material["color"].setHex(0xff0000);
            material["opacity"] = 0.25;
          } else {
            if (item === this.selectionItem) {
              material["color"].setHex(0xff0000);
              material["opacity"] = 1.0;
            } else {
              // それ以外は元の色にする
              material["color"].setHex(0x000000);
              material["opacity"] = 1.0;
            }
          }
        });
        break;

      default:
        return;
    }
    this.scene.render();
  }

}
