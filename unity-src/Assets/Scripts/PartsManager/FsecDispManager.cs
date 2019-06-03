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
    public override void ChangeTypeNo(int TypeNo)
    {
        _webframe.FsecType = TypeNo;
    }

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
                for (int i = 1; i < member.Count - 1; i++) // インデックスの1番目からスタート
                {
                    var Fsec = member[i];
                    if(Math.Abs(Fsec.fx) > 0)
                    {
                        string id = string.Format("{0}/{1}/fx", i, m);
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[1]) };
                        base.InitBlock(ref blockWorkData, i, id);
                        base._blockWorkData.Add(id, blockWorkData);
                    }
                    if (Math.Abs(Fsec.fy) > 0)
                    {
                        string id = string.Format("{0}/{1}/fy", i, m);
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                        base.InitBlock(ref blockWorkData, i, id);
                        base._blockWorkData.Add(id, blockWorkData);
                    }
                    if (Math.Abs(Fsec.fz) > 0)
                    {
                        string id = string.Format("{0}/{1}/fz", i, m);
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                        base.InitBlock(ref blockWorkData, i, id);
                        base._blockWorkData.Add(id, blockWorkData);
                    }
                    if (Math.Abs(Fsec.mx) > 0)
                    {
                        string id = string.Format("{0}/{1}/mx", i, m);
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[1]) };
                        base.InitBlock(ref blockWorkData, i, id);
                        base._blockWorkData.Add(id, blockWorkData);
                    }
                    if (Math.Abs(Fsec.my) > 0)
                    {
                        string id = string.Format("{0}/{1}/my", i, m);
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                        base.InitBlock(ref blockWorkData, i, id);
                        base._blockWorkData.Add(id, blockWorkData);
                    }
                    if (Math.Abs(Fsec.mz) > 0)
                    {
                        string id = string.Format("{0}/{1}/mz", i, m);
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                        base.InitBlock(ref blockWorkData, i, id);
                        base._blockWorkData.Add(id, blockWorkData);
                    }
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

        if (base.SetBlockStatusCommon(partsDispStatus) == false)
        {
            return;
        }

        //	表示に必要なパラメータを用意する
        var mFsec = _webframe.ListFsecData[m];
        FrameWeb.FsecData iFsec = mFsec[i-1];
        FrameWeb.FsecData jFsec = mFsec[i];
        float P1 = 0f, P2 = 0f;
        switch (direction)
        {
            case "fx":
                P1 = _webframe.FsecBlockScale(iFsec.fx, "N");
                P2 = _webframe.FsecBlockScale(jFsec.fx, "N");
                break;
            case "fy":
                P1 = _webframe.FsecBlockScale(iFsec.fy, "S");
                P2 = _webframe.FsecBlockScale(jFsec.fy, "S");
                break;
            case "fz":
                P1 = _webframe.FsecBlockScale(iFsec.fz, "S");
                P2 = _webframe.FsecBlockScale(jFsec.fz, "S");
                break;
            case "mx":
                P1 = _webframe.FsecBlockScale(iFsec.mx, "T");
                P2 = _webframe.FsecBlockScale(jFsec.mx, "T");
                break;
            case "my":
                P1 = _webframe.FsecBlockScale(iFsec.my, "M");
                P2 = _webframe.FsecBlockScale(jFsec.my, "M");
                break;
            case "mz":
                P1 = _webframe.FsecBlockScale(iFsec.mz, "M");
                P2 = _webframe.FsecBlockScale(jFsec.mz, "M");
                break;
        }

        BlockWorkData blockWorkData = base._blockWorkData[id];

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
        switch (direction)
        {
            case "fy":
            case "my":
            case "fz":
            case "mz":
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
        switch (direction)
        {
            case "fy":
            case "my":
                member = blockWorkData.rootBlockTransform.transform;
                parts = member.right;
                rotate = Quaternion.LookRotation(pos_j - pos_i, parts);
                blockWorkData.rootBlockTransform.rotation = rotate;
                break;
            case "fz":
            case "mz":
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

    
    /// <summary>JSに選択アイテムの変更を通知する </summary>
    public override void SendSelectChengeMessage(int row)
    {
        ExternalConnect.SendAngularSelectItemChenge(row);
    }


}
