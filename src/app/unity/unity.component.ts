import { Component, Input, OnInit, NgZone } from '@angular/core';
import { UnityLoader } from './UnityLoader.js';
import { UnityProgress } from './UnityProgress.js';
import { UnityConnectorService } from './unity-connector.service';

declare var window: any;

@Component({
  selector: 'app-unity',
  templateUrl: './unity.component.html',
  styleUrls: ['./unity.component.css']
})
export class UnityComponent implements OnInit {
  
  @Input() appLocation: String;
  @Input() appWidth: String;
  @Input() appHeight: String;

  constructor(private zone: NgZone,
              private unityConnector: UnityConnectorService) { }

  ngOnInit() {
    window['UnityLoader'] = UnityLoader;
    window['UnityProgress'] = UnityProgress;

    window['angularComponentReference'] = {
      zone: this.zone,
      fnction1: (value) => this.unityConnector.ReceiveUnity(value),
      fnction2: (value) => this.unityConnector.ReceiveUnitySelectItemChenge(value),
      component: this,
    };

    window['ReceiveUnity'] = function (value: any) {
      window.angularComponentReference.zone.run(function () {
        window.angularComponentReference.fnction1(value);
      });
    };

    window['ReceiveUnitySelectItemChenge'] = function (value: any) {
      window.angularComponentReference.zone.run(function () {
        window.angularComponentReference.fnction2(value);
      });
    };

    if (this.appLocation) {
      this.loadProject(this.appLocation);
    }
  }

  public loadProject(path) {
    const unityInstance: any  = UnityLoader.instantiate('unityContainer', path);
    this.unityConnector.setUnityInstance(unityInstance);
  }

}
