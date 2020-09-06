import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InputNodesComponent } from './components/input/input-nodes/input-nodes.component';
import { InputMembersComponent } from './components/input/input-members/input-members.component';
import { InputFixNodeComponent } from './components/input/input-fix-node/input-fix-node.component';
import { InputElementsComponent } from './components/input/input-elements/input-elements.component';
import { InputPanelComponent } from './components/input/input-panel/input-panel.component';
import { InputJointComponent } from './components/input/input-joint/input-joint.component';
import { InputNoticePointsComponent } from './components/input/input-notice-points/input-notice-points.component';
import { InputFixMemberComponent } from './components/input/input-fix-member/input-fix-member.component';
import { InputLoadNameComponent } from './components/input/input-load/input-load-name.component';
import { InputLoadComponent } from './components/input/input-load/input-load.component';
import { InputDefineComponent } from './components/input/input-define/input-define.component';
import { InputCombineComponent } from './components/input/input-combine/input-combine.component';
import { InputPickupComponent } from './components/input/input-pickup/input-pickup.component';

import { ResultDisgComponent } from './components/result/result-disg/result-disg.component';
import { ResultReacComponent } from './components/result/result-reac/result-reac.component';
import { ResultFsecComponent } from './components/result/result-fsec/result-fsec.component';
import { ResultCombineDisgComponent } from './components/result/result-combine-disg/result-combine-disg.component';
import { ResultCombineReacComponent } from './components/result/result-combine-reac/result-combine-reac.component';
import { ResultCombineFsecComponent } from './components/result/result-combine-fsec/result-combine-fsec.component';
import { ResultPickupDisgComponent } from './components/result/result-pickup-disg/result-pickup-disg.component';
import { ResultPickupReacComponent } from './components/result/result-pickup-reac/result-pickup-reac.component';
import { ResultPickupFsecComponent } from './components/result/result-pickup-fsec/result-pickup-fsec.component';


const routes: Routes = [
  { path: '', redirectTo: '/input-nodes', pathMatch: 'full' },
  { path: 'input-nodes', component: InputNodesComponent },
  { path: 'input-members', component: InputMembersComponent },
  { path: 'input-fix_nodes', component: InputFixNodeComponent },
  { path: 'input-elements', component: InputElementsComponent },
  { path: 'input-panel', component: InputPanelComponent },
  { path: 'input-joints', component: InputJointComponent },
  { path: 'input-notice_points', component: InputNoticePointsComponent },
  { path: 'input-fix_members', component: InputFixMemberComponent },

  { path: 'input-load-name', component: InputLoadNameComponent },
  { path: 'input-loads', component: InputLoadComponent },

  { path: 'input-define', component: InputDefineComponent },
  { path: 'input-combine', component: InputCombineComponent },
  { path: 'input-pickup', component: InputPickupComponent },

  { path: 'result-disg', component: ResultDisgComponent },
  { path: 'result-reac', component: ResultReacComponent },
  { path: 'result-fsec', component: ResultFsecComponent },

  { path: 'result-comb_disg', component: ResultCombineDisgComponent },
  { path: 'result-comb_reac', component: ResultCombineReacComponent },
  { path: 'result-comb_fsec', component: ResultCombineFsecComponent },

  { path: 'result-pic_disg', component: ResultPickupDisgComponent },
  { path: 'result-pic_reac', component: ResultPickupReacComponent },
  { path: 'result-pic_fsec', component: ResultPickupFsecComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
