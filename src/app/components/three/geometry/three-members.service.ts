import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThreeMembersService {

  private BufferGeometry: THREE.Line; // メンバー

  constructor() { }
}
