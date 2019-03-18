import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class InputDataService {

    public node: any[] 
    public member: any[] 
    public fix_node: any
    public element: any
    public joint: any
    
    public notice_points: any[] 
    static NOTICE_POINTS_COUNT: number = 20;

    public fix_member: any
    public load_name: any[] 
    public load: any[] 

    public define: any[] 
    static DEFINE_CASE_COUNT: number = 20;

    public combine: any[] 
    static COMBINE_CASE_COUNT: number = 20;

    public pickup: any[] 
    static PICKUP_CASE_COUNT: number = 20;

    constructor() {
        this.clear();
    }

    public clear(): void{

        this.node = new Array();
        this.member = new Array();
        this.fix_node = {};
        this.element = {};
        this.joint = {};
        this.notice_points = new Array();
        this.fix_member = {};
        this.load_name = new Array();
        this.load = new Array();

        this.define = new Array();
        this.combine = new Array();
        this.pickup = new Array();
    
    }

    public getNodeColumns(index: number): any {

        let result: any = null;
        for (let i = 0; i < this.node.length; i++) {
            var tmp = this.node[i];
            if (tmp['id'] == index) {
                result = tmp;
                break;
            }
        }
        // 対象データが無かった時に処理
        if (result == null) {
            result = { id: index, x: '', y: '', z: '' };
            this.node.push(result);
        } 
        return result;
    }

    public getMemberColumns(index: number): any {

        let result: any = null;
        for (let i = 0; i < this.member.length; i++) {
            var tmp = this.member[i];
            if (tmp['id'] == index) {
                result = tmp;
                break;
            }
        }
        // 対象データが無かった時に処理
        if (result == null) {
            result = { id: index, ni: '', nj: '', e: '', cg: '' };
            this.member.push(result);
        }
        return result;
    }

    public getFixNodeColumns(typNo: number, row: number): any{

        let target: any = null;
        let result: any = null;

        // タイプ番号を探す
        if (!this.fix_node[typNo]) {
            target = new Array();
        } else {
            target = this.fix_node[typNo];
        }

        // 行を探す
        for (let i = 0; i < target.length; i++) {
            var tmp = target[i];
            if (tmp['row'] == row) {
                result = tmp;
                break;
            }
        }

        // 対象行が無かった時に処理
        if (result == null) {
            result = { row: row, n: '', tx: '', ty: '', tz: '', rx: '', ry: '', rz: ''  };
            target.push(result);
            this.fix_node[typNo] = target;
        }

        return result;        
    }

    public getElementColumns(typNo: number, index: number): any {

        let target: any = null;
        let result: any = null;

        // タイプ番号を探す
        if (!this.element[typNo]) {
            target = new Array();
        } else {
            target = this.element[typNo];
        }

        // 行を探す
        for (let i = 0; i < target.length; i++) {
            var tmp = target[i];
            if (tmp['id'] == index) {
                result = tmp;
                break;
            }
        }

        // 対象行が無かった時に処理
        if (result == null) {
            result = { id: index, E: '', G: '', Xp: '', A: '', J: '', Iy: '', Iz: '' };
            target.push(result);
            this.element[typNo] = target;
        }

        return result;
    }

    public getJointColumns(typNo: number, row: number): any {

        let target: any = null;
        let result: any = null;

        // タイプ番号を探す
        if (!this.joint[typNo]) {
            target = new Array();
        } else {
            target = this.joint[typNo];
        }

        // 行を探す
        for (let i = 0; i < target.length; i++) {
            var tmp = target[i];
            if (tmp['row'] == row) {
                result = tmp;
                break;
            }
        }

        // 対象行が無かった時に処理
        if (result == null) {
            result = { row: row, m: '', xi: '', yi: '', zi: '', xj: '', yj: '', zj: '' };
            target.push(result);
            this.joint[typNo] = target;
        }

        return result;
    }

    public getNoticePointsColumns(row: number): any {

        let result: any = null;

        for (let i = 0; i < this.notice_points.length; i++) {
            var tmp = this.notice_points[i];
            if (tmp['row'] == row) {
                result = tmp;
                break;
            }
        }
        // 対象データが無かった時に処理
        if (result == null) {
            result = { row: row, m: '', len: '' };
            for (var i = 1; i <= InputDataService.NOTICE_POINTS_COUNT; i++) {
                result["L" + i] = '';
            }
            this.notice_points.push(result);
        } else {
            // データの不足を補う
            if (!('len' in result)) {
                result['len'] = '0'; //ここに部材長さを計算するコードを書いてください. sasa
            }
            for (var i = 1; i <= InputDataService.NOTICE_POINTS_COUNT; i++) {
                if (!(("L" + i) in result)) {
                    result["L" + i] = '';
                }
            }
        }
        return result;
    }

    public getFixMemberColumns(typNo: number, row: number): any {

        let target: any = null;
        let result: any = null;

        // タイプ番号を探す
        if (!this.fix_member[typNo]) {
            target = new Array();
        } else {
            target = this.fix_member[typNo];
        }

        // 行を探す
        for (let i = 0; i < target.length; i++) {
            var tmp = target[i];
            if (tmp['row'] == row) {
                result = tmp;
                break;
            }
        }

        // 対象行が無かった時に処理
        if (result == null) {
            result = { row: row, m: '', tx: '', ty: '', tz: '', tr: '' };
            target.push(result);
            this.fix_member[typNo] = target;
        }

        return result;
    }

    public getLoadNameColumns(index: number): any {

        let result: any = null;
        for (let i = 0; i < this.load_name.length; i++) {
            var tmp = this.load_name[i];
            if (tmp['id'] == index) {
                result = tmp;
                break;
            }
        }
        // 対象データが無かった時に処理
        if (result == null) {
            result = { id: index, rate: '', symbol: '', name: '', fix_node: '', fix_member: '', element: '', joint: '' };
            this.load_name.push(result);
        }
        return result;
    }

    public getLoadColumns(row: number): any {

        let result: any = null;
        for (let i = 0; i < this.load.length; i++) {
            var tmp = this.load[i];
            if (tmp['row'] == row) {
                result = tmp;
                break;
            }
        }
        // 対象データが無かった時に処理
        if (result == null) {
            result = {
                row: row, load_id: '', m1: '', m2: '', direction: '', mark: '', L1: '', L2: '', P1: '', P2: '',
                n: '', tx: '', ty: '', tz: '', rx: '', ry: '', rz: ''
            };
            this.load.push(result);
        }
        return result;
    }

    public getDefineDataColumns(row: number): any {

        let result: any = null;

        for (let i = 0; i < this.define.length; i++) {
            var tmp = this.define[i];
            if (tmp['row'] == row) {
                result = tmp;
                break;
            }
        }

        // 対象データが無かった時に処理
        if (result == null) {
            result = { row: row };
            for (var i = 1; i <= InputDataService.DEFINE_CASE_COUNT; i++) {
                result["C" + i] = '';
            }
            this.define.push(result);
        }
        return result;
    }

    public getCombineDataColumns(row: number): any {

        let result: any = null;

        for (let i = 0; i < this.combine.length; i++) {
            var tmp = this.combine[i];
            if (tmp['row'] == row) {
                result = tmp;
                break;
            }
        }

        // 対象データが無かった時に処理
        if (result == null) {
            result = { row: row };
            for (var i = 1; i <= InputDataService.COMBINE_CASE_COUNT; i++) {
                result["C" + i] = '';
            }
            this.combine.push(result);
        }
        return result;
    }

    public getPickUpDataColumns(row: number): any {

        let result: any = null;

        for (let i = 0; i < this.pickup.length; i++) {
            var tmp = this.pickup[i];
            if (tmp['row'] == row) {
                result = tmp;
                break;
            }
        }

        // 対象データが無かった時に処理
        if (result == null) {
            result = { row: row };
            for (var i = 1; i <= InputDataService.PICKUP_CASE_COUNT; i++) {
                result["C" + i] = '';
            }
            this.pickup.push(result);
        }
        return result;
    }

}