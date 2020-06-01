import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputNodesService } from '../../input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../input/input-members/input-members.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { ThreeNodesService } from './three-nodes.service';

import { OrbitControls } from '../libs/OrbitControls.js';
import { Line2 } from '../libs/Line2.js';
import { LineMaterial } from '../libs/LineMaterial.js';
import { LineGeometry } from '../libs/LineGeometry.js';
import { GeometryUtils } from '../libs/GeometryUtils.js';

import * as THREE from 'three';
import { ThreeService } from '../three.service';
import { ThreeMembersService } from './three-members.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadService {

  private pointLoadList: any[];
  private memberLoadList: any[];
  private selectionItem: THREE.Mesh;     // 選択中のアイテム

  constructor(private scene: SceneService,
    private nodeThree: ThreeNodesService,
    private node: InputNodesService,
    private member: InputMembersService,
    private load: InputLoadService,
    private three_member: ThreeMembersService) {
    this.pointLoadList = new Array();
    this.memberLoadList = new Array();
    this.selectionItem = null;
  }

  public maxLength(): number {
    // 最も距離の近い2つの節点距離
    return this.nodeThree.baseScale() * 80;
  }

  public chengeData(index: number): void {

    // 一旦全排除
    this.ClearData();

    // 格点データを入手
    const nodeData = this.node.getNodeJson('calc');
    if (Object.keys(nodeData).length <= 0) {
      return;
    }

    // 節点荷重データを入手
    const targetCase: string = index.toString();
    const nodeLoadData = this.load.getNodeLoadJson('unity-loads:' + targetCase);
    if (Object.keys(nodeLoadData).length <= 0) {
      this.ClearNodeLoad();
    } else {
      // サイズを調整しオブジェクトを登録する
      this.createNodeLoad(nodeLoadData[targetCase], nodeData);
    }

    // 要素データを入手
    const memberData = this.member.getMemberJson('calc');
    if (Object.keys(memberData).length <= 0) {
      this.ClearMemberLoad();
      return;
    }

    // 要素荷重データを入手
    const memberLoadData = this.load.getMemberLoadJson('unity-loads:' + targetCase);
    if (Object.keys(memberLoadData).length <= 0) {
      this.ClearMemberLoad();
    } else {
      // サイズを調整しオブジェクトを登録する
      this.createMemberLoad(memberLoadData[targetCase], nodeData, memberData);
    }

  }

  // 節点荷重の矢印を描く
  private createNodeLoad(nodeLoadData: any, nodeData: object): void {

    if (nodeLoadData === undefined) {
      return;
    }

    // 新しい入力を適用する
    const targetNodeLoad = nodeLoadData;
    // スケールを決定する 最大の荷重を 1とする
    let pMax = 0;
    let mMax = 0;
    for (const load of targetNodeLoad) {
      pMax = Math.max(pMax, Math.abs(load.tx));
      pMax = Math.max(pMax, Math.abs(load.ty));
      pMax = Math.max(pMax, Math.abs(load.tz));
      mMax = Math.max(mMax, Math.abs(load.rx));
      mMax = Math.max(mMax, Math.abs(load.ry));
      mMax = Math.max(mMax, Math.abs(load.rz));
    }

    // 集中荷重の矢印をシーンに追加する
    for (const load of targetNodeLoad) {
      // 節点座標 を 取得する
      const node = nodeData[load.n];
      if (node === undefined) {
        continue;
      }
      // x方向の集中荷重
      const xArrow: Line2 = this.setPointLoad(load.tx, pMax, node, 'px');
      if (xArrow !== null) {
        this.pointLoadList.push(xArrow);
        this.scene.add(xArrow);
      }
      // y方向の集中荷重
      const yArrow: Line2 = this.setPointLoad(load.ty, pMax, node, 'py');
      if (yArrow !== null) {
        this.pointLoadList.push(yArrow);
        this.scene.add(yArrow);
      }
      // z方向の集中荷重
      const zArrow: Line2 = this.setPointLoad(load.tz, pMax, node, 'pz');
      if (zArrow !== null) {
        this.pointLoadList.push(zArrow);
        this.scene.add(zArrow);
      }

      // x軸周りのモーメント
      const xMoment = this.setMomentLoad(load.rx, mMax, node, 0xFF0000, 'mx');
      if (xMoment !== null) {
        this.pointLoadList.push(xMoment);
        this.scene.add(xMoment);
      }

      // y軸周りのモーメント
      const yMoment = this.setMomentLoad(load.ry, mMax, node, 0x00FF00, 'my');
      if (yMoment !== null) {
        this.pointLoadList.push(yMoment);
        this.scene.add(yMoment);
      }

      // z軸周りのモーメント
      const zMoment = this.setMomentLoad(load.rz, mMax, node, 0x0000FF, 'mz');
      if (zMoment !== null) {
        this.pointLoadList.push(zMoment);
        this.scene.add(zMoment);
      }
    }
  }

  // 節点モーメント荷重の矢印を作成する
  private setMomentLoad(value: number, mMax: number, node: any, color: number, name: string): THREE.Line {

    if (value === 0) {
      return null;
    }

    const curve = new THREE.EllipseCurve(
      0, 0,              // ax, aY
      4, 4,               // xRadius, yRadius
      0, 1.5 * Math.PI,  // aStartAngle, aEndAngle
      false,              // aClockwise
      0                   // aRotation
    );

    const points = curve.getPoints(50);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ color, linewidth: 5 });
    const ellipse = new THREE.Line(lineGeometry, lineMaterial);

    const arrowGeometry = new THREE.ConeGeometry(0.1, 1, 3, 1, true);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color });
    const cone = new THREE.Mesh(arrowGeometry, arrowMaterial);
    cone.rotateX(Math.PI);
    cone.position.set(4, 0.5, 0);

    ellipse.add(cone);
    ellipse.position.set(node.x, node.y, node.z);

    switch (name) {
      case 'mx':
        ellipse.rotateX(Math.PI / 2);
        ellipse.rotateY(Math.PI / 2);
        break;
      case 'my':
        ellipse.rotateX(Math.PI / 2);
        break;
      case 'mz':
        // 何もしない
        break;
    }

    let scale: number = value / mMax;
    scale /= 8;
    ellipse.scale.set(scale, scale, scale);

    return ellipse;

  }

  // 節点荷重の矢印を作成する
  private setPointLoad(value: number, pMax: number,
    node: any, name: string): Line2 {

    if (value === 0) {
      return null;
    }

    const maxLength: number = this.maxLength() * 0.7;
    const length: number = maxLength * value / pMax;

    let linewidth: number = this.nodeThree.baseScale() / 50;

    let color: number;
    const positions = [];


    positions.push(node.x, node.y, node.z);
    switch (name) {
      case 'px':
        positions.push(node.x - length, node.y, node.z);
        color = 0xFF0000;
        break;
      case 'py':
        positions.push(node.x, node.y - length, node.z);
        color = 0x00FF00;
        break;
      case 'pz':
        positions.push(node.x, node.y, node.z - length);
        color = 0x0000FF;
        break;
    }
    const cone_scale: number = length * 0.1 * 2;
    const cone_radius: number = 0.1 * cone_scale;
    const cone_height: number = 1 * cone_scale;
    const arrowGeometry: THREE.ConeGeometry = new THREE.ConeGeometry(cone_radius, cone_height, 3, 1, true);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color });
    const cone: THREE.Mesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
    switch (name) {
      case 'px':
        cone.position.set(node.x - cone_height / 2, node.y, node.z);
        cone.rotation.z = Math.PI / 2 * 3;
        break;
      case 'py':
        cone.position.set(node.x, node.y - cone_height / 2, node.z);
        break;
      case 'pz':
        cone.position.set(node.x, node.y, node.z - cone_height / 2);
        cone.rotation.x = Math.PI / 2;
        break;
    }

    const threeColor = new THREE.Color(color);
    const colors = [];
    colors.push(threeColor.r, threeColor.g, threeColor.b);
    colors.push(threeColor.r, threeColor.g, threeColor.b);

    const geometry: LineGeometry = new LineGeometry();
    geometry.setPositions(positions);
    geometry.setColors(colors);

    const matLine: LineMaterial = new LineMaterial({
      color,
      linewidth,
      vertexColors: THREE.VertexColors,
      dashed: false
    });
    const line: Line2 = new Line2(geometry, matLine);
    line.computeLineDistances();
    line.add(cone);

    line.scale.set(1, 1, 1);
    line.name = name;

    return line;

  }

  // 要素荷重の矢印を描く
  private createMemberLoad(memberLoadData: any, nodeData: object, memberData: object): void {

    if (memberLoadData === undefined) {
      return;
    }

    // 新しい入力を適用する
    const targetMemberLoad = memberLoadData;
    // スケールを決定する 最大の荷重を 1とする
    let pMax = 0;
    const maxLength: number = this.maxLength() * 0.7;
    for (const load of targetMemberLoad) {
      pMax = Math.max(pMax, Math.abs(load.P1));
      pMax = Math.max(pMax, Math.abs(load.P2));
    }
    

    // 荷重のshapeをシーンに追加する
    let p_one = 0;
    let p_two = 0;
    let L_one = 0;
    let L_two = 0;
    for (const load of targetMemberLoad) {

      p_one = Math.max(p_one, Math.abs(load.P1)) * maxLength / pMax;
      p_two = Math.max(p_two, Math.abs(load.P2)) * maxLength / pMax;
      L_one = Math.max(L_one, Math.abs(load.L1));
      L_two = Math.max(L_two, Math.abs(load.L2));
      
      // 節点データを集計する
      const m = memberData[load.m];
      if (m === undefined) {
        continue;
      }
      const i = nodeData[m.ni];
      const j = nodeData[m.nj];
      if (i === undefined || j === undefined) {
        continue;
      }

      // 部材の座標軸を取得
      const localAxis = this.three_member.localAxis(i.x, i.y, i.z, j.x, j.y, j.z, m.cg);
      const MemberLength: number = Math.sqrt((i.x - j.x) ** 2 + (i.y - j.y) ** 2 + (i.z - j.z) ** 2);

      //var material = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, color: 0x00cc00, transparent: true,}); //alphaMap: 
      var mesh_material = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, color: 0x00cc00, depthTest : false}); //alphaMap: 
      //var mesh_material = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, color: 0x00cc00, opacity: 0.3}); //alphaMap: transparent: true,
      

      var geometry = new THREE.Geometry();

      let _localAxis;
      switch (load.direction){
        case "x":
        _localAxis = localAxis.x;
          break;
        case "y":
        _localAxis = localAxis.y;
          break;
        case "z":
        _localAxis = localAxis.z;
          break;
      }
      
      //荷重の面Meshを作る
      const i_x = i.x + localAxis.x.x * L_one;
      const i_y = i.y + localAxis.x.y * L_one;
      const i_z = i.z + localAxis.x.z * L_one;
      const j_x = j.x - localAxis.x.x * L_two;
      const j_y = j.y - localAxis.x.y * L_two;
      const j_z = j.z - localAxis.x.z * L_two;
      
      const x1 = i.x + localAxis.x.x * L_one + _localAxis.x * p_one;
      const y1 = i.y + localAxis.x.y * L_one + _localAxis.y * p_one;
      const z1 = i.z + localAxis.x.z * L_one + _localAxis.z * p_one;
      const x2 = j.x - localAxis.x.x * L_two + _localAxis.x * p_two;
      const y2 = j.y - localAxis.x.y * L_two + _localAxis.y * p_two;
      const z2 = j.z - localAxis.x.z * L_two + _localAxis.z * p_two;

      geometry.vertices.push(new THREE.Vector3(i_x, i_y, i_z));
      geometry.vertices.push(new THREE.Vector3(x1, y1, z1));
      geometry.vertices.push(new THREE.Vector3(x2, y2, z2));
      geometry.vertices.push(new THREE.Vector3(j_x, j_y, j_z));

      var normal = new THREE.Vector3(0, 0, 1);
      var color = new THREE.Color(0xffaa00);
      var face1 = new THREE.Face3(0, 1, 2, normal, color);
      var face2 = new THREE.Face3(0, 2, 3, normal, color);

      geometry.faces.push(face1);
      geometry.faces.push(face2);

      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      var mesh = new THREE.Mesh(geometry, mesh_material);
       
      if (mesh !== null) {
        this.memberLoadList.push(mesh);
        this.scene.add(mesh);
      }

      //lineを描く
      let linewidth: number = this.nodeThree.baseScale() / 50;
      var line_material = new THREE.LineBasicMaterial({color: 0x66cc99, linewidth});
      var line = new THREE.Line(geometry, line_material);
      if (line !== null) {
        this.memberLoadList.push(line);
        this.scene.add(line);
      }

      //coneを描く
      const cone_scale: number = maxLength * 0.3;
      const cone_radius: number = 0.03 * cone_scale;
      const cone_height: number = 0.3 * cone_scale;
      const cone_color = new THREE.Color(0xffffff);

      var cone_mesh_material = new THREE.MeshStandardMaterial({side: THREE.DoubleSide, 
                                                               color: cone_color,
                                                               depthTest : false});
      
      const cone1 = this.createCorn(i_x, i_y, i_z, localAxis, cone_radius, cone_height, cone_mesh_material);
      const cone2 = this.createCorn(j_x, j_y, j_z, localAxis, cone_radius, cone_height, cone_mesh_material);
      
      if (cone1 !== null) {
        this.memberLoadList.push(cone1);
        this.scene.add(cone1);
      }
      if (cone2 !== null) {
        this.memberLoadList.push(cone2);
        this.scene.add(cone2);
      }
      
    }

  }

  //コーンを作る
  private createCorn(xij, yij, zij, localAxis, cone_radius, cone_height,  mesh_material){

    var cone_geometry = new THREE.Geometry();

    //cone_CoGは底面の三角形の重心位置
    const cone_CoG = {x: xij + localAxis.z.x * cone_height, 
                      y: yij + localAxis.z.y * cone_height, 
                      z: zij + localAxis.z.z * cone_height};
    
    const x_1 = cone_CoG.x + cone_radius * 2 * localAxis.x.x ;
    const y_1 = cone_CoG.y + cone_radius * 2 * localAxis.x.y ;
    const z_1 = cone_CoG.z + cone_radius * 2 * localAxis.x.z ;
    const x_2 = cone_CoG.x - cone_radius * 1 * localAxis.x.x  + cone_radius * Math.sqrt(3) * localAxis.y.x ;
    const y_2 = cone_CoG.y - cone_radius * 1 * localAxis.x.y  + cone_radius * Math.sqrt(3) * localAxis.y.y ;
    const z_2 = cone_CoG.z - cone_radius * 1 * localAxis.x.z  + cone_radius * Math.sqrt(3) * localAxis.y.z ;
    const x_3 = cone_CoG.x - cone_radius * 1 * localAxis.x.x  - cone_radius * Math.sqrt(3) * localAxis.y.x ;
    const y_3 = cone_CoG.y - cone_radius * 1 * localAxis.x.y  - cone_radius * Math.sqrt(3) * localAxis.y.y ;
    const z_3 = cone_CoG.z - cone_radius * 1 * localAxis.x.z  - cone_radius * Math.sqrt(3) * localAxis.y.z ;

    cone_geometry.vertices.push(new THREE.Vector3(xij, yij, zij));
    cone_geometry.vertices.push(new THREE.Vector3(x_1, y_1, z_1));
    cone_geometry.vertices.push(new THREE.Vector3(x_2, y_2, z_2));
    cone_geometry.vertices.push(new THREE.Vector3(x_3, y_3, z_3));

    var normal = new THREE.Vector3(0, 0, 1);

    var face3 = new THREE.Face3(0, 1, 2, normal, mesh_material);
    var face4 = new THREE.Face3(0, 2, 3, normal, mesh_material);
    var face5 = new THREE.Face3(0, 1, 3, normal, mesh_material);

    cone_geometry.faces.push(face3);
    cone_geometry.faces.push(face4);
    cone_geometry.faces.push(face5);

    cone_geometry.computeFaceNormals();
    cone_geometry.computeVertexNormals();

    var cone_mesh = new THREE.Mesh(cone_geometry, mesh_material);

    return cone_mesh;
  }
  // データをクリアする
  public ClearData(): void {
    this.ClearMemberLoad();
    this.ClearNodeLoad();
  }

  // データをクリアする
  private ClearNodeLoad(): void {
    for (const mesh of this.pointLoadList) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
      // オブジェクトを削除する
      this.scene.remove(mesh);
    }
    this.pointLoadList = new Array();
  }

  // データをクリアする
  private ClearMemberLoad(): void {
    for (const mesh of this.memberLoadList) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
      // オブジェクトを削除する
      this.scene.remove(mesh);
    }
    this.memberLoadList = new Array();
  }

}
