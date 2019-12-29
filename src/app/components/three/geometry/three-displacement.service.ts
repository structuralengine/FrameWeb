import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';

import { ResultDisgService } from '../../result/result-disg/result-disg.service';
import { ResultCombineDisgService } from '../../result/result-combine-disg/result-combine-disg.service';
import { ResultPickupDisgService } from '../../result/result-pickup-disg/result-pickup-disg.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeDisplacementService {

  private lineList: THREE.Line[];

  constructor(private disg: ResultDisgService,
              private comb_disg: ResultCombineDisgService,
              private pik_disg: ResultPickupDisgService) { }

  // データをクリアする
  public ClearData(scene: SceneService): void {
    // 線を削除する
    for (const mesh of this.lineList) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
      scene.remove(mesh);
    }
    this.lineList = new Array();
  }

  // 表示を消す
  public Disable(): void {
  }

  // 表示する
  public Enable(): void {
  }

  public chengeData(scene: SceneService, index: number): void {

    // 一旦全排除
    this.ClearData(scene);

    // 格点データを入手
    const disgData = this.disg.getDisgJson();
    const disgKeys = Object.keys(disgData);
    if (disgKeys.length <= 0) {
      return;
    }

    // // 節点荷重データを入手
    // const targetCase: string = index.toString();
    // const nodeLoadData = this.load.getNodeLoadJson('unity-loads:' + targetCase);
    // if (Object.keys(nodeLoadData).length <= 0) {
    //   this.ClearNodeLoad(scene);
    //   return;
    // }

    // // サイズを調整しオブジェクトを登録する
    // this.createNodeLoad(scene, nodeLoadData[targetCase], nodeData);

    // // メンバーデータを入手
    // const memberData = this.member.getMemberJson('calc');
    // const memberKeys = Object.keys(memberData);
    // if (memberKeys.length <= 0) {
    //   this.ClearMemberLoad(scene);
    //   return;
    // }

  }

}
