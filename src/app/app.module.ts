import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';


import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';
import { HotTableModule } from '@handsontable/angular';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { InputDataService } from './providers/input-data.service';
import { DataHelperModule } from './providers/data-helper.module';
import { ResultDataService } from './providers/result-data.service';
import { UserInfoService } from './providers/user-info.service';
import { UnityConnectorService } from './unity/unity-connector.service';

import { MenuComponent } from './components/menu/menu.component';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { WaitDialogComponent } from './components/wait-dialog/wait-dialog.component';

import { UnityComponent } from './unity/unity.component';

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

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpModule,
    AppRoutingModule,
    DragDropModule,
    BrowserAnimationsModule,
    NgbModule.forRoot(),
    HotTableModule,
    DataHelperModule
  ],
  declarations: [
    AppComponent,
    WebviewDirective,
    UnityComponent,
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
    ResultCombineFsecComponent
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
    UnityConnectorService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
