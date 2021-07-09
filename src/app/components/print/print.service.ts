import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { InputDataService } from "src/app/providers/input-data.service";

@Injectable({
  providedIn: "root",
})
export class PrintService {
  isPrinting = false;
  contentEditable1: boolean[];

  public inputJson: any;
  public combineJson: any;
  public defineJson: any;
  public pickupJson: any;

  constructor(private router: Router,
              public InputData: InputDataService,) {
    this.contentEditable1 = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ];
  }

  printDocument(documentName: string, documentData: string[]) {
    this.isPrinting = true;

    // 入力データを取得する
    this.inputJson = this.InputData.getInputJson(0);
    this.combineJson = this.InputData.combine.getCombineJson();
    this.defineJson = this.InputData.define.getDefineJson();
    this.pickupJson = this.InputData.pickup.getPickUpJson();
    
    // 
    this.router.navigate(["/", {
        outlets: {
          print: ["print", documentName, documentData.join()],
        },
      },
    ]);
  }

  onDataReady() {
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
      this.router.navigate([{ outlets: { print: null } }]);
    });
  }
}
