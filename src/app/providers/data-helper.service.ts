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
  
}
