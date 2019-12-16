import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThreeResultService {

  private BufferGeometry: THREE.BoxBufferGeometry; // モーメント図

  constructor() { }
}
