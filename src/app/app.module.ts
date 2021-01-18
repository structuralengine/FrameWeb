import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatInputModule} from '@angular/material/input';

import { InputDataService } from './providers/input-data.service';
import { DataHelperModule } from './providers/data-helper.module';
import { ResultDataService } from './providers/result-data.service';
import { UserInfoService } from './providers/user-info.service';

import { MenuComponent } from './components/menu/menu.component';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { WaitDialogComponent } from './components/wait-dialog/wait-dialog.component';

import { InputNodesComponent } from './components/input/input-nodes/input-nodes.component';
import { InputNodesService } from './components/input/input-nodes/input-nodes.service';
import { InputMembersComponent } from './components/input/input-members/input-members.component';
import { InputMembersService } from './components/input/input-members/input-members.service';
import { InputFixNodeComponent } from './components/input/input-fix-node/input-fix-node.component';
import { InputFixNodeService } from './components/input/input-fix-node/input-fix-node.service';
import { InputElementsComponent } from './components/input/input-elements/input-elements.component';
import { InputElementsService } from './components/input/input-elements/input-elements.service';
import { InputJointComponent } from './components/input/input-joint/input-joint.component';
import { InputJointService } from './components/input/input-joint/input-joint.service';
import { InputNoticePointsComponent } from './components/input/input-notice-points/input-notice-points.component';
import { InputNoticePointsService } from './components/input/input-notice-points/input-notice-points.service';
import { InputFixMemberComponent } from './components/input/input-fix-member/input-fix-member.component';
import { InputFixMemberService } from './components/input/input-fix-member/input-fix-member.service';
import { InputLoadNameComponent } from './components/input/input-load/input-load-name.component';
import { InputLoadComponent } from './components/input/input-load/input-load.component';
import { InputLoadService } from './components/input/input-load/input-load.service';
import { InputDefineComponent } from './components/input/input-define/input-define.component';
import { InputDefineService } from './components/input/input-define/input-define.service';
import { InputCombineComponent } from './components/input/input-combine/input-combine.component';
import { InputCombineService } from './components/input/input-combine/input-combine.service';
import { InputPickupComponent } from './components/input/input-pickup/input-pickup.component';
import { InputPickupService } from './components/input/input-pickup/input-pickup.service';

import { ResultDisgComponent } from './components/result/result-disg/result-disg.component';
import { ResultDisgService } from './components/result/result-disg/result-disg.service';
import { ResultReacComponent } from './components/result/result-reac/result-reac.component';
import { ResultReacService } from './components/result/result-reac/result-reac.service';
import { ResultFsecComponent } from './components/result/result-fsec/result-fsec.component';
import { ResultFsecService } from './components/result/result-fsec/result-fsec.service';
import { ResultCombineDisgComponent } from './components/result/result-combine-disg/result-combine-disg.component';
import { ResultCombineDisgService } from './components/result/result-combine-disg/result-combine-disg.service';
import { ResultPickupDisgComponent } from './components/result/result-pickup-disg/result-pickup-disg.component';
import { ResultPickupDisgService } from './components/result/result-pickup-disg/result-pickup-disg.service';
import { ResultCombineReacComponent } from './components/result/result-combine-reac/result-combine-reac.component';
import { ResultCombineReacService } from './components/result/result-combine-reac/result-combine-reac.service';
import { ResultPickupReacComponent } from './components/result/result-pickup-reac/result-pickup-reac.component';
import { ResultPickupReacService } from './components/result/result-pickup-reac/result-pickup-reac.service';
import { ResultPickupFsecComponent } from './components/result/result-pickup-fsec/result-pickup-fsec.component';
import { ResultPickupFsecService } from './components/result/result-pickup-fsec/result-pickup-fsec.service';
import { ResultCombineFsecComponent } from './components/result/result-combine-fsec/result-combine-fsec.component';
import { ResultCombineFsecService } from './components/result/result-combine-fsec/result-combine-fsec.service';

