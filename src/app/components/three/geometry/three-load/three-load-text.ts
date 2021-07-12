import { Injectable } from '@angular/core';
import * as THREE from "three";
import {Text} from 'troika-three-text'

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
    vartical = 'bottom'): THREE.Group {


    //   // Create:
    // const myText = new Text();

    // // Set properties to configure:
    // myText.text = 'Hello world!';
    // myText.fontSize = 0.2;
    // myText.position.z = -2;
    // myText.color = 0x9966FF;

    // // Update the rendering:
    // myText.sync();

    // const group1 = new THREE.Group();
    // group1.add(myText);
    // group1.name = "text";

    // return group1;



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

    const height = Math.abs(text.geometry.boundingBox.max.y - text.geometry.boundingBox.min.y);
    const width = Math.abs(text.geometry.boundingBox.max.x - text.geometry.boundingBox.min.x);

    if (vartical === 'bottom') {
      text.position.y += 0.5 * height;
    } else if (vartical === 'top') {
      text.position.y -= 0.5 * height;
    }
    if (horizontal === 'left') {
      text.position.x += 0.5 * width;
    } else if (horizontal === 'right') {
      text.position.x -= 0.5 * width;
    }
    text.rotateZ(Math.PI);
    text.rotateY(Math.PI);

    const group = new THREE.Group();
    group.add(text);
    group.name = "text";

    return group;
  }

}
