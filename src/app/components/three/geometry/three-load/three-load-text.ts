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

  }

}


export class TextBoardObject { 

  private plane: any;
  private sprite: any;
  private texture: any;
  private boardWidth: any;
  private boardHeight: any;

  private backgroundColor: any;
  private textColor: any;
  private fontSize: any;
  private lineHeight: any;
  private fontName: any;
  private resolution: any;
  private _lineHeight: any;
  private textLines: any;
  private canvas: any;


  constructor( parameter ){

    //背景色（RGBA値を0から１で指定）
    this.backgroundColor = parameter.backgroundColor || {r:1, g:1, b:1, a:1};
    //文字色（RGBA値を0から１で指定）
    this.textColor = parameter.textColor || {r:0, g:0, b:0, a:1};

    //マッピング対象オブジェクトのサイズ（縦横比は２のべき乗を推奨）
    this.boardWidth = parameter.boardWidth || 100;
    this.boardHeight = parameter.boardHeight || 100;

    //フォントサイズと行間（canvas要素の横幅に対する[%]で指定）
    this.fontSize = parameter.fontSize || 10;      //フォントサイズ
    this.lineHeight = parameter.lineHeight || 1.1; //行間

    //フォント名（CSSで指定可能な形式）
    this.fontName = parameter.fontName || "serif"; //フォント名
    //解像度
    this.resolution = parameter.resolution || 4;

    this._lineHeight = 0;
    this.textLines = [];

    this.init();

    this.plane = null;
    this.sprite = null;

  }

  public cleatePlaneObject(){

    //テクスチャ画像用のcanvas要素の取得
    var canvas = this.getTextCanvas();
    //テクスチャオブジェクトの生成
    this.texture = new THREE.Texture( canvas );
    //テクスチャ画像の更新
    this.texture.needsUpdate = true;

    //形状オブジェクトの宣言と生成
    const geometry = new THREE.PlaneGeometry( this.boardWidth, this.boardHeight );
    //材質オブジェクトの宣言と生成
    // var material = new THREE.MeshBasicMaterial( { map : this.texture, transparent : true } );
    var material = new THREE.MeshBasicMaterial( { map : this.texture } );
    const material1 = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    //平面オブジェクトの生成
    this.plane = new THREE.Mesh( geometry, material );

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

