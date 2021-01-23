import { Injectable } from '@angular/core';
import * as THREE from "three";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadText { 

  private font: THREE.Font;

  constructor(font: THREE.Font) {
    this.font = font;
  }

  // 文字を描く
  public create(
    textString: string,
    position: THREE.Vector2,
    size: number,
    horizontal = 'center',
    vartical = 'bottom'): THREE.Mesh {

    const text_geo = new THREE.TextGeometry(textString, {
      font: this.font,
      size: size,
      height: 0.001,
      curveSegments: 4,
      bevelEnabled: false,
    });

    const text_mat = [
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    ];

    text_geo.center();

    const text = new THREE.Mesh(text_geo, text_mat);

    text.position.set(position.x, position.y, 0);

    if (vartical === 'bottom') {
      text.position.y +=
        0.5 *
        (text.geometry.boundingBox.max.y - text.geometry.boundingBox.min.y);
    } else if (vartical === 'top') {
      text.position.y -=
        0.5 *
        (text.geometry.boundingBox.max.y - text.geometry.boundingBox.min.y);
    }
    if (horizontal === 'left') {
      text.position.x +=
        0.5 *
        (text.geometry.boundingBox.max.x - text.geometry.boundingBox.min.x);
    } else if (horizontal === 'right') {
      text.position.x -=
        0.5 *
        (text.geometry.boundingBox.max.x - text.geometry.boundingBox.min.x);
    }


    return text;
  }

}
