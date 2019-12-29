import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThreeSectionForceService {

  private BufferGeometry: THREE.BoxBufferGeometry; // モーメント図

  constructor() { }
}
