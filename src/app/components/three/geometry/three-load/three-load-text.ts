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
    vartical = 'bottom'): Text {

    // Create:
    const text = new Text();
    text.name = 'text';
    // Set properties to configure:
    text.text = textString;
    text.fontSize = size;

    text.rotateZ(Math.PI);
    text.rotateY(Math.PI);

    text.anchorY = vartical;
    text.anchorX = horizontal;

    text.position.set(position.x, position.y, 0);

    text.color = 0x000000;
    // Update the rendering:
    text.sync();

    return text;
  }

    // 文字を変更する
    public change(
      text: Text,
      textString: string,
      position: THREE.Vector2,
      size: number,
      horizontal = 'center',
      vartical = 'bottom'): void {
  
      // Create:
      text.name = 'text';
      // Set properties to configure:
      text.text = textString;
      text.fontSize = size;
  
      text.anchorY = vartical;
      text.anchorX = horizontal;
  
      // Update the rendering:
      text.sync();
  
    }


  public dispose(text: Text) {
    text.dispose();
  } 


}