import { ThreeComponent } from './components/three/three.component';
import { SceneService } from './components/three/scene.service';
import { InputPanelComponent } from './components/input/input-panel/input-panel.component';

import { PrintComponent } from './components/print/print.component';
import { PrintService } from './components/print/print.service';
import { PrintLayoutComponent } from './components/print/print-layout/print-layout.component';
import { InvoiceComponent } from './components/print/invoice/invoice.component';
import { PrintInputCombineComponent } from './components/print/invoice/print-input-combine/print-input-combine.component';
import { PrintInputDefineComponent } from './components/print/invoice/print-input-define/print-input-define.component';
import { PrintInputElementsComponent } from './components/print/invoice/print-input-elements/print-input-elements.component';
import { PrintInputFixMemberComponent } from './components/print/invoice/print-input-fix-member/print-input-fix-member.component';
import { PrintInputFixNodeComponent } from './components/print/invoice/print-input-fix-node/print-input-fix-node.component';
import { PrintInputJointComponent } from './components/print/invoice/print-input-joint/print-input-joint.component';
import { PrintInputLoadComponent } from './components/print/invoice/print-input-load/print-input-load.component';
import { PrintInputMembersComponent } from './components/print/invoice/print-input-members/print-input-members.component';
import { PrintInputNodesComponent } from './components/print/invoice/print-input-nodes/print-input-nodes.component';
import { PrintInputNoticePointsComponent } from './components/print/invoice/print-input-notice-points/print-input-notice-points.component';
import { PrintInputPanelComponent } from './components/print/invoice/print-input-panel/print-input-panel.component';
import { PrintInputPickupComponent } from './components/print/invoice/print-input-pickup/print-input-pickup.component';
import { PagerComponent } from './components/input/pager/pager.component';
import { SheetComponent } from './components/input/sheet/sheet.component';


@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DragDropModule,
    BrowserAnimationsModule,
    NgbModule,
    DataHelperModule,
    MatInputModule,
  ],
  declarations: [
    AppComponent,
    MenuComponent,
    LoginDialogComponent,
    WaitDialogComponent,

    InputNodesComponent,
    InputMembersComponent,
    InputFixNodeComponent,
    InputElementsComponent,
    InputJointComponent,
    InputNoticePointsComponent,
    InputFixMemberComponent,
    InputLoadNameComponent,
    InputLoadComponent,
    InputDefineComponent,
    InputCombineComponent,
    InputPickupComponent,

    ResultDisgComponent,
    ResultReacComponent,
    ResultFsecComponent,
    ResultCombineDisgComponent,
    ResultPickupDisgComponent,
    ResultCombineReacComponent,
    ResultPickupReacComponent,
    ResultPickupFsecComponent,
    ResultCombineFsecComponent,
    ThreeComponent,
    InputPanelComponent,

    PrintComponent,
    PrintLayoutComponent,
    InvoiceComponent,
    PrintInputCombineComponent,
    PrintInputDefineComponent,
    PrintInputElementsComponent,
    PrintInputFixMemberComponent,
    PrintInputFixNodeComponent,
    PrintInputJointComponent,
    PrintInputLoadComponent,
    PrintInputMembersComponent,
    PrintInputNodesComponent,
    PrintInputNoticePointsComponent,
    PrintInputPanelComponent,
    PrintInputPickupComponent,
    PagerComponent,
    SheetComponent
  ],
  entryComponents: [
    LoginDialogComponent,
    WaitDialogComponent
  ],
  providers: [
    InputDataService,
    InputNodesService,
    InputMembersService,
    InputFixNodeService,
    InputElementsService,
    InputJointService,
    InputNoticePointsService,
    InputFixMemberService,
    InputLoadService,
    InputDefineService,
    InputCombineService,
    InputPickupService,
    
    PrintService,

    ResultDataService,
    ResultDisgService,
    ResultReacService,
    ResultFsecService,
    ResultCombineDisgService,
    ResultPickupDisgService,
    ResultCombineReacService,
    ResultPickupReacService,
    ResultPickupFsecService,
    ResultCombineFsecService,

    UserInfoService,
    SceneService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
