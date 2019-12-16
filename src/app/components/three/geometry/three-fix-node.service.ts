import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThreeFixNodeService {

  private BufferGeometry: THREE.SphereBufferGeometry; // 支点

  constructor() { }
}
