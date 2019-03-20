import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';
import { HotTableModule } from '@handsontable/angular';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FrameDataService } from './providers/frame-data.service';
import { InputDataService } from './providers/input-data.service';
import { ResultDataService } from './providers/result-data.service';
import { UserInfoService } from './providers/user-info.service';

import { MenuComponent } from './components/menu/menu.component';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';

import { UnityComponent } from './unity/unity.component';

import { InputNodesComponent } from './components/input-nodes/input-nodes.component';
import { InputMembersComponent } from './components/input-members/input-members.component';
import { InputFixNodeComponent } from './components/input-fix-node/input-fix-node.component';
import { InputElementsComponent } from './components/input-elements/input-elements.component';
import { InputJointComponent } from './components/input-joint/input-joint.component';
import { InputNoticePointsComponent } from './components/input-notice-points/input-notice-points.component';
import { InputFixMemberComponent } from './components/input-fix-member/input-fix-member.component';
import { InputLoadNameComponent } from './components/input-load-name/input-load-name.component';
import { InputLoadComponent } from './components/input-load/input-load.component';
import { InputDefineComponent } from './components/input-define/input-define.component';
import { InputCombineComponent } from './components/input-combine/input-combine.component';
import { InputPickupComponent } from './components/input-pickup/input-pickup.component';
import { ResultDisgComponent } from './components/result-disg/result-disg.component';
import { ResultReacComponent } from './components/result-reac/result-reac.component';
import { ResultFsecComponent } from './components/result-fsec/result-fsec.component';
import { ResultCombineDisgComponent } from './components/result-combine-disg/result-combine-disg.component';
import { ResultPickupDisgComponent } from './components/result-pickup-disg/result-pickup-disg.component';
import { ResultCombineReacComponent } from './components/result-combine-reac/result-combine-reac.component';
import { ResultPickupReacComponent } from './components/result-pickup-reac/result-pickup-reac.component';
import { ResultPickupFsecComponent } from './components/result-pickup-fsec/result-pickup-fsec.component';
import { ResultCombineFsecComponent } from './components/result-combine-fsec/result-combine-fsec.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

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
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    NgbModule.forRoot(),
    HotTableModule
  ],
  declarations: [
    AppComponent,
    WebviewDirective,
    UnityComponent,
    InputNodesComponent,
    InputMembersComponent,
    MenuComponent,
    LoginDialogComponent,
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
    LoginDialogComponent
  ],
  providers: [
    ElectronService,
    FrameDataService,
    InputDataService,
    ResultDataService,
    UserInfoService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
