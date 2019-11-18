import { Injectable } from '@angular/core';
import { InputDataService } from 'src/app/providers/input-data.service';
import { SceneService } from './scene.service';
import * as THREE from 'three';
import { DataHelperModule } from 'src/app/providers/data-helper.module';
import { DeclareFunctionStmt } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  private geometry: THREE.SphereBufferGeometry;
  private material: THREE.MeshLambertMaterial;
  // private geometry: THREE.CircleGeometry;
  // private material: THREE.MeshBasicMaterial;
  // private geometry: THREE.Geometry;
  // private material: THREE.PointsMaterial;

  constructor(private helper: DataHelperModule,
              private input: InputDataService,
              private scene: SceneService) {
    this.geometry = new THREE.SphereBufferGeometry(20);
    this.material = new THREE.MeshLambertMaterial({ color: 0x000000 });

    // this.material = new THREE.MeshBasicMaterial( { color: 0xeeee00 } );
    // this.geometry = new THREE.CircleGeometry( 200, 500 );

    // this.geometry = new THREE.Geometry();
    // this.material = new THREE.PointsMaterial({
    //     size: 10
    // });

    // const PARTICLE_SIZE = 200;

    // const vertices = new THREE.BoxGeometry( 200, 200, 200, 16, 16, 16 ).vertices;
    // const positions = new Float32Array( vertices.length * 3 );
    // const colors = new Float32Array( vertices.length * 3 );
    // const sizes = new Float32Array( vertices.length );
    // let vertex;
    // const color = new THREE.Color();
    // for ( let i = 0, l = vertices.length; i < l; i ++ ) {
    //   vertex = vertices[ i ];
    //   vertex.toArray( positions, i * 3 );
    //   color.setHSL( 0.01 + 0.1 * ( i / l ), 1.0, 0.5 );
    //   color.toArray( colors, i * 3 );
    //   sizes[ i ] = PARTICLE_SIZE * 0.5;
    // }
    // const geometry = new THREE.BufferGeometry();
    // geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    // geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
    // geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

    // const material = new THREE.ShaderMaterial( {
    //   uniforms: {
    //     color: { value: new THREE.Color( 0xffffff ) },
    //     pointTexture: { value: new THREE.TextureLoader().load( './assets/img/disc.png' ) }
    //   },
    //   vertexShader: function() {
    //     attribute float size;
    //     attribute vec3 customColor;
    //     varying vec3 vColor;
    //     void main() {
    //       vColor = customColor;
    //       vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    //       gl_PointSize = size * ( 300.0 / -mvPosition.z );
    //       gl_Position = projectionMatrix * mvPosition;
    // 		}
    //   },
    //   fragmentShader: function(){
    //     uniform vec3 color;
    //     uniform sampler2D pointTexture;
    //     varying vec3 vColor;
    //     void main() {
    //       gl_FragColor = vec4( color * vColor, 1.0 );
    //       gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
    //       if ( gl_FragColor.a < ALPHATEST ) discard;
    //     }
    //   },
    //   alphaTest: 0.9
    // } );
    //
    // const particles = new THREE.Points( geometry, material );
    // scene.add( particles );

  }

  public chengeData(): void {
    // 入力データを入手
    const jsonData = this.input.node.getNodeJson('calc');
    const jsonKeys = Object.keys(jsonData);
    if (jsonKeys.length <= 0) { return; }

    // 入力データに無い要素を排除する
    const filtered = this.scene.selectiveObjects.filter((target) => {
      return (jsonKeys.find((key) => key = target.name) !== undefined);
    });
    this.scene.selectiveObjects = filtered;

    // 新しい入力を適用する
    for (const key of jsonKeys) {
      const item = this.scene.selectiveObjects.find((target) => {
        return (target.name === key);
      });
      if (item !== undefined) {
        // すでに同じ名前の要素が存在している場合座標の更新のみ
        item.position.x = jsonData[key].x;
        item.position.y = jsonData[key].y;
        item.position.z = jsonData[key].z;
      } else {
        // // 頂点データを生成
        // const particle = new THREE.Vector3(jsonData[key].x, jsonData[key].y, jsonData[key].z);
        // // 頂点色を設定
        // const color = new THREE.Color(0x000000);
        // // 頂点データをジオメトリに追加
        // this.geometry.vertices.push(particle);
        // // 頂点色をジオメトリに追加
        // this.geometry.colors.push(color);
        // const point = new THREE.Points(this.geometry, this.material);
        // this.scene.add(point);

        // 要素をシーンに追加
        const mesh = new THREE.Mesh(this.geometry, this.material);
        mesh.name = key;
        mesh.position.x = jsonData[key].x;
        mesh.position.y = jsonData[key].y;
        mesh.position.z = jsonData[key].z;
        this.scene.selectiveObjects.push(mesh);
        this.scene.add(mesh);
      }
    }
    this.scene.render();
    
  }

  public ClearData(): void {

  }

  public ChengeMode(ModeName: string, currentPage: number = null): void {

    switch (ModeName) {
      case 'nodes':
        break;

      case 'fix_nodes':
        break;

      case 'members':
        break;

      case 'joints':
        break;

      case 'loads':
        break;

      case 'notice_points':
        break;

      case 'comb_disg':
        break;

      case 'comb_fsec':
        break;

      case 'comb_reac':
        break;

      case 'disg':
        break;

      case 'fsec':
        break;

      case 'pik_disg':
        break;

      case 'pik_fsec':
        break;

      case 'pik_reac':
        break;

      case 'reac':
        break;
    }

  }
}
