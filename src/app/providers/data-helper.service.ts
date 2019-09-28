import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataHelperService {

  constructor() { }

  // 文字列string を数値にする
  public toNumber(num: string, digit: number = null): number {
    let result: number = null;
    try {
      const tmp: string = num.toString().trim();
      if (tmp.length > 0) {
        result = ((n: number) => isNaN(n) ? null : n)(+tmp);
      }
    } catch{
      result = null;
    }
    if (digit != null) {
      const dig: number = 10 ** digit;
      result = Math.round(result * dig) / dig;
    }
    return result;
  }

  public objectEquals(a: any, b: any): boolean {

    if (a === b) {
      // 同一インスタンスならtrueを返す
      return true;
    }

    // 比較対象双方のキー配列を取得する（順番保証のためソートをかける）
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();

    // 比較対象同士のキー配列を比較する
    if (aKeys.toString() !== bKeys.toString()) {
      // キーが違う場合はfalse
      return false;
    }

    // 値をすべて調べる。
    const wrongIndex = aKeys.findIndex(function (value) {
      // 注意！これは等価演算子で正常に比較できるもののみを対象としています。
      // つまり、ネストされたObjectやArrayなどには対応していないことに注意してください。
      return a[value] !== b[value];
    });

    // 合致しないvalueがなければ、trueを返す。
    return wrongIndex === -1;
  }

}
