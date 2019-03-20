import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


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
import { ResultCombineReacComponent } from './components/result-combine-reac/result-combine-reac.component';
import { ResultCombineFsecComponent } from './components/result-combine-fsec/result-combine-fsec.component';
import { ResultPickupDisgComponent } from './components/result-pickup-disg/result-pickup-disg.component';
import { ResultPickupReacComponent } from './components/result-pickup-reac/result-pickup-reac.component';
import { ResultPickupFsecComponent } from './components/result-pickup-fsec/result-pickup-fsec.component';

const routes: Routes = [
    { path: '', redirectTo: '/input-nodes', pathMatch: 'full' },
    { path: 'input-nodes', component: InputNodesComponent },
    { path: 'input-members', component: InputMembersComponent },
    { path: 'input-fix-node', component: InputFixNodeComponent },
    { path: 'input-elements', component: InputElementsComponent },
    { path: 'input-joint', component: InputJointComponent },
    { path: 'input-notice-points', component: InputNoticePointsComponent },
    { path: 'input-fix-member', component: InputFixMemberComponent },

    { path: 'input-load-name', component: InputLoadNameComponent },
    { path: 'input-load', component: InputLoadComponent },

    { path: 'input-define', component: InputDefineComponent },
    { path: 'input-combine', component: InputCombineComponent },
    { path: 'input-pickup', component: InputPickupComponent },

    { path: 'result-disg', component: ResultDisgComponent },
    { path: 'result-reac', component: ResultReacComponent },
    { path: 'result-fsec', component: ResultFsecComponent },

    { path: 'result-combine-disg', component: ResultCombineDisgComponent },
    { path: 'result-combine-reac', component: ResultCombineReacComponent },
    { path: 'result-combine-fsec', component: ResultCombineFsecComponent },

    { path: 'result-pickup-disg', component: ResultPickupDisgComponent },
    { path: 'result-pickup-reac', component: ResultPickupReacComponent },
    { path: 'result-pickup-fsec', component: ResultPickupFsecComponent }

];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
