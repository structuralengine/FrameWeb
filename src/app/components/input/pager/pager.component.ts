import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";

import { DataHelperModule } from "src/app/providers/data-helper.module";

@Component({
  selector: "app-pager",
  templateUrl: "./pager.component.html",
  styleUrls: ["./pager.component.scss"],
})
export class PagerComponent implements OnInit {
  //  親コンポーネントに対してイベントを発火するためのプロパティ
  @Output() event = new EventEmitter<number>();

  public liActive = [false, false, false, false, false];
  public liNumber = [1, 2, 3, 4, 5];
  public myControl: FormGroup;
  public Editing: boolean = false;
  public page: number = 0;

  constructor(private helper: DataHelperModule) {
    this.changePage(1);
  }

  ngOnInit(): void {
    this.myControl = new FormGroup({
      number2: new FormControl(),
    });
  }

  public changePage(currentPage: number): void {

    currentPage = Math.abs(currentPage);

    if (currentPage === this.page) {
      // 同じボタンを押した時
      this.Editing = true; // 編集ボックスを表示する
      return; // 何もしない
    }
    this.page = currentPage;

    // 親コンポーネントに通知する
    this.event.emit(this.page);

    // ページ番号性を設定する
    const n = Math.min(currentPage - 1, 2);
    for (let i = 0; i < this.liNumber.length; i++) {
      this.liNumber[i] = currentPage - n + i;
    }

    // active属性を設定する
    for (let i = 0; i < this.liActive.length; i++) {
      this.liActive[i] = false;
    }
    this.liActive[n] = true;

  }

  // ページを飛んだあと左右＜＞に移動や隣ページへの移動周辺、5ページ送り
  public moveToNextPage(count: number): void {
    let Next: number;
    let additional: number;
    let minus: number;
    var plus: number;

    // 1、2ページ目だけイレギュラーな動きをする
    if (this.page === 1) {
      additional = 2;
      minus = -2;
      plus = -1;
    } else if (this.page === 2) {
      additional = 1;
      minus = -1;
      plus = 0;
    } else {
      additional = 0;
      minus = -1;
      plus = 1;
    }

    Next = this.page + count + additional;
    if (Next < 1) {
      Next = 1;
    }

    this.changePage(Next);
  } // 見えないところにボタンを配置してある。ボタンを押すのとEnterを押すのは同じとしているのでこれが発火点となる

  public click(id = null) {
    let value: number;

    if (id === null) {
      value = this.helper.toNumber(this.myControl.value.number2);
    } else {
      value = this.helper.toNumber(id);
    }

    if (value !== null) {
      this.page = null; // 一旦 null
      this.changePage(value);
      this.Editing = false;
    }
  }
}
