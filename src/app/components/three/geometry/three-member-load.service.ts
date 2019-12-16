import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThreeMemberLoadService {

  private MemberLoad: THREE.BoxBufferGeometry; // 分布荷重
  private MemberAxsialLoad: THREE.BoxBufferGeometry; // 平行方向分布荷重
  private MemberMomentLoad: THREE.BoxBufferGeometry; // ねじりモーメント荷重

  constructor() { }
}
