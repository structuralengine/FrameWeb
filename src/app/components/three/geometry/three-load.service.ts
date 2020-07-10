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
import { Mesh } from 'three';

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

    const maxLength: number = this.maxLength() * 0.5;
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
    const maxLength: number = this.maxLength() * 0.5;
    for (const load of targetMemberLoad) {
      pMax = Math.max(pMax, Math.abs(load.P1));
      pMax = Math.max(pMax, Math.abs(load.P2));
    }
    

    // 荷重のshapeをシーンに追加する
    let p_one = 0;
    let p_two = 0;
    //let L_one = 0; 使わない
    //let L_two = 0; 使わない
    for (const load of targetMemberLoad) {

      p_one = Math.max(p_one, Math.abs(load.P1)) * maxLength / pMax;
      p_two = Math.max(p_two, Math.abs(load.P2)) * maxLength / pMax;
      //L_one = Math.max(L_one, Math.abs(load.L1)); 使わない
      //L_two = Math.max(L_two, Math.abs(load.L2)); 使わない
      
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

      //各情報を作成
      const i_x = i.x + localAxis.x.x * load.L1;
      const i_y = i.y + localAxis.x.y * load.L1;
      const i_z = i.z + localAxis.x.z * load.L1;
      let j_x = 0; let j_y = 0; ; let j_z = 0;
      if (load.mark === 1 || load.mark === 11){
        j_x = i.x + localAxis.x.x * load.L2;
        j_y = i.y + localAxis.x.y * load.L2;
        j_z = i.z + localAxis.x.z * load.L2;
      }else if(load.mark === 2){
        j_x = j.x - localAxis.x.x * load.L2;
        j_y = j.y - localAxis.x.y * load.L2;
        j_z = j.z - localAxis.x.z * load.L2;
      }else{
        break;
      }

      const L_position = {x1: i_x, y1: i_y, z1: i_z, x2: j_x, y2: j_y, z2: j_z};
      const Data = {L1: load.L1, L2: load.L2, p_one: p_one, p_two: p_two, 
                    P1: Math.sign(load.P1), P2: Math.sign(load.P2), try: " "};
      var groupe = new THREE.Group();  // 親の実態のない架空のジオメトリ

//#region コメントアウト
      /*const mesh_material = new THREE.MeshBasicMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        color: 0x00cc00,
        opacity: 0.3
      });
      

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
        case "r":
        _localAxis = localAxis.x;
          break;
      }
      
      
      //const x1 = i.x + localAxis.x.x * L_one + _localAxis.x * p_one;
      //const y1 = i.y + localAxis.x.y * L_one + _localAxis.y * p_one;
      //const z1 = i.z + localAxis.x.z * L_one + _localAxis.z * p_one;
      //const x2 = j.x - localAxis.x.x * L_two + _localAxis.x * p_two;
      //const y2 = j.y - localAxis.x.y * L_two + _localAxis.y * p_two;
      //const z2 = j.z - localAxis.x.z * L_two + _localAxis.z * p_two;

      //const P_position = {x1: x1 , y1: y1 , z1: z1 , x2: x2 , y2: y2 , z2: z2 };


      geometry.vertices.push(new THREE.Vector3(i_x, i_y, i_z));
      geometry.vertices.push(new THREE.Vector3(x1, y1, z1));
      geometry.vertices.push(new THREE.Vector3(x2, y2, z2));
      geometry.vertices.push(new THREE.Vector3(j_x, j_y, j_z));

      var normal = new THREE.Vector3(0, 0, 1);
      var color = new THREE.Color(0xff0000);
      var face1 = new THREE.Face3(0, 1, 2);//, normal, color);
      var face2 = new THREE.Face3(0, 2, 3);//, normal, color);

      geometry.faces.push(face1);
      geometry.faces.push(face2);

      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      var groupe = new THREE.Group();  // 親の実態のない架空のジオメトリ
      var mesh = new THREE.Mesh(geometry, mesh_material);

      //meshを出力
      if (mesh !== null) {
        this.memberLoadList.push(groupe);
        this.scene.add(groupe);
      }else{
        continue;
      }       

      groupe.add(mesh);*/

      //荷重の矢印を作る
      /*if (load.mark === 2 && (load.direction === "y" || load.direction === "z")){
        const arrow = {size: 0.3 * maxLength, direction: "z", color: 0x000000};
        if (load.direction === "y"){
          arrow.direction = "y";
        }else if(load.direction === "z"){
          arrow.direction = "z";
        }
        const arrowlist = this.CreateArrow(arrow, L_position, P_position, localAxis);
        if (arrowlist !== null ){  //ここの分岐は必要？
          for(const a of arrowlist){
            groupe.add(a);
          }
        }
      }*/
      //#endregion
      
      const arrow = {size: 0.3 * maxLength, direction: "z", color: 0x000000};
      let arrowlist: any = [];
      let arrowlist_sub: any = [];

//#region    mark === 1
      //markが1のときのx, y, z, rの分岐
      if (load.mark === 1) {
        if (load.direction === "x"){
          arrow.direction = "x";
          arrow.color = 0xff0000;
          if (load.P1 !== 0){
            Data.try = "1";
            arrowlist = this.CreateArrow(arrow, L_position, localAxis, Data);
          }
          if (load.P2 !== 0){
            Data.try = "2";
            arrowlist_sub = this.CreateArrow(arrow, L_position, localAxis, Data);
          }
        }else if (load.direction === "y"){
          arrow.direction = "y";
          arrow.color = 0x00ff00;
          if (load.P1 !== 0){
            Data.try = "1";
            arrowlist = this.CreateArrow(arrow, L_position, localAxis, Data);
          }
          if (load.P2 !== 0){
            Data.try = "2";
            arrowlist_sub = this.CreateArrow(arrow, L_position, localAxis, Data);
          }
        }else if (load.direction === "z"){
          arrow.direction = "z";
          arrow.color = 0x0000ff;
          if (load.P1 !== 0){
            Data.try = "1";
            arrowlist = this.CreateArrow(arrow, L_position, localAxis, Data);
          }
          if (load.P2 !== 0){
            Data.try = "2";
            arrowlist_sub = this.CreateArrow(arrow, L_position, localAxis, Data);
          }
        }else{
          continue;
        }

        if (arrowlist !== null ){  //ここの分岐は必要？
          for(const a of arrowlist){
          groupe.add(a);
          }
        }
        if (arrowlist_sub !== null ){  //ここの分岐は必要？
          for(const a of arrowlist_sub){
          groupe.add(a);
          }
        }
      }
//#endregion

//#region    mark === 11
      //markが11のときのx, y, z, rの分岐
      if (load.mark === 11) {
        arrow.size = arrow.size / 2.5;
        if (load.direction === "x"){
          arrow.direction = "x";
          arrow.color = 0xff0000;
          if (load.P1 !== 0){
            Data.try = "1";
            arrowlist = this.CreateArrow_M(arrow, L_position, localAxis, Data);
          }
          if (load.P2 !== 0){
            Data.try = "2";
            arrowlist_sub = this.CreateArrow_M(arrow, L_position, localAxis, Data);
          }
        }else if (load.direction === "y"){
          arrow.direction = "y";
          arrow.color = 0x00ff00;
          if (load.P1 !== 0){
            Data.try = "1";
            arrowlist = this.CreateArrow_M(arrow, L_position, localAxis, Data);
          }
          if (load.P2 !== 0){
            Data.try = "2";
            arrowlist_sub = this.CreateArrow_M(arrow, L_position, localAxis, Data);
          }
        }else if (load.direction === "z"){
          arrow.direction = "z";
          arrow.color = 0x0000ff;
          if (load.P1 !== 0){
            Data.try = "1";
            arrowlist = this.CreateArrow_M(arrow, L_position, localAxis, Data);
          }
          if (load.P2 !== 0){
            Data.try = "2";
            arrowlist_sub = this.CreateArrow_M(arrow, L_position, localAxis, Data);
          }
        }
        if (arrowlist !== null ){  //ここの分岐は必要？
          for(const a of arrowlist){
          groupe.add(a);
          }
        }
        if (arrowlist_sub !== null ){  //ここの分岐は必要？
          for(const a of arrowlist_sub){
          groupe.add(a);
          }
        }
      }
//#endregion

//#region    mark === 2
      //markが2のときのx, y, z, rの分岐
      if (load.mark === 2) {
        if (load.direction === "x"){
          arrow.direction = "x";
          arrow.color = 0xff0000;
          //arrowlist = this.CreateArrows_X(arrow, L_position, localAxis);
          arrowlist = this.CreateArrow_X(arrow, L_position, localAxis);
        }else if (load.direction === "y"){
          arrow.direction = "y";
          arrowlist = this.CreateArrow_Y(arrow, L_position, localAxis, Data);
        }else if (load.direction === "z"){
          arrow.direction = "z";
          arrowlist = this.CreateArrow_Z(arrow, L_position, localAxis, Data);
        }else if (load.direction === "r"){
          arrow.size = arrow.size / 2.5;
          arrow.direction = "r";
          arrow.color = 0xff00ff;
          arrowlist = this.CreateArrow_R(arrow, L_position, localAxis);
        }else{
          continue;
        }

        if (arrowlist !== null ){  //ここの分岐は必要？
          for(const a of arrowlist){
          groupe.add(a);
          }
        }
      }
//#endregion
      
//#region 
      /*下に移動のためコメントアウト
      if (mesh !== null) {
        this.memberLoadList.push(mesh);
        this.scene.add(mesh);
      }*/
      /*
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
      */
//#endregion
      //meshを出力
      if (groupe !== null) {
        this.memberLoadList.push(groupe);
        this.scene.add(groupe);
      }else{
        continue;
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

  //矢印（集中荷重）を描く
  public CreateArrow (arrow, L_position, localAxis, Data){
    const arrowlist = [];
    const group = new THREE.Group();

    let geometry = new THREE.Geometry();

    //矢の棒を描く
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    if (Data.try === "1"){
      geometry.vertices.push(new THREE.Vector3(0, 0, (-1) * Data.p_one));
    }else if(Data.try === "2"){
      geometry.vertices.push(new THREE.Vector3(0, 0, (-1) * Data.p_two));
    }
    let line = new THREE.LineBasicMaterial({color: arrow.color});
    let mesh = new THREE.Line(geometry, line);
    group.add(mesh);

    geometry = new THREE.Geometry();

    //矢の先を描く
    const cone_scale: number = arrow.size;
    const cone_radius: number = 0.1 * cone_scale;
    const cone_height: number = 1 * cone_scale;
    geometry = new THREE.ConeGeometry( cone_radius, cone_height, 3, 1, true );
    const material = new THREE.MeshBasicMaterial( {color: arrow.color} );
    const cone = new THREE.Mesh( geometry, material );
    cone.position.set(-cone_scale / 2, 0, 0);
    cone.position.set(0, 0, -cone_scale / 2);
    cone.lookAt(10, 0, 0);
    group.add(cone);

    //groupの操作
    switch (arrow.direction){
      case ("x"):
        group.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
        if (Data.try === "1"){
          group.position.set(L_position.x1 - localAxis.y.x * 0.1, 
                             L_position.y1 - localAxis.y.y * 0.1, 
                             L_position.z1                      );
        }else if(Data.try === "2"){
          group.position.set(L_position.x2 - localAxis.y.x * 0.1, 
                             L_position.y2 - localAxis.y.y * 0.1, 
                             L_position.z2                      );
        }
        break;
      case ("y"):
        group.lookAt(localAxis.y.x, localAxis.y.y, localAxis.y.z);
        if (Data.try === "1"){
          group.position.set(L_position.x1, L_position.y1, L_position.z1);
        }else if(Data.try === "2"){
          group.position.set(L_position.x2, L_position.y2, L_position.z2);
        }
        break;
      case ("z"):
        group.lookAt(-localAxis.z.x, -localAxis.z.y, -localAxis.z.z);
        if (Data.try === "1"){
          group.position.set(L_position.x1, L_position.y1, L_position.z1);
        }else if(Data.try === "2"){
          group.position.set(L_position.x2, L_position.y2, L_position.z2);
        }
        break;
    }
    arrowlist.push(group)
    return arrowlist
    
  }

  //矢印（集中曲げモーメント）を描く
  public CreateArrow_M (arrow, L_position, localAxis, Data){
    const arrowlist = [];
    const groupM = new THREE.Group();

    //モーメントの線を描く
    const curve = new THREE.EllipseCurve(
      0,              0,                 // ax,          aY
      arrow.size,     arrow.size,        // xRadius,     yRadius
      -1/3 * Math.PI, 4/3 * Math.PI,     // aStartAngle, aEndAngle
      false,          0                  // aClockwise, aRotation          
    );
    const points = curve.getPoints( 50 );
    const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
    const lineMaterial = new THREE.LineBasicMaterial( { color: arrow.color, linewidth: 5 } );
    const line = new THREE.Line( lineGeometry, lineMaterial );
    groupM.add(line);

    //矢印の先を描く
    const cone_scale: number = arrow.size;
    const cone_radius: number = 0.1 * cone_scale;
    const cone_height: number = 1 * cone_scale;
    const arrowGeometry = new THREE.ConeGeometry( cone_radius, cone_height, 3, 1, true );
    const arrowMaterial = new THREE.MeshBasicMaterial( {color: arrow.color} );
    const cone = new THREE.Mesh( arrowGeometry, arrowMaterial );
    cone.rotation.z = 2 / 3 * Math.PI;
    cone.position.set(1 / 2 * arrow.size, -(3**(1/2) / 2) * arrow.size, 0);
    groupM.add(cone);

    //groupの操作
    switch(arrow.direction){
      case("x"):
        groupM.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
        break;
      case("y"):
        groupM.lookAt(localAxis.y.x, localAxis.y.y, localAxis.y.z);
        break;
      case("z"):
        groupM.lookAt(localAxis.z.x, localAxis.z.y, localAxis.z.z);
        break;
    }
    if (Data.try === "1"){
      groupM.position.set(L_position.x1, L_position.y1, L_position.z1);
    }else if(Data.try === "2"){
      groupM.position.set(L_position.x2, L_position.y2, L_position.z2);
    }
    arrowlist.push(groupM)
    return arrowlist
  }

  //矢印（分布荷重X）を描く
  public CreateArrow_X (arrow, L_position, localAxis){
    const groupX = new THREE.Group();

    let geometry = new THREE.Geometry();
    const arrowlist = [];
    const offset = 0.1;
    L_position.x1 -= offset * localAxis.y.x;
    L_position.y1 -= offset * localAxis.y.y;
    L_position.x2 -= offset * localAxis.y.x;
    L_position.y2 -= offset * localAxis.y.y;

    //矢の先を描く
    geometry.vertices.push(new THREE.Vector3(arrow.size *  0.3, 0, arrow.size * 0.6));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(arrow.size * -0.3, 0, arrow.size * 0.6));
    let line = new THREE.LineBasicMaterial({color: arrow.color});
    let mesh = new THREE.Line(geometry, line);
    mesh.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
    mesh.position.set(L_position.x1, L_position.y1, L_position.z1);
    groupX.add(mesh);

    //geometryの初期化
    geometry = new THREE.Geometry();

    //矢印の棒
    geometry.vertices.push(new THREE.Vector3(L_position.x1, L_position.y1, L_position.z1));
    geometry.vertices.push(new THREE.Vector3(L_position.x2, L_position.y2, L_position.z2));
    line = new THREE.LineDashedMaterial({color: arrow.color, dashSize: 0.1, gapSize: 0.1});
    mesh = new THREE.Line(geometry, line);
    mesh.computeLineDistances();
    groupX.add(mesh);
    geometry = new THREE.Geometry();

    arrowlist.push(groupX);
    return arrowlist
    //return groupX
    
  }

  //矢印（分布荷重Y）を描く
  public CreateArrow_Y (arrow, L_position, localAxis, Data){
    const arrowlist = [];
    const groupY = new THREE.Group();

    let geometry = new THREE.Geometry(); //geometryの初期化
    const interval = 0.7;
    const len_Lx = L_position.x2 - L_position.x1;
    const len_Ly = L_position.y2 - L_position.y1;
    const len_Lz = L_position.z2 - L_position.z1;
    const len_L: number = new THREE.Vector3(len_Lx, len_Ly, len_Lz).length();
    const count_L = Math.floor(len_L / interval);
    const difference_P = Data.p_two - Data.p_one;
    for (let i = 0; i <= count_L; i ++){

      //矢の先を描く
      let x = arrow.size * 0.4;
      let y = arrow.size * 0.0;
      let z = arrow.size * 0.2;
      geometry.vertices.push(new THREE.Vector3(x, y, z));
      geometry.vertices.push(new THREE.Vector3(0, 0, 0));
      z = arrow.size * -0.2;
      geometry.vertices.push(new THREE.Vector3(x, y, z));

      const line = new THREE.LineBasicMaterial({color: arrow.color});
      let mesh = new THREE.Line(geometry, line);
      x = 0;
      y = 0;
      z = len_L * i / count_L;
      mesh.position.set(0, 0, len_L * i / count_L);
      groupY.add(mesh);

      geometry = new THREE.Geometry(); //geometryの初期化
      
      //矢印の棒
      geometry.vertices.push(new THREE.Vector3(x, y, z));
      x = Data.p_one + difference_P * i / count_L;
      geometry.vertices.push(new THREE.Vector3(x, y, z));
      mesh = new THREE.Line(geometry, line);
      groupY.add(mesh);

      geometry = new THREE.Geometry(); //geometryの初期化
    }
    //分布荷重をまとめる棒
    geometry.vertices.push(new THREE.Vector3(Data.p_one, 0, 0));
    geometry.vertices.push(new THREE.Vector3(Data.p_two, 0, len_L));
    const line = new THREE.LineBasicMaterial({color: arrow.color});
    let mesh = new THREE.Line(geometry, line);
    groupY.add(mesh);

    geometry = new THREE.Geometry(); //geometryの初期化

    //荷重の面Meshを作る
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x00cc00,
      opacity: 0.3
    }); 
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(Data.p_one, 0, 0));
    geometry.vertices.push(new THREE.Vector3(Data.p_two, 0, len_L));
    geometry.vertices.push(new THREE.Vector3(0, 0, len_L));
    var face1 = new THREE.Face3(0, 1, 2);
    var face2 = new THREE.Face3(0, 2, 3);
    geometry.faces.push(face1);
    geometry.faces.push(face2);
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    let mesh2 = new THREE.Mesh(geometry, material);
    groupY.add(mesh2);

    //groupの操作
    groupY.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
    groupY.position.set(L_position.x1, L_position.y1, L_position.z1);
    arrowlist.push(groupY);
    return arrowlist
  }

  //矢印（分布荷重Z）を描く
  public CreateArrow_Z (arrow, L_position, localAxis, Data){
    const arrowlist = [];
    const groupZ = new THREE.Group();

    let geometry = new THREE.Geometry();
    const interval = 0.7;
    const len_Lx = L_position.x2 - L_position.x1;
    const len_Ly = L_position.y2 - L_position.y1;
    const len_Lz = L_position.z2 - L_position.z1;
    const len_L: number = new THREE.Vector3(len_Lx, len_Ly, len_Lz).length();
    const count_L = Math.floor(len_L / interval);
    const difference_P = Data.p_two - Data.p_one;
    for (let i = 0; i <= count_L; i ++){

      //矢の先を描く
      let x = arrow.size * 0.0;
      let y = arrow.size * 0.2;
      let z = arrow.size * 0.4;
      geometry.vertices.push(new THREE.Vector3(x, y, z));
      x = 0;
      y = 0;
      z = 0;
      geometry.vertices.push(new THREE.Vector3(x, y, z));
      x = arrow.size * 0.0;
      y = arrow.size * -0.2;
      z = arrow.size * 0.4;
      geometry.vertices.push(new THREE.Vector3(x, y, z));

      const line = new THREE.LineBasicMaterial({color: arrow.color});
      let mesh = new THREE.Line(geometry, line);
      x = 0;
      y = len_L * i / count_L;
      z = 0;
      mesh.position.set(x, y, z);
      groupZ.add(mesh);
      
      geometry = new THREE.Geometry(); //geometryの初期化
      
      //矢印の棒
      geometry.vertices.push(new THREE.Vector3(x, y, z));
      z = Data.p_one + difference_P * i / count_L;
      geometry.vertices.push(new THREE.Vector3(x, y, z));
      mesh = new THREE.Line(geometry, line);
      groupZ.add(mesh);

      geometry = new THREE.Geometry(); //geometryの初期化
    }
    //分布荷重をまとめる棒
    geometry.vertices.push(new THREE.Vector3(0, 0,  Data.p_one));
    geometry.vertices.push(new THREE.Vector3(0, len_L, Data.p_two));
    const line = new THREE.LineBasicMaterial({color: arrow.color});
    let mesh1 = new THREE.Line(geometry, line);
    groupZ.add(mesh1);

    geometry = new THREE.Geometry(); //geometryの初期化

    //荷重の面Meshを作る
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x00cc00,
      opacity: 0.3
    }); 
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, Data.p_one));
    geometry.vertices.push(new THREE.Vector3(0, len_L, Data.p_two));
    geometry.vertices.push(new THREE.Vector3(0, len_L, 0));
    var face1 = new THREE.Face3(0, 1, 2);
    var face2 = new THREE.Face3(0, 2, 3);
    geometry.faces.push(face1);
    geometry.faces.push(face2);
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    let mesh2 = new THREE.Mesh(geometry, material);
    groupZ.add(mesh2);

    //groupの操作
    groupZ.lookAt(localAxis.z.x, localAxis.z.y, localAxis.z.z);
    groupZ.position.set(L_position.x1, L_position.y1, L_position.z1);
    arrowlist.push(groupZ);
    return arrowlist
  }

  //部材ねじりモーメント(分布モーメント)荷重
  public CreateArrow_R (arrow, L_position, localAxis){
    const arrowlist = [];
    const groupR = new THREE.Group();

    const interval = 0.7;
    const len_Lx = L_position.x2 - L_position.x1;
    const len_Ly = L_position.y2 - L_position.y1;
    const len_Lz = L_position.z2 - L_position.z1;
    const len_L: number = new THREE.Vector3(len_Lx, len_Ly, len_Lz).length();
    const count_L = Math.floor(len_L / interval);
    let x = (L_position.x2 + L_position.x1) / 2;
    let y = (L_position.y2 + L_position.y1) / 2;
    let z = (L_position.z2 + L_position.z1) / 2;
    
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: arrow.color,
      opacity: 0.3
    }); 
    const geometry = new THREE.CylinderGeometry(
      arrow.size, arrow.size, //radiusTop, radiusBottom
      len_L,      12,              //height, radialSegments
      1,          true,                // heightSegments, openEnded
      4.75,       3/2 * Math.PI        //thetaStart, thetaLength
    );
    
    const mesh = new THREE.Mesh(geometry, material);
    groupR.add(mesh);

    for (let i = 0; i <= count_L ; i++){
      x = 0;
      y = len_L * i / count_L - len_L / 2;
      z = 0;
      const curve = new THREE.EllipseCurve(
        0,           0,                 // ax,          aY
        arrow.size,  arrow.size,        // xRadius,     yRadius
        0 * Math.PI, 3/2 * Math.PI,     // aStartAngle, aEndAngle
        false,       0                  // aClockwise, aRotation          
      );
      const points = curve.getPoints( 50 );
      const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
      const lineMaterial = new THREE.LineBasicMaterial( { color: arrow.color, linewidth: 5 } );
      const line = new THREE.Line( lineGeometry, lineMaterial );
      line.lookAt(x, y + 100, z);
      line.position.set(x, y, z);

      groupR.add(line);

      const cone_scale: number = arrow.size;
      const cone_radius: number = 0.1 * cone_scale;
      const cone_height: number = 1 * cone_scale;
      const arrowGeometry = new THREE.ConeGeometry( cone_radius, cone_height, 3, 1, true );
      const arrowMaterial = new THREE.MeshBasicMaterial( {color: arrow.color} );
      const cone = new THREE.Mesh( arrowGeometry, arrowMaterial );

      x -= arrow.size / 2;
      //y -= arrow.size;
      z -= arrow.size;
      
      cone.position.set(x, y, z);
      cone.lookAt(x, y, z + 1);

      groupR.add(cone);
    }
    x = (L_position.x2 + L_position.x1) / 2;
    y = (L_position.y2 + L_position.y1) / 2;
    z = (L_position.z2 + L_position.z1) / 2;
    groupR.lookAt(localAxis.z.x, localAxis.z.y, localAxis.z.z);
    groupR.position.set(x, y, z);

    arrowlist.push(groupR);
    return arrowlist
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

