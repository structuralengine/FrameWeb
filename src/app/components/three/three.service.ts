import { Injectable } from '@angular/core';
import { InputDataService } from 'src/app/providers/input-data.service';
import { SceneService } from './scene.service';
import * as THREE from 'three';
import { DataHelperModule } from 'src/app/providers/data-helper.module';
import { DeclareFunctionStmt } from '@angular/compiler';

import { ThreeNodesService } from './geometry/three-nodes.service';
import { ThreeMembersService } from './geometry/three-members.service';
import { ThreeFixNodeService } from './geometry/three-fix-node.service';
import { ThreeFixMemberService } from './geometry/three-fix-member.service';
import { ThreeJointService } from './geometry/three-joint.service';
import { ThreeLoadService } from './geometry/three-load.service';

import { ThreeDisplacementService } from './geometry/three-displacement.service';
import { ThreeSectionForceService } from './geometry/three-section-force.service';
import { ThreeReactService } from './geometry/three-react.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  private mode: string;
  private currentIndex: number;

  constructor(public scene: SceneService,
              private node: ThreeNodesService,
              private member: ThreeMembersService,
              private fixNode: ThreeFixNodeService,
              private fixMember: ThreeFixMemberService,
              private joint: ThreeJointService,
              private load: ThreeLoadService,
              private disg: ThreeDisplacementService,
              private reac: ThreeReactService,
              private fsec: ThreeSectionForceService) {
  }

  //////////////////////////////////////////////////////
  // データの変更通知を処理する
  //////////////////////////////////////////////////////
  public chengeData(mode: string = '', index: number = 0): void {

    switch (mode){

      case 'fileLoad':
        // ファイルを読み込んだ
        this.node.chengeData();
        this.member.chengeData();
        this.fixNode.chengeData(0);
        this.fixMember.chengeData(0);
        this.joint.chengeData(0);
        this.load.chengeData(0);
        this.disg.ClearData();
        this.reac.ClearData();
        this.fsec.ClearData();
        break;

      case 'nodes':
        this.node.chengeData();
        break;

      case 'members':
        this.member.chengeData();
        break;

      case 'elements':
        // nothisng
        break;
      case 'notice_points':
        // nothisng
        break;

      case 'joints':
        this.joint.chengeData(index); 
        break;

      case 'fix_nodes':
        this.fixNode.chengeData(index); 
        break;

      case 'fix_member':
        this.fixMember.chengeData(index);
        break;     

      case 'load_names':
        // nothisng
        break;

      case 'load_points':
      case 'load_members':
          this.load.chengeData(index); 
        break;   
      
    }

    // 再描画
    this.scene.render();

    this.currentIndex = index;

  }


  //////////////////////////////////////////////////////
  // データをクリアする
  //////////////////////////////////////////////////////
  public ClearData(): void {
    // 節点データの削除
    this.node.ClearData();
    this.member.ClearData();
    this.fixNode.ClearData();
    this.fixMember.ClearData();
    this.joint.ClearData();
    this.load.ClearData();
    this.disg.ClearData();
    this.reac.ClearData();
    this.fsec.ClearData();
    this.disg.ClearData();
    this.fsec.ClearData();
    this.reac.ClearData();

    // 再描画
    this.scene.render();
  }


  //////////////////////////////////////////////////////
  // 編集モードの変更通知を処理する
  //////////////////////////////////////////////////////
  public ChengeMode(ModeName: string, currentPage: number = 1): void {

    switch (ModeName){
      case 'nodes':
        this.node.visible(true, true); 
        this.member.visible(true, false);  
        this.fixNode.visible(false);
        this.fixMember.visible(false);
        this.joint.visible(false);
        this.load.visible(false);
        this.disg.visible(false);
        this.reac.visible(false);
        this.fsec.visible(false);
        break;

      case 'members':
      case 'elements':
      case 'notice_points':
        this.node.visible(true, false); 
        this.member.visible(true, true);   
        this.fixNode.visible(false);
        this.fixMember.visible(false);
        this.joint.visible(false);
        this.load.visible(false);
        this.disg.visible(false);
        this.reac.visible(false);
        this.fsec.visible(false);
        break;

      case 'joints':
        if (this.currentIndex !== currentPage) {
          this.joint.chengeData(currentPage); 
        }
        this.node.visible(true, false); 
        this.member.visible(true, true);   
        this.fixNode.visible(false);
        this.fixMember.visible(false);
        this.joint.visible(true);
        this.load.visible(false);
        this.disg.visible(false);
        this.reac.visible(false);
        this.fsec.visible(false);
        break;

      case 'fix_nodes':
        if (this.currentIndex !== currentPage) {
          this.fixNode.chengeData(currentPage); 
        }
        this.node.visible(true, true); 
        this.member.visible(true, false);  
        this.fixNode.visible(true);
        this.fixMember.visible(false);
        this.joint.visible(false);
        this.load.visible(false);
        this.disg.visible(false);
        this.reac.visible(false);
        this.fsec.visible(false);

        break;

      case 'fix_member':
        if (this.currentIndex !== currentPage) {
          this.fixMember.chengeData(currentPage); 
        }        
        this.node.visible(true, false); 
        this.member.visible(true, true);   
        this.fixNode.visible(false);
        this.fixMember.visible(true);
        this.joint.visible(false);
        this.load.visible(false);
        this.disg.visible(false);
        this.reac.visible(false);
        this.fsec.visible(false);
        break;     

      case 'load_names':
        if (this.currentIndex !== currentPage) {
          this.load.chengeData(currentPage); 
        }     
        this.node.visible(true, false); 
        this.member.visible(true, false);   
        this.fixNode.visible(true);
        this.fixMember.visible(true);
        this.joint.visible(true);
        this.load.visible(true);
        this.disg.visible(false);
        this.reac.visible(false);
        this.fsec.visible(false);
        break;     

      case 'load_points':
        if (this.currentIndex !== currentPage) {
          this.load.chengeData(currentPage); 
        }    
        this.node.visible(true, true); 
        this.member.visible(true, false);   
        this.fixNode.visible(false);
        this.fixMember.visible(false);
        this.joint.visible(false);
        this.load.visible(true);
        this.disg.visible(false);
        this.reac.visible(false);
        this.fsec.visible(false);
        break; 

      case 'load_members':
        if (this.currentIndex !== currentPage) {
          this.load.chengeData(currentPage); 
        }    
        this.node.visible(true, false); 
        this.member.visible(true, true);   
        this.fixNode.visible(false);
        this.fixMember.visible(false);
        this.joint.visible(false);
        this.load.visible(true);
        this.disg.visible(false);
        this.reac.visible(false);
        this.fsec.visible(false);
        break;        
        
      case 'disg':
      case 'comb_disg':
      case 'pik_disg':
        if (this.currentIndex !== currentPage) {
          this.disg.chengeData(currentPage); 
        }    
        this.node.visible(true, true); 
        this.member.visible(true, false);   
        this.fixNode.visible(false);
        this.fixMember.visible(false);
        this.joint.visible(false);
        this.load.visible(false);
        this.disg.visible(true);
        this.reac.visible(false);
        this.fsec.visible(false);
        break;

      case 'reac':
      case 'comb_reac':
      case 'pik_reac':
        if (this.currentIndex !== currentPage) {
          this.reac.chengeData(currentPage); 
        }            
        this.node.visible(true, true); 
        this.member.visible(true, false);   
        this.fixNode.visible(false);
        this.fixMember.visible(false);
        this.joint.visible(false);
        this.load.visible(false);
        this.disg.visible(false);
        this.reac.visible(true);
        this.fsec.visible(false);
        break;

      case 'fsec':
      case 'comb_fsec':
      case 'pik_fsec':
        if (this.currentIndex !== currentPage) {
          this.fsec.chengeData(currentPage); 
        }           
        this.node.visible(true, false); 
        this.member.visible(true, true);   
        this.fixNode.visible(false);
        this.fixMember.visible(false);
        this.joint.visible(false);
        this.load.visible(false);
        this.disg.visible(false);
        this.reac.visible(false);
        this.fsec.visible(true);
        break;
        
    }

    if( this.mode !== ModeName ){
      this.mode = ModeName;
      this.currentIndex = -1;
    } else {
      this.currentIndex = currentPage;
    }

    // 再描画
    this.scene.render();
  }

  //////////////////////////////////////////////////////
  // マウス位置とぶつかったオブジェクトを検出する
  //////////////////////////////////////////////////////
  public detectObject(mouse: THREE.Vector2, action: string): void {

    const raycaster = this.scene.getRaycaster(mouse);

    switch (this.mode) {
      case 'nodes': // 節点データの更新
      case 'fix_nodes':
        this.node.detectObject(raycaster, action);
        break;

      case 'members':
      case 'joints':
      case 'notice_points':
        this.member.detectObject(raycaster, action);
        break;

      case 'loads':
        break;

      case 'disg':
      case 'comb_disg':
      case 'pik_disg':
        break;

      case 'fsec':
      case 'comb_fsec':
      case 'pik_fsec':
        break;

      case 'reac':
      case 'comb_reac':
      case 'pik_reac':
        break;
    }
    // 再描画
    this.scene.render();
  }
}
