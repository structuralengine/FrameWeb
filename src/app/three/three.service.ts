import { Injectable, ElementRef, OnDestroy, NgZone } from '@angular/core';

import * as THREE from 'three';
import Stats from './libs/stats.module.js';
import { GUI } from './libs/dat.gui.module.js';

import { DragControls } from './libs/DragControls.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { TransformControls } from './libs/TransformControls.js';

@Injectable({
  providedIn: 'root'
})
export class ThreeService implements OnDestroy {

  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private objGroup: THREE.Group;
  private isRotate: boolean;

  private frameId: number = null;
  private stats: Stats;
  private splineHelperObjects = [];
  private splinePointsLength = 4;
  private positions = [];
  private point = new THREE.Vector3();
  private transformControl;
  private ARC_SEGMENTS = 200;
  private hiding;

  private geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );

  private params = {
    uniform: true,
    tension: 0.5,
    centripetal: true,
    chordal: true,
    addPoint: this.addPoint,
    removePoint: this.removePoint,
    exportSpline: this.exportSpline,
    self: undefined
  };

  private splines = {};

  // マウス座標管理用のベクトルを作成
  private mouse: THREE.Vector2;

  public constructor(private ngZone: NgZone) { }

  public ngOnDestroy() {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;

    this.params.self = this;

    // create the scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xf0f0f0 );

    // カメラの配置
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.set( 0, 250, 1000 );
    this.scene.add( this.camera );

    // 環境光源
    this.scene.add( new THREE.AmbientLight( 0xf0f0f0 ) );
    var light = new THREE.SpotLight( 0xffffff, 1.5 );
    light.position.set( 0, 1500, 200 );
    light.castShadow = true;
    light.shadow = new THREE.SpotLightShadow( new THREE.PerspectiveCamera( 70, 1, 200, 2000 ) );
    light.shadow.bias = - 0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    this.scene.add( light );

    var planeGeometry = new THREE.PlaneBufferGeometry( 2000, 2000 );
    planeGeometry.rotateX( - Math.PI / 2 );
    var planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2 } );

    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = - 200;
    plane.receiveShadow = true;
    this.scene.add( plane );

    var helper = new THREE.GridHelper( 2000, 100 );
    helper.position.y = - 199;
    helper.material['opacity'] = 0.25;
    helper.material['transparent'] = true;
    this.scene.add( helper );

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight - 105);

    this.stats = new Stats();
    this.canvas.appendChild( this.stats.dom );
    var gui = new GUI();

    gui.add( this.params, 'uniform' );
    gui.add( this.params, 'tension', 0, 1 ).step( 0.01 ).onChange( function ( value ) {
      self.splines['uniform']['tension'] = value;
      self.updateSplineOutline();
    } );
    gui.add( this.params, 'centripetal' );
    gui.add( this.params, 'chordal' );
    gui.add( this.params, 'addPoint' );
    gui.add( this.params, 'removePoint' );
    gui.add( this.params, 'exportSpline' );
    gui.open();

    let self = this;
    // Controls
    var controls = new OrbitControls( this.camera, this.renderer.domElement );
    controls.damping = 0.2;
    controls.addEventListener( 'change', self.render );
    controls.addEventListener( 'start', function () {
      self.cancelHideTransform();
    } );
    controls.addEventListener( 'end', function () {
      self.delayHideTransform();
    } );

    this.transformControl = new TransformControls( this.camera, this.renderer.domElement );
    this.transformControl.addEventListener( 'change', self.render );
    this.transformControl.addEventListener( 'dragging-changed', function ( event ) {
      controls.enabled = ! event.value;
    } );
    this.scene.add( this.transformControl );
    // Hiding transform situation is a little in a mess :()
    this.transformControl.addEventListener( 'change', function () {
      self.cancelHideTransform();
    } );
    this.transformControl.addEventListener( 'mouseDown', function () {
      self.cancelHideTransform();
    } );
    this.transformControl.addEventListener( 'mouseUp', function () {
      self.delayHideTransform();
    } );
    this.transformControl.addEventListener( 'objectChange', function () {
      self.updateSplineOutline();
    } );

    var dragcontrols = new DragControls( this.splineHelperObjects, this.camera, this.renderer.domElement ); //
    dragcontrols.enabled = false;
    dragcontrols.addEventListener( 'hoveron', function ( event ) {
      self.transformControl.attach( event.object );
      self.cancelHideTransform();
    } );
    dragcontrols.addEventListener( 'hoveroff', function () {
      self.delayHideTransform();
    } );

    /*******
     * Curves
     *********/
    for ( var i = 0; i < this.splinePointsLength; i ++ ) {
      this.addSplineObject( this.positions[ i ] );
    }
    this.positions = [];
    for ( var i = 0; i < this.splinePointsLength; i ++ ) {
      this.positions.push( this.splineHelperObjects[ i ].position );
    }

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( this.ARC_SEGMENTS * 3 ), 3 ) );
    var curve = new THREE.CatmullRomCurve3( this.positions );
    curve['curveType'] = 'catmullrom';
    curve['mesh'] = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
      color: 0xff0000,
      opacity: 0.35
    } ) );
    curve['mesh']['castShadow'] = true;
    this.splines['uniform'] = curve;
    curve = new THREE.CatmullRomCurve3( this.positions );
    curve['curveType'] = 'centripetal';
    curve['mesh'] = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
      color: 0x00ff00,
      opacity: 0.35
    } ) );
    curve['mesh']['castShadow'] = true;
    this.splines['centripetal'] = curve;
    curve = new THREE.CatmullRomCurve3( this.positions );
    curve['curveType'] = 'chordal';
    curve['mesh'] = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
      color: 0x0000ff,
      opacity: 0.35
    } ) );
    curve['mesh']['castShadow'] = true;
    this.splines['chordal'] = curve;
    for ( var k in this.splines ) {
      var spline = this.splines[ k ];
      this.scene.add( spline.mesh );
    }

    this.load( [ new THREE.Vector3( 289.76843686945404, 452.51481137238443, 56.10018915737797 ),
      new THREE.Vector3( - 53.56300074753207, 171.49711742836848, - 14.495472686253045 ),
      new THREE.Vector3( - 91.40118730204415, 176.4306956436485, - 6.958271935582161 ),
      new THREE.Vector3( - 383.785318791128, 491.1365363371675, 47.869296953772746 ) ] );
  }

  delayHideTransform() {
    this.cancelHideTransform();
    this.hideTransform();
  }

  cancelHideTransform() {
    if ( this.hiding ) clearTimeout( this.hiding );
  }

  hideTransform() {
    let self = this;
    this.hiding = setTimeout( function () {
      self.transformControl.detach( self.transformControl.object );
    }, 2500 );
  }

  addSplineObject( position ) {
    var material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
    var object = new THREE.Mesh( this.geometry, material );
    if ( position ) {
      object.position.copy( position );
    } else {
      object.position.x = Math.random() * 1000 - 500;
      object.position.y = Math.random() * 600;
      object.position.z = Math.random() * 800 - 400;
    }
    object.castShadow = true;
    object.receiveShadow = true;
    this.scene.add( object );
    this.splineHelperObjects.push( object );

    return object;
  }
  addPoint(): void {
    //if (this.self) {
      this.splinePointsLength ++;
      this.positions.push( this.addSplineObject(undefined).position );
      this.updateSplineOutline();
    //}
  }
  removePoint() {
    if ( this.splinePointsLength <= 4 ) {
      return;
    }
    this.splinePointsLength --;
    this.positions.pop();
    this.scene.remove( this.splineHelperObjects.pop() );
    this.updateSplineOutline();
  }
  updateSplineOutline() {
    for ( var k in this.splines ) {
      var spline = this.splines[ k ];
      var splineMesh = spline.mesh;
      var position = splineMesh.geometry.attributes.position;
      for ( var i = 0; i < this.ARC_SEGMENTS; i ++ ) {
        var t = i / ( this.ARC_SEGMENTS - 1 );
        spline.getPoint( t, this.point );
        position.setXYZ( i, this.point.x, this.point.y, this.point.z );
      }
      position.needsUpdate = true;
    }
  }
  exportSpline() {
    var strplace = [];
    for ( var i = 0; i < this.splinePointsLength; i ++ ) {
      var p = this.splineHelperObjects[ i ].position;
      strplace.push( 'new THREE.Vector3(' + p.x + ', ' + p.y + ', ' + p.z + ')' );
    }
    console.log( strplace.join( ',\n' ) );
    var code = '[' + ( strplace.join( ',\n\t' ) ) + ']';
    prompt( 'copy and paste code', code );
  }

  load( new_positions ) {
    while ( new_positions.length > this.positions.length ) {
      this.addPoint();
    }
    while ( new_positions.length < this.positions.length ) {
      this.removePoint();
    }
    for ( var i = 0; i < this.positions.length; i ++ ) {
      this.positions[ i ].copy( new_positions[ i ] );
    }
    this.updateSplineOutline();
  }


  animate(): void {
    // requestAnimationFrame( animate );
    this.render();
    this.stats.update();
  }

  render() {
    // let self = this;
    this.frameId = requestAnimationFrame(() => {
      if (this.renderer)
        this.render();
    });

    // VTuberを回す
    if (this.isRotate) {
      this.objGroup.rotation.x += 0.05;
    }

    if (this.renderer) {
      this.splines['uniform']['mesh']['visible'] = this.params.uniform;
      this.splines['centripetal']['mesh']['visible'] = this.params.centripetal;
      this.splines['chordal']['mesh']['visible'] = this.params.chordal;
      this.renderer.render(this.scene, this.camera);
    }
  }
}
