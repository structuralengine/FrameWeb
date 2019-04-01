import { Component, Input, OnInit, NgZone } from '@angular/core';
import { UnityLoader } from './UnityLoader.js';
import { UnityProgress } from './UnityProgress.js';
import { UnityConnectorService } from '../providers/unity-connector.service';

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
    private unityConnector: UnityConnectorService) {
  }

  ngOnInit() {
    window['UnityLoader'] = UnityLoader;
    window['UnityProgress'] = UnityProgress;

    window['angularComponentReference'] = {
      zone: this.zone,
      componentFnction1: (value) => this.unityConnector.ReceiveUnity(value),
      componentFnction2: (value) => this.unityConnector.ReceiveUnitySelectItemChenge(value),
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

    if (this.appLocation) {
      this.loadProject(this.appLocation);
    }
  }

  public loadProject(path) {
    this.unityInstance = UnityLoader.instantiate('unityContainer', path);
    this.unityConnector.setUnityInstance(this.unityInstance);
  }

}
