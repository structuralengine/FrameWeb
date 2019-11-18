import { Injectable } from '@angular/core';
import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeNodesService {

  private BufferGeometry: THREE.SphereBufferGeometry; // 節点

  private nodeList: object;


  constructor(private node: InputNodesService) { }
}
