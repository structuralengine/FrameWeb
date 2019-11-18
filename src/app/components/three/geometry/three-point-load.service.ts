import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThreePointLoadService {
 
  private PointLoad: THREE.BoxBufferGeometry; // 集中荷重
  private PointMomentLoad: THREE.BoxBufferGeometry; // 集中モーメント荷重

  constructor() { }
}
