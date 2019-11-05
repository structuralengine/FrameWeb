import { Injectable } from '@angular/core';
import { InputDataService } from 'src/app/providers/input-data.service';
import { SceneService } from './scene.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  constructor(private input: InputDataService,
              private scene: SceneService) { }

  public chengeData(): void {
    const jsonData = this.input.node.getNodeJson('calc');
    
  }

  public ClearData(): void {

  }

  public ChengeMode(ModeName: string, currentPage: number = null): void {

    switch (ModeName) {
      case 'nodes':
        break;

      case 'fix_nodes':
        break;

      case 'members':
        break;

      case 'joints':
        break;

      case 'loads':
        break;

      case 'notice_points':
        break;

      case 'comb_disg':
        break;

      case 'comb_fsec':
        break;

      case 'comb_reac':
        break;

      case 'disg':
        break;

      case 'fsec':
        break;

      case 'pik_disg':
        break;

      case 'pik_fsec':
        break;

      case 'pik_reac':
        break;

      case 'reac':
        break;
    }

  }
}
