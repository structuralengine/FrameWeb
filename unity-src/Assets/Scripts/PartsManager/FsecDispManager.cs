using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;
using UnityEngine;


/// <summary>
/// 断面力（Fsec）の表示を管理するクラス
/// </summary>
public class FsecDispManager : PartsDispManager
{
    public enum DispType
    {
        fx,
        fy,
        fz,
        mx,
        my,
        mz
    }

    private DispType _dispType = DispType.mz;

    public override void CreateParts()
    {
        try
        {
            // 前のオブジェクトを消す
            foreach (string id in base._blockWorkData.Keys)
            {
                try
                {
                    Destroy(base._blockWorkData[id].renderer.sharedMaterial);
                    Destroy(base._blockWorkData[id].gameObject);
                }
                catch { }
            }
            base._blockWorkData.Clear();

            // 新しいオブジェクトを生成する
            BlockWorkData blockWorkData;

            foreach(string m in _webframe.ListFsecData.Keys)
            {
                if (!_webframe.ListMemberData.ContainsKey(m)) continue;
                var member = _webframe.ListFsecData[m];

                // 注)インデックスの1番目からスタート
                // 　 インデックスの0番目のデータは、1番目のBlock のi端として使うので
                int j = 0;
                foreach(int i in member.Keys)
                {
                    j++;
                    if (j == 1) continue;
                    var Fsec = member[i];
                    //曲げ、せん断で使う PrefabFsecBlock1 を部材分割数分生成
                    string MS_id = string.Format("{0}/{1}/MS", i, m);
                    blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                    base.InitBlock(ref blockWorkData, i, MS_id);
                    base._blockWorkData.Add(MS_id, blockWorkData);

                    //軸力、ねじりで使う PrefabFsecBlock2 を部材分割数分生成
                    string NT_id = string.Format("{0}/{1}/NT", i, m);
                    blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[1]) };
                    base.InitBlock(ref blockWorkData, i, NT_id);
                    base._blockWorkData.Add(NT_id, blockWorkData);
                }
            }
        }
        catch (Exception e)
        {
            Debug.Log("MemberDispManager CreateMembers" + e.Message);
        }
    }

    /// <summary>
    /// 
    /// </summary>
    public override void SetBlockStatus(string id)
    {
        if (!base._blockWorkData.ContainsKey(id))
            return;

        BlockWorkData blockWorkData = base._blockWorkData[id];

        // id から情報を得る
        string[] idList = id.Split('/');
        int i = ComonFunctions.ConvertToInt(idList[0]);
        string m = idList[1];
        string direction = idList[2];

        // 節点が有効かどうか調べる
        FrameWeb.MemberData memberData = _webframe.ListMemberData[m];

        string nodeI = memberData.ni;
        string nodeJ = memberData.nj;

        float member_length = 0.0f;

        PartsDispStatus partsDispStatus;
        partsDispStatus.id = id;
        partsDispStatus.enable = _webframe.GetNodeLength(nodeI, nodeJ, out member_length);

        switch (this._dispType)
        {
            case DispType.fx:
            case DispType.mx:
                if (direction == "NT")
                    partsDispStatus.enable = (partsDispStatus.enable) ? true : false;
                else
                    partsDispStatus.enable = false;
                break;
            case DispType.fy:
            case DispType.fz:
            case DispType.my:
            case DispType.mz:
                if (direction == "MS")
                    partsDispStatus.enable = (partsDispStatus.enable) ? true : false;
                else
                    partsDispStatus.enable = false;

                break;
        }
        if (base.SetBlockStatusCommon(partsDispStatus) == false)
        {
            return;
        }

        //	表示に必要なパラメータを用意する
        SortedDictionary<int,FrameWeb.FsecData> mFsec = _webframe.ListFsecData[m];
 
        FrameWeb.FsecData iFsec = mFsec[i-1];
        FrameWeb.FsecData jFsec = mFsec[i];
        float P1 = 0f, P2 = 0f;
        switch (this._dispType)
        {
            case DispType.fx:
                P1 = _webframe.FsecBlockScale(iFsec.fx, "N");
                P2 = _webframe.FsecBlockScale(jFsec.fx, "N");
                break;
            case DispType.fy:
                P1 = _webframe.FsecBlockScale(iFsec.fy, "S");
                P2 = _webframe.FsecBlockScale(jFsec.fy, "S");
                break;
            case DispType.fz:
                P1 = _webframe.FsecBlockScale(iFsec.fz, "S");
                P2 = _webframe.FsecBlockScale(jFsec.fz, "S");
                break;
            case DispType.mx:
                P1 = _webframe.FsecBlockScale(iFsec.mx, "T");
                P2 = _webframe.FsecBlockScale(jFsec.mx, "T");
                break;
            case DispType.my:
                P1 = _webframe.FsecBlockScale(iFsec.my, "M");
                P2 = _webframe.FsecBlockScale(jFsec.my, "M");
                break;
            case DispType.mz:
                P1 = _webframe.FsecBlockScale(iFsec.mz, "M");
                P2 = _webframe.FsecBlockScale(jFsec.mz, "M");
                break;
        }

        Vector3 pos_i = _webframe.listNodePoint[nodeI];
        Vector3 pos_j = _webframe.listNodePoint[nodeJ];

        Vector3 pos_1 = Vector3.Lerp(pos_i, pos_j, (float)iFsec.L / member_length);
        Vector3 pos_2 = Vector3.Lerp(pos_i, pos_j, (float)jFsec.L / member_length);

        float length = Vector3.Distance(pos_1, pos_2);

        // 位置を設定する
        blockWorkData.rootBlockTransform.position = pos_1;
        blockWorkData.rootBlockTransform.LookAt(pos_j);

        // 幅と長さを設定する
        float aP1 = Mathf.Abs(P1), aP2 = Mathf.Abs(P2);
        float MaxValue = (aP1 > aP2) ? P1 : P2;

        Vector3 scale;
        switch (this._dispType)
        {
            case DispType.fy:
            case DispType.fz:
            case DispType.my:
            case DispType.mz:
                //メッシュを編集する
                List<Vector3> vertextList = new List<Vector3>();
                blockWorkData.mesh.GetVertices(vertextList);
                Vector3 vertext;
                //P1側
                vertext = vertextList[3];
                vertext.x = aP1;
                vertextList[3] = vertext;
                //P2側
                vertext = vertextList[1];
                vertext.x = aP2;
                vertextList[1] = vertext;
                blockWorkData.mesh.SetVertices(vertextList);

                // 幅と長さを設定する
                scale = new Vector3(1, 1, length);
                blockWorkData.rootBlockTransform.localScale = scale;
                break;

            default:
                // 幅と長さを設定する
                MaxValue = Mathf.Abs(MaxValue);
                scale = new Vector3(MaxValue, MaxValue, length);
                blockWorkData.rootBlockTransform.localScale = scale;
                break;
        }

        // 向き(回転)を設定する
        Transform member;
        Vector3 parts;
        Quaternion rotate;
        switch (this._dispType)
        {
            case DispType.fy:
            case DispType.my:
                member = blockWorkData.rootBlockTransform.transform;
                parts = member.right;
                rotate = Quaternion.LookRotation(pos_j - pos_i, parts);
                blockWorkData.rootBlockTransform.rotation = rotate;
                break;
            case DispType.fz:
            case DispType.mz:
                // 向き(回転)を設定する
                member = blockWorkData.rootBlockTransform.transform;
                parts = member.forward;
                rotate = Quaternion.LookRotation(pos_j - pos_i, parts);
                blockWorkData.rootBlockTransform.rotation = rotate;
                break;
            default:
                break;
        }
        //	色の指定
        Color color = s_noSelectColor;
        base.SetPartsColor(id, color);
    }

    public void ChangeDispMode(DispType dispType)
    {
        if (_dispType == dispType)
        {
            return;
        }

        _dispType = dispType;
        SetBlockStatusAll();
    }


    public override void ChangeTypeNo(int TypeNo)
    {
        _webframe.FsecType = TypeNo;
    }

    /// <summary>JSに選択アイテムの変更を通知する </summary>
    public override void SendSelectChengeMessage(int row)
    {
        ExternalConnect.SendAngularSelectItemChenge(row);
    }


}
