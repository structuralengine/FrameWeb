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
import { zip } from 'rxjs';

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
    const nodeData = this.node.getNodeJson(0);
    if (Object.keys(nodeData).length <= 0) {
      return;
    }

    // 節点荷重データを入手
    const targetCase: string = index.toString();
    const nodeLoadData = this.load.getNodeLoadJson(0, targetCase);
    if (Object.keys(nodeLoadData).length <= 0) {
      this.ClearNodeLoad();
    } else {
      // サイズを調整しオブジェクトを登録する
      this.createNodeLoad(nodeLoadData[targetCase], nodeData);
    }

    // 要素データを入手
    const memberData = this.member.getMemberJson(0);
    if (Object.keys(memberData).length <= 0) {
      this.ClearMemberLoad();
      return;
    }

    // 要素荷重データを入手
    const memberLoadData = this.load.getMemberLoadJson(0, targetCase);
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
    for (const load of targetMemberLoad) {

      p_one = Math.max(p_one, Math.abs(load.P1)) * maxLength / pMax;
      p_two = Math.max(p_two, Math.abs(load.P2)) * maxLength / pMax;
      
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
        continue;
      }

      const L_position = {x1: i_x, y1: i_y, z1: i_z, x2: j_x, y2: j_y, z2: j_z};
      const Data = {L1: load.L1, L2: load.L2, p_one: p_one, p_two: p_two, 
                    P1: load.P1, P2: load.P2, judge: " "};
      var groupe = new THREE.Group();  // 親の実態のない架空のジオメトリ
      
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
            Data.judge = "1";
            arrowlist = this.CreateArrow(arrow, L_position, localAxis, Data);
          }
          if (load.P2 !== 0){
            Data.judge = "2";
            arrowlist_sub = this.CreateArrow(arrow, L_position, localAxis, Data);
          }
        }else if (load.direction === "y"){
          arrow.direction = "y";
          arrow.color = 0x00ff00;
          if (load.P1 !== 0){
            Data.judge = "1";
            arrowlist = this.CreateArrow(arrow, L_position, localAxis, Data);
          }
          if (load.P2 !== 0){
            Data.judge = "2";
            arrowlist_sub = this.CreateArrow(arrow, L_position, localAxis, Data);
          }
        }else if (load.direction === "z"){
          arrow.direction = "z";
          arrow.color = 0x0000ff;
          if (load.P1 !== 0){
            Data.judge = "1";
            arrowlist = this.CreateArrow(arrow, L_position, localAxis, Data);
          }
          if (load.P2 !== 0){
            Data.judge = "2";
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
            Data.judge = "1";
            arrowlist = this.CreateArrow_M(arrow, L_position, localAxis, Data);
          }
          if (load.P2 !== 0){
            Data.judge = "2";
            arrowlist_sub = this.CreateArrow_M(arrow, L_position, localAxis, Data);
          }
        }else if (load.direction === "y"){
          arrow.direction = "y";
          arrow.color = 0x00ff00;
          if (load.P1 !== 0){
            Data.judge = "1";
            arrowlist = this.CreateArrow_M(arrow, L_position, localAxis, Data);
          }
          if (load.P2 !== 0){
            Data.judge = "2";
            arrowlist_sub = this.CreateArrow_M(arrow, L_position, localAxis, Data);
          }
        }else if (load.direction === "z"){
          arrow.direction = "z";
          arrow.color = 0x0000ff;
          if (load.P1 !== 0){
            Data.judge = "1";
            arrowlist = this.CreateArrow_M(arrow, L_position, localAxis, Data);
          }
          if (load.P2 !== 0){
            Data.judge = "2";
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
          arrowlist = this.CreateArrow_R(arrow, L_position, localAxis, Data);
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
      
      //meshを出力
      if (groupe !== null) {
        this.memberLoadList.push(groupe);
        this.scene.add(groupe);
      }else{
        continue;
      }       

    }

  }


  //矢印（集中荷重）を描く
  public CreateArrow (arrow, L_position, localAxis, Data){
    const arrowlist = [];
    const group = new THREE.Group();

    let geometry = new THREE.Geometry();

    //矢の棒を描く
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    if (Data.judge === "1"){
      if (Data.P1 > 0){
        geometry.vertices.push(new THREE.Vector3(0, 0, (-1) * Data.p_one));
      }else if (Data.P1 < 0){
        geometry.vertices.push(new THREE.Vector3(0, 0, Data.p_one));
      }
    }else if(Data.judge === "2"){
      if (Data.P2 > 0){
        geometry.vertices.push(new THREE.Vector3(0, 0, (-1) * Data.p_two));
      }else if (Data.P2 < 0){
        geometry.vertices.push(new THREE.Vector3(0, 0, Data.p_two));
      }
    }
    let line = new THREE.LineBasicMaterial({color: arrow.color});
    let mesh = new THREE.Line(geometry, line);
    group.add(mesh);

    //geometryの初期化
    geometry = new THREE.Geometry();

    //矢の先を描く
    const cone_scale: number = arrow.size;
    const cone_radius: number = 0.1 * cone_scale;
    const cone_height: number = 1 * cone_scale;
    geometry = new THREE.ConeGeometry( cone_radius, cone_height, 3, 1, true );
    const material = new THREE.MeshBasicMaterial( {color: arrow.color} );
    const cone = new THREE.Mesh( geometry, material );
    if (Data.judge === "1"){
      if (Data.P1 > 0){
        cone.position.set(0, 0, -cone_scale / 2);
        cone.rotation.x = Math.PI / 2;
      }else if (Data.P1 < 0){
        cone.position.set(0, 0, cone_scale / 2);
        cone.rotation.x = -Math.PI / 2;
      }
    }else if(Data.judge === "2"){
      if (Data.P2 > 0){
        cone.position.set(0, 0, -cone_scale / 2);
        cone.rotation.x = Math.PI / 2;
      }else if (Data.P2 < 0){
        cone.position.set(0, 0, cone_scale / 2);
        cone.rotation.x = -Math.PI / 2;
      }
    }
    group.add(cone);

    //groupの操作
    switch (arrow.direction){
      case ("x"):
        group.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
        if (Data.judge === "1"){
          group.position.set(L_position.x1 - localAxis.y.x * 0.1, 
                             L_position.y1 - localAxis.y.y * 0.1, 
                             L_position.z1                      );
        }else if(Data.judge === "2"){
          group.position.set(L_position.x2 - localAxis.y.x * 0.1, 
                             L_position.y2 - localAxis.y.y * 0.1, 
                             L_position.z2                      );
        }
        break;
      case ("y"):
        group.lookAt(localAxis.y.x, localAxis.y.y, localAxis.y.z);
        if (Data.judge === "1"){
          group.position.set(L_position.x1, L_position.y1, L_position.z1);
        }else if(Data.judge === "2"){
          group.position.set(L_position.x2, L_position.y2, L_position.z2);
        }
        break;
      case ("z"):
        group.lookAt(localAxis.z.x, localAxis.z.y, localAxis.z.z);
        if (Data.judge === "1"){
          group.position.set(L_position.x1, L_position.y1, L_position.z1);
        }else if(Data.judge === "2"){
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
    
    if (Data.judge === "1"){
      if (Data.P1 < 0){
        cone.rotation.z = 2 / 3 * Math.PI;
        cone.position.set(1 / 2 * arrow.size, -(3**(1/2) / 2) * arrow.size, 0);
      }else if(Data.P1 > 0){
        cone.rotation.z = -2 / 3 * Math.PI;
        cone.position.set(-1 / 2 * arrow.size, -(3**(1/2) / 2) * arrow.size, 0);
      }
    }else if(Data.judge === "2"){
      if (Data.P2 < 0){
        cone.rotation.z = 2 / 3 * Math.PI;
        cone.position.set(1 / 2 * arrow.size, -(3**(1/2) / 2) * arrow.size, 0);
      }else if(Data.P2 > 0){
        cone.rotation.z = -2 / 3 * Math.PI;
        cone.position.set(-1 / 2 * arrow.size, -(3**(1/2) / 2) * arrow.size, 0);
      }
    }
    
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
    if (Data.judge === "1"){
      groupM.position.set(L_position.x1, L_position.y1, L_position.z1);
    }else if(Data.judge === "2"){
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
    const len_L: number = new THREE.Vector3(L_position.x2 - L_position.x1, 
                                            L_position.y2 - L_position.y1, 
                                            L_position.z2 - L_position.z1).length();
    //矢の先を描く
    geometry.vertices.push(new THREE.Vector3(arrow.size *  0.3, 0, len_L - arrow.size * 0.6));
    geometry.vertices.push(new THREE.Vector3(0, 0, len_L));
    geometry.vertices.push(new THREE.Vector3(arrow.size * -0.3, 0, len_L - arrow.size * 0.6));
    let line = new THREE.LineBasicMaterial({color: arrow.color});
    let mesh = new THREE.Line(geometry, line);
    groupX.add(mesh);

    //geometryの初期化
    geometry = new THREE.Geometry();

    //矢印の棒
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, len_L));
    line = new THREE.LineDashedMaterial({color: arrow.color, dashSize: 0.1, gapSize: 0.1});
    mesh = new THREE.Line(geometry, line);
    mesh.computeLineDistances();
    groupX.add(mesh);

    groupX.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
    groupX.position.set(L_position.x1, L_position.y1, L_position.z1);
    arrowlist.push(groupX);
    return arrowlist
  }

  //矢印（分布荷重Y）を描く
  public CreateArrow_Y (arrow, L_position, localAxis, Data){
    //正負が逆だったので応急処置
    Data.P1 = Data.P1 * (-1);
    Data.P2 = Data.P2 * (-1);
    const arrowlist = [];
    const groupY = new THREE.Group();

    let geometry = new THREE.Geometry(); //geometryの初期化
    const interval = 0.7;
    const len_Lx = L_position.x2 - L_position.x1;
    const len_Ly = L_position.y2 - L_position.y1;
    const len_Lz = L_position.z2 - L_position.z1;
    const len_L: number = new THREE.Vector3(len_Lx, len_Ly, len_Lz).length();
    let count_L = Math.floor(len_L / interval);
    if (count_L > 0 && count_L < 1){
      count_L = 1;
    }
    const difference_P = Data.p_two * Math.sign(Data.P2) - Data.p_one * Math.sign(Data.P1);
    for (let i = 0; i <= count_L; i ++){

      //矢の先を描く
      let x : number;
      let y : number = arrow.size * 0.0;
      let z : number = arrow.size * 0.2;
      if (Data.P1 >= 0 && Data.P2 >= 0){
        x = arrow.size * 0.4;
      }else if(Data.P1 <= 0 && Data.P2 <= 0){
        x = arrow.size * -0.4;
      }else if(Data.P1 * Data.P2 < 0){
        if(i / count_L < Math.abs(Data.P1 / (Data.P2 - Data.P1))){
          x = arrow.size * 0.4 * Math.sign(Data.P1);
        }else if(i / count_L > Math.abs(Data.P1 / (Data.P2 - Data.P1))){
          x = arrow.size * 0.4 * Math.sign(Data.P1) * (-1);
        }else{
          continue;
        }
      }

      if (Data.P1 * Data.P2 !== 0){
        geometry.vertices.push(new THREE.Vector3(x, y, z));
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        z = arrow.size * -0.2;
        geometry.vertices.push(new THREE.Vector3(x, y, z));
      }else if(Data.P1 === 0 && Data.P2 !== 0){
        if (i === 0){
          continue;
        }else{
          geometry.vertices.push(new THREE.Vector3(x, y, z));
          geometry.vertices.push(new THREE.Vector3(0, 0, 0));
          z = arrow.size * -0.2;
          geometry.vertices.push(new THREE.Vector3(x, y, z));
        }
      }else if(Data.P1 !== 0 && Data.P2 === 0){
        if (i + 1 > count_L){
          continue;
        }else{
          geometry.vertices.push(new THREE.Vector3(x, y, z));
          geometry.vertices.push(new THREE.Vector3(0, 0, 0));
          z = arrow.size * -0.2;
          geometry.vertices.push(new THREE.Vector3(x, y, z));
        }
      }

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
      x = Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L;
      geometry.vertices.push(new THREE.Vector3(x, y, z));
      mesh = new THREE.Line(geometry, line);
      groupY.add(mesh);

      geometry = new THREE.Geometry(); //geometryの初期化
    }
    //分布荷重をまとめる棒
    geometry.vertices.push(new THREE.Vector3(Data.p_one * Math.sign(Data.P1), 0, 0));
    geometry.vertices.push(new THREE.Vector3(Data.p_two * Math.sign(Data.P2), 0, len_L));
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
    geometry.vertices.push(new THREE.Vector3(Data.p_one * Math.sign(Data.P1), 0, 0));
    geometry.vertices.push(new THREE.Vector3(Data.p_two * Math.sign(Data.P2), 0, len_L));
    geometry.vertices.push(new THREE.Vector3(0, 0, len_L));
    if (Data.P1 * Data.P2 >= 0){
      var face1 = new THREE.Face3(0, 1, 2);
      var face2 = new THREE.Face3(0, 2, 3);
    }else if(Data.P1 * Data.P2 < 0){
      geometry.vertices.push(new THREE.Vector3(0, 0, (Math.abs(Data.P1) / (Math.abs(Data.P1) + Math.abs(Data.P2))) * len_L));
      var face1 = new THREE.Face3(0, 1, 4);
      var face2 = new THREE.Face3(2, 3, 4);
    }
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
    //正負が逆だったので応急処置
    Data.P1 = Data.P1 * (-1);
    Data.P2 = Data.P2 * (-1);
    const arrowlist = [];
    const groupZ = new THREE.Group();

    let geometry = new THREE.Geometry();
    const interval = 0.7;
    const len_Lx = L_position.x2 - L_position.x1;
    const len_Ly = L_position.y2 - L_position.y1;
    const len_Lz = L_position.z2 - L_position.z1;
    const len_L: number = new THREE.Vector3(len_Lx, len_Ly, len_Lz).length();
    let count_L = Math.floor(len_L / interval);
    if (count_L > 0 && count_L < 1){
      count_L = 1;
    }
    const difference_P = Data.p_two * Math.sign(Data.P2) - Data.p_one * Math.sign(Data.P1);
    for (let i = 0; i <= count_L; i ++){

      //矢の先を描く
      let x : number = arrow.size * 0.0;
      let y : number = arrow.size * 0.2;
      let z : number;
      if (Data.P1 >= 0 && Data.P2 >= 0){
        z = arrow.size * 0.4;
      }else if(Data.P1 <= 0 && Data.P2 <= 0){
        z = arrow.size * -0.4;
      }else if(Data.P1 * Data.P2 < 0){
        if(i / count_L < Math.abs(Data.P1 / (Data.P2 - Data.P1))){
          z = arrow.size * 0.4 * Math.sign(Data.P1);
        }else if(i / count_L > Math.abs(Data.P1 / (Data.P2 - Data.P1))){
          z = arrow.size * 0.4 * Math.sign(Data.P1) * (-1);
        }else{
          continue;
        }
      }
      if (Data.P1 * Data.P2 !== 0){
        geometry.vertices.push(new THREE.Vector3(x, y, z));
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        y = arrow.size * -0.2;
        geometry.vertices.push(new THREE.Vector3(x, y, z));
      }else if(Data.P1 === 0 && Data.P2 !== 0){
        if (i === 0){
          continue;
        }else{
          geometry.vertices.push(new THREE.Vector3(x, y, z));
          geometry.vertices.push(new THREE.Vector3(0, 0, 0));
          y = arrow.size * -0.2;
          geometry.vertices.push(new THREE.Vector3(x, y, z));
        }
      }else if(Data.P1 !== 0 && Data.P2 === 0){
        if (i + 1 > count_L){
          continue;
        }else{
          geometry.vertices.push(new THREE.Vector3(x, y, z));
          geometry.vertices.push(new THREE.Vector3(0, 0, 0));
          y = arrow.size * -0.2;
          geometry.vertices.push(new THREE.Vector3(x, y, z));
        }
      }

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
      z = Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L;
      geometry.vertices.push(new THREE.Vector3(x, y, z));
      mesh = new THREE.Line(geometry, line);
      groupZ.add(mesh);

      geometry = new THREE.Geometry(); //geometryの初期化
    }
    //分布荷重をまとめる棒
    geometry.vertices.push(new THREE.Vector3(0, 0,  Data.p_one * Math.sign(Data.P1)));
    geometry.vertices.push(new THREE.Vector3(0, len_L, Data.p_two * Math.sign(Data.P2)));
    const line = new THREE.LineBasicMaterial({color: arrow.color});
    let mesh = new THREE.Line(geometry, line);
    groupZ.add(mesh);

    geometry = new THREE.Geometry(); //geometryの初期化

    //荷重の面Meshを作る
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x00cc00,
      opacity: 0.3
    }); 
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, Data.p_one * Math.sign(Data.P1)));
    geometry.vertices.push(new THREE.Vector3(0, len_L, Data.p_two * Math.sign(Data.P2)));
    geometry.vertices.push(new THREE.Vector3(0, len_L, 0));
    if (Data.P1 * Data.P2 >= 0){
      var face1 = new THREE.Face3(0, 1, 2);
      var face2 = new THREE.Face3(0, 2, 3);
    }else if (Data.P1 * Data.P2 < 0){
      geometry.vertices.push(new THREE.Vector3(0, (Math.abs(Data.P1) / (Math.abs(Data.P1) + Math.abs(Data.P2))) * len_L, 0));
      var face1 = new THREE.Face3(0, 1, 4);
      var face2 = new THREE.Face3(2, 3, 4);
    }
    geometry.faces.push(face1);
    geometry.faces.push(face2);
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    let mesh2 = new THREE.Mesh(geometry, material);
    groupZ.add(mesh2);

    //groupの操作
    if (len_Lz !== 0){
      groupZ.lookAt(localAxis.z.x, localAxis.z.y, localAxis.z.z);
    }else if (len_Lz === 0){
      groupZ.rotation.z = Math.PI * 1.5 + Math.atan2(len_Ly, len_Lx);
    }
    groupZ.position.set(L_position.x1, L_position.y1, L_position.z1);
    arrowlist.push(groupZ);
    return arrowlist
  }

  //部材ねじりモーメント(分布モーメント)荷重
  public CreateArrow_R (arrow, L_position, localAxis, Data){

    Data.p_one = Data.p_one * 0.2;
    Data.p_two = Data.p_two * 0.2;
    const arrowlist = [];
    const groupR = new THREE.Group();

    const interval = 0.7;
    const len_Lx = L_position.x2 - L_position.x1;
    const len_Ly = L_position.y2 - L_position.y1;
    const len_Lz = L_position.z2 - L_position.z1;
    const len_L: number = new THREE.Vector3(len_Lx, len_Ly, len_Lz).length();
    let untilZeo = Math.abs(Data.P1) / (Math.abs(Data.P1) + Math.abs(Data.P2)) * len_L;
    const count_L = Math.floor(len_L / interval);
    let x = (L_position.x2 + L_position.x1) / 2;
    let y = (L_position.y2 + L_position.y1) / 2;
    let z = (L_position.z2 + L_position.z1) / 2;
    const difference_P = Data.p_two * Math.sign(Data.P2) - Data.p_one * Math.sign(Data.P1);
    
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: arrow.color,
      opacity: 0.3
    }); 
    if (Data.P1 * Data.P2 >= 0){
      const geometry = new THREE.CylinderGeometry(
        Data.p_one * Math.sign(Data.P1), //radiusTop
        Data.p_two * Math.sign(Data.P2), //radiusBottom
        len_L,      12,              //height, radialSegments
        1,          true,                // heightSegments, openEnded
        3,       3/2 * Math.PI        //thetaStart, thetaLength
      );
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      groupR.add(mesh);

    }else if(Data.P1 * Data.P2 < 0){

      //untilZeo = Math.abs(Data.P1) / (Math.abs(Data.P1) + Math.abs(Data.P2)) * len_L;
      //i端側のコーン
      let geometry = new THREE.CylinderGeometry(
        Data.p_one * Math.sign(Data.P1), 0, //radiusTop, radiusBottom
        untilZeo,      12,                  //height, radialSegments
        1,             true,                // heightSegments, openEnded
        3,             3/2 * Math.PI        //thetaStart, thetaLength
      );
      let mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, 0, -(len_L - untilZeo) / 2)
      groupR.add(mesh);
      //j端側のコーン
      geometry = new THREE.CylinderGeometry(
        0, Data.p_two * Math.sign(Data.P2), //radiusTop, radiusBottom
        len_L - untilZeo,      12,          //height, radialSegments
        1,             true,                // heightSegments, openEnded
        3,             3/2 * Math.PI        //thetaStart, thetaLength
      );
      mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, 0, untilZeo / 2);
      groupR.add(mesh);
    }

    for (let i = 0; i <= count_L ; i++){
      //lineの制御 
      x = 0;
      y = 0;
      z = len_L * i / count_L - len_L / 2;
      const CorrectionAngle = - Math.PI * 13 / 24;
      const curve = new THREE.EllipseCurve(
        0,           0,                 // ax,          aY
        Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L,   // xRadius,
        Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L,   // yRadius
        CorrectionAngle + 0 * Math.PI, CorrectionAngle + 3/2 * Math.PI, // aStartAngle, aEndAngle
        false,       0                  // aClockwise, aRotation          
      );
      const points = curve.getPoints( 50 );
      const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
      const lineMaterial = new THREE.LineBasicMaterial( { color: arrow.color, linewidth: 5 } );
      const line = new THREE.Line( lineGeometry, lineMaterial );
      line.rotation.y = Math.PI;
      line.position.set(x, y, z);

      if (Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L !== 0){
        groupR.add(line);
      }
      //コーンの制御
      const cone_radius: number = 0.1 * arrow.size;
      const cone_height: number = 1 * arrow.size;
      const arrowGeometry = new THREE.ConeGeometry( cone_radius, cone_height, 3, 1, true );
      const arrowMaterial = new THREE.MeshBasicMaterial( {color: arrow.color} );
      const cone = new THREE.Mesh( arrowGeometry, arrowMaterial );

      if (Data.P1 * Data.P2 >= 0){
        if (Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L > 0){  //pが正の方
          cone.rotation.z = -Math.PI / 2;
          y = -Data.p_one * Math.sign(Data.P1) - difference_P * i / count_L;
          cone.position.set(x, y, z);
        }else if (Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L < 0){  //pが負の方
          x =  Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L;
          cone.position.set(x, y, z);
        }
      }else if(Data.P1 * Data.P2 < 0){
        if (Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L > 0){  //pが負の方
          cone.rotation.z = -Math.PI / 2;
          y = -Data.p_one * Math.sign(Data.P1) - difference_P * i / count_L;
          cone.position.set(x, y, z);
        }else if (Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L < 0){  //pが正の方
          x =  Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L;
          cone.position.set(x, y, z);
        }
      }

      if (Data.p_one * Math.sign(Data.P1) + difference_P * i / count_L !== 0){
        groupR.add(cone);
      }
    }
    x = (L_position.x2 + L_position.x1) / 2;
    y = (L_position.y2 + L_position.y1) / 2;
    z = (L_position.z2 + L_position.z1) / 2;
    groupR.lookAt(localAxis.x.x, localAxis.x.y, localAxis.x.z);
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

