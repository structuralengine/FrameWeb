import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThreeFixMemberService {

  private BufferGeometry: THREE.SphereBufferGeometry; //  分布バネ

  constructor() { }
}
