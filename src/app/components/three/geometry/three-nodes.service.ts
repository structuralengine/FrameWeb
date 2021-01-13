import { Injectable } from "@angular/core";
import { SceneService } from "../scene.service";
import { InputNodesService } from "../../../components/input/input-nodes/input-nodes.service";
import * as THREE from "three";
import { CSS2DObject } from "../libs/CSS2DRenderer.js";

@Injectable({
  providedIn: "root",
})
export class ThreeNodesService {
  public baseScale: number; // 最近点から求める基準のスケール

  public maxDistance: number;
  public minDistance: number;

  private particles: THREE.Points;
  private sprite: THREE.Texture;

  private selectionItem: THREE.Object3D; // 選択中のアイテム
  public center: any; // すべての点の重心位置

  // 大きさを調整するためのスケール
  private scale: number;
  private params: any; // GUIの表示制御
  private gui: any;

  private objVisible: boolean;
  private txtVisible: boolean;

  constructor(private scene: SceneService, private node: InputNodesService) {
    this.particles = null;
    this.sprite = new THREE.TextureLoader().load("/assets/img/disc.png");
    this.ClearData();

    this.objVisible = true;
    this.txtVisible = false;

    // gui
    this.scale = 100;
    this.params = {
      nodeNo: this.txtVisible,
      nodeScale: this.scale,
    };
    this.gui = null;
  }

  // 初期化
  public OnInit(): void {
    // 節点番号の表示を制御する gui を登録する
    this.scene.gui.add(this.params, "nodeNo").onChange((value) => {
      for (const mesh of this.particles.children) {
        mesh.getObjectByName("font").visible = value;
      }
      this.txtVisible = value;
      this.scene.render();
    });
  }

  // データが変更された時の処理
  public chengeData(): void {
    // 入力データを入手
    const jsonData = this.node.getNodeJson(0);
    const jsonKeys = Object.keys(jsonData);
    if (jsonKeys.length <= 0) {
      this.ClearData();
      return;
    }

    this.ClearData();

    // 新しい入力を適用する
    const geometry = new THREE.Geometry();
    for (const key of jsonKeys) {
      const pos = new THREE.Vector3(
        jsonData[key].x,
        jsonData[key].y,
        jsonData[key].z
      );
      geometry.vertices.push(pos);
    }

    // パーティクルのマテリアルを作成
    const material = new THREE.PointsMaterial({
      size: 1.334,
      sizeAttenuation: true, //false:カメラからの距離にかかわらずパーティクルが同じ大きさになる
      map: this.sprite,
      alphaTest: 0.5,
      transparent: true,
    });
    material.color.setHSL(0, 0, 0);

    // パーティクルを作成
    this.particles = new THREE.Points(geometry, material);

    // 文字をシーンに追加
    for (const key of jsonKeys) {
      const div = document.createElement("div");
      div.className = "label";
      div.textContent = key;
      div.style.marginTop = "-1em";
      const label = new CSS2DObject(div);
      label.position.set(jsonData[key].x, jsonData[key].y + 0.27, jsonData[key].z);
      label.name = "font";
      label.visible = this.txtVisible;
      this.particles.add(label);
    }

    this.scene.add(this.particles);

    // サイズを調整する
    this.setBaseScale();
    this.onResize();
  }

  // データをクリアする
  public ClearData(): void {

    this.baseScale = 1;
    this.maxDistance = 0;
    this.minDistance = 0;
    this.center = { x: 0, y: 0, z: 0 };

    if (this.particles === null) return;

    // 文字を削除する
    while (this.particles.children.length > 0) {
      const object = this.particles.children[0];
      object.parent.remove(object);
    }
    // オブジェクトを削除する
    this.scene.remove(this.particles);
    this.particles = null;

  }

  // 最近点からスケールを求める
  private setBaseScale(): void {
    // 入力データを入手
    const jsonData = this.node.getNodeJson(0);
    const jsonKeys = Object.keys(jsonData);
    if (jsonKeys.length <= 0) {
      this.ClearData();
      return;
    }

    // 最近傍点を探す
    this.minDistance = Number.MAX_VALUE;
    this.maxDistance = 0;
    for (const key1 of jsonKeys) {
      const item1 = jsonData[key1];
      for (const key2 of jsonKeys) {
        const item2 = jsonData[key2];
        const l = Math.sqrt(
          (item1.x - item2.x) ** 2 +
          (item1.y - item2.y) ** 2 +
          (item1.z - item2.z) ** 2
        );
        if (l === 0) {
          continue;
        }
        this.minDistance = Math.min(l, this.minDistance);
        this.maxDistance = Math.max(l, this.maxDistance);
      }
    }

    // baseScale を決定する
    this.baseScale = 1;
    if (this.minDistance !== Number.MAX_VALUE) {
      // baseScale は最遠点の 1/500 以下
      // baseScale は最近点の 1/50 以上とする
      this.baseScale = Math.max(this.maxDistance / 500, this.minDistance / 50);
    }

    // 重心位置を計算する
    let counter: number = 0;
    this.center = new THREE.Vector3();
    for (const key of jsonKeys) {
      const p = jsonData[key];
      this.center.x += p.x;
      this.center.y += p.y;
      this.center.z += p.z;
      counter++;
    }
    if (counter > 0) {
      this.center.x = this.center.x / counter;
      this.center.y = this.center.y / counter;
      this.center.z = this.center.z / counter;
    }
  }

  // スケールを反映する
  private onResize(): void {
    let sc = this.scale / 100; // this.scale は 100 が基準値なので、100 のとき 1 となるように変換する
    sc = Math.max(sc, 0.001); // ゼロは許容しない

    const material: any = this.particles.material;
    material.size = this.baseScale * sc;
  }

  // 表示設定を変更する
  public visible(flag: boolean, text: boolean, gui: boolean): void {
    // 表示設定
    if (this.objVisible !== flag) {
      this.particles.visible = flag;
      this.objVisible = flag;
    }

    // guiの表示設定
    if (gui === true) {
      this.guiEnable();
    } else {
      this.guiDisable();
    }
  }

  // guiを表示する
  private guiEnable(): void {
    if (this.gui !== null) {
      return;
    }
    this.gui = this.scene.gui
      .add(this.params, "nodeScale", 0, 1000)
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

  // マウス位置とぶつかったオブジェクトを検出する
  public detectObject(raycaster: THREE.Raycaster, action: string): void {
    if (this.particles.children.length === 0) {
      return; // 対象がなければ何もしない
    }

    // 交差しているオブジェクトを取得
    const intersects = raycaster.intersectObjects(this.particles.children);

    switch (action) {
      case "click":
        this.particles.children.map((item) => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            const material = item["material"];
            material["color"].setHex(0xff0000);
            material["opacity"] = 1.0;
          }
        });
        break;

      case "select":
        this.selectionItem = null;
        this.particles.children.map((item) => {
          const material = item["material"];
          if (intersects.length > 0 && item === intersects[0].object) {
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
        break;

      case "hover":
        this.particles.children.map((item) => {
          const material = item["material"];
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
  }
}
