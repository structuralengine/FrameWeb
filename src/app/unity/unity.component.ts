import { Component, Input, OnInit, NgZone } from '@angular/core';
import { UnityLoader } from './UnityLoader.js';
import { UnityProgress } from './UnityProgress.js';
import { UnityConnectorService } from './unity-connector.service';


import { InputNodesService } from '../components/input/input-nodes/input-nodes.service';

declare var window: any;

@Component({
  selector: 'app-unity',
  templateUrl: './unity.component.html',
  styleUrls: ['./unity.component.css']
})
export class UnityComponent implements OnInit {
  unityInstance: any;
  @Input() appLocation: String;
  @Input() appWidth: String;
  @Input() appHeight: String;

  constructor(private zone: NgZone,
              private unityConnector: UnityConnectorService,
              private node: InputNodesService) { }

  ngOnInit() {
    window['UnityLoader'] = UnityLoader;
    window['UnityProgress'] = UnityProgress;

    window['angularComponentReference'] = {
      zone: this.zone,
      componentFnction1: (value) => this.unityConnector.ReceiveUnity(value),
      componentFnction2: (value) => this.unityConnector.ReceiveUnitySelectItemChenge(value),
      getNodeJson: () => this.node.getNodeText(),
      component: this,
    };

    window['ReceiveUnity'] = function (value: any) {
      window.angularComponentReference.zone.run(function () {
        window.angularComponentReference.componentFnction1(value);
      });
    };

    window['ReceiveUnitySelectItemChenge'] = function (value: any) {
      window.angularComponentReference.zone.run(function () {
        window.angularComponentReference.componentFnction2(value);
      });
    };

    window['GetNodeData'] = function () {
      window.angularComponentReference.zone.run(function () {
        window.angularComponentReference.getNodeJson();
      });
    };


    if (this.appLocation) {
      this.loadProject(this.appLocation);
    }
  }

  public loadProject(path) {
    this.unityInstance = UnityLoader.instantiate('unityContainer', path);
    this.unityConnector.setUnityInstance(this.unityInstance);
  }

}
