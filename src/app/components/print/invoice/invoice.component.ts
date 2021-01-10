import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrintService } from '../print.service';

import { InputDataService } from '../../../providers/input-data.service';

import { InputCombineService } from '../../input/input-combine/input-combine.service';
import { InputDefineService } from '../../input/input-define/input-define.service';
import { InputNodesService } from '../../input/input-nodes/input-nodes.service';
import { InputElementsService } from '../../input/input-elements/input-elements.service';
import { InputMembersService } from '../../input/input-members/input-members.service';
import { InputFixMemberService } from '../../input/input-fix-member/input-fix-member.service';
import { AfterViewInit } from '@angular/core';
import { ThreeService } from 'src/app/components/three/three.service';
import { SceneService } from 'src/app/components/three/scene.service';
import { InputFixNodeService } from '../../input/input-fix-node/input-fix-node.service';
import { InputJointService } from '../../input/input-joint/input-joint.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { InputNoticePointsService } from '../../input/input-notice-points/input-notice-points.service';
import { InputPickupService } from '../../input/input-pickup/input-pickup.service';



@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss', '../../../app.component.scss']
})
export class InvoiceComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public node_dataset = [];
  public comb_dataset = [];
  public define_dataset = [];
  public fixMember_dataset = [];
  public fixMember_typeNum = [];
  public fixNode_dataset = [];
  public fixNode_typeNum = [];
  public joint_dataset = [];
  public joint_typeNum = [];
  public loadName_dataset = [];
  public load_title = [];
  public load_member = [];
  public load_node = [];
  public member_dataset = [];
  public notice_dataset = [];
  // public panel_dataset = [];
  public pickup_dataset = [];
  public elements_dataset = [];
  public elements_typeNum = [];


  constructor(route: ActivatedRoute,
    private printService: PrintService,
    private InputData: InputDataService,
    private comb: InputCombineService,
    private nodes: InputNodesService,
    private member: InputMembersService,
    private define: InputDefineService,
    private fixMember: InputFixMemberService,
    private fixNode: InputFixNodeService,
    private joint: InputJointService,
    private load: InputLoadService,
    private notice: InputNoticePointsService,
    // private panel: InputPanelService,
    private pickup: InputPickupService,
    private elements: InputElementsService,
    private three: ThreeService,
    private scene: SceneService,

  ) {
    this.invoiceIds = route.snapshot.params['invoiceIds']
      .split(',');
    //this.dataset = new Array();
  }

  ngOnInit() {

    this.invoiceDetails = this.invoiceIds
      .map(id => this.getInvoiceDetails(id));
    Promise.all(this.invoiceDetails)
      .then(() => this.printService.onDataReady());
  }

  getInvoiceDetails(invoiceId) {

    const amount = Math.floor((Math.random()));
    return new Promise(resolve =>
      setTimeout(() => resolve({ amount }), 1)
    );
  }


  ngAfterViewInit() {

    const inputJson: any = this.InputData.getInputJson(0);




  }


}