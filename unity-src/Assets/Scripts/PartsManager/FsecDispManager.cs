using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;
using UnityEngine;


/// <summary>
/// 荷重（ノード）の表示を管理するクラス
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

                foreach (var Fsec in _webframe.ListFsecData[m])
                {
                    int i = Fsec.Key;
                    if(Fsec.Value.fx > 0)
                    {
                        string id = string.Format("{0}/{1}/fx", i, m);
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[1]) };
                        base.InitBlock(ref blockWorkData, i, id);
                        base._blockWorkData.Add(id, blockWorkData);
                    }
                    if (Fsec.Value.fy > 0)
                    {
                        string id = string.Format("{0}/{1}/fy", i, m);
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                        base.InitBlock(ref blockWorkData, i, id);
                        base._blockWorkData.Add(id, blockWorkData);
                    }
                    if (Fsec.Value.fz > 0)
                    {
                        string id = string.Format("{0}/{1}/fz", i, m);
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                        base.InitBlock(ref blockWorkData, i, id);
                        base._blockWorkData.Add(id, blockWorkData);
                    }
                    if (Fsec.Value.mx > 0)
                    {
                        string id = string.Format("{0}/{1}/mx", i, m);
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[1]) };
                        base.InitBlock(ref blockWorkData, i, id);
                        base._blockWorkData.Add(id, blockWorkData);
                    }
                    if (Fsec.Value.my > 0)
                    {
                        string id = string.Format("{0}/{1}/my", i, m);
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                        base.InitBlock(ref blockWorkData, i, id);
                        base._blockWorkData.Add(id, blockWorkData);
                    }
                    if (Fsec.Value.mz > 0)
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

        string[] idList = id.Split('/');
        int i = ComonFunctions.ConvertToInt(idList[0]);
        string m = idList[1];
        string direction = idList[2];

        FrameWeb.MemberData memberData = _webframe.ListMemberData[m];

        // 節点が有効かどうか調べる
        string nodeI = memberData.ni;
        string nodeJ = memberData.nj;

        float length = 0.0f;

        PartsDispStatus partsDispStatus;
        partsDispStatus.id = id;
        partsDispStatus.enable = _webframe.GetNodeLength(nodeI, nodeJ, out length);

        if (base.SetBlockStatusCommon(partsDispStatus) == false)
        {
            return;
        }

        //	表示に必要なパラメータを用意する
        Vector3 pos_i = _webframe.listNodePoint[nodeI];
        Vector3 pos_j = _webframe.listNodePoint[nodeJ];

        Vector3 pos_1 = Vector3.Lerp(pos_i, pos_j, (float)lm.L1 / member_length);
        Vector3 pos_2 = Vector3.Lerp(pos_i, pos_j, (member_length - (float)lm.L2) / member_length);

        float length = Vector3.Distance(pos_1, pos_2);
        float P1 = _webframe.LoadBlockScale(lm.P1, "W");
        float P2 = _webframe.LoadBlockScale(lm.P2, "W");

        // 位置を設定する
        blockWorkData.rootBlockTransform.position = pos_1;
        blockWorkData.rootBlockTransform.LookAt(pos_j);

        //メッシュを編集する
        float MaxValue = Math.Max(P1, P2);
        if (P1 < P2)
        {
            List<Vector3> vertextList = new List<Vector3>();
            blockWorkData.mesh.GetVertices(vertextList);
            Vector3 vertext = vertextList[1];
            vertext.x *= P1 / P2;
            vertextList[1] = vertext;
            blockWorkData.mesh.SetVertices(vertextList);
        }
        else if (P1 > P2)
        {
            List<Vector3> vertextList = new List<Vector3>();
            blockWorkData.mesh.GetVertices(vertextList);
            Vector3 vertext = vertextList[3];
            vertext.x *= P2 / P1;
            vertextList[3] = vertext;
            blockWorkData.mesh.SetVertices(vertextList);
        }

        // 幅と長さを設定する
        Vector3 scale = new Vector3(MaxValue, 1, length);
        blockWorkData.rootBlockTransform.localScale = scale;


        switch (direction)
        {
            case "fx":
                // 向き(回転)を設定する
                Transform member = blockWorkData.rootBlockTransform.transform;
                Vector3 parts = member.up;
                Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i, parts);
                blockWorkData.rootBlockTransform.rotation = rotate;

                break;
            case "fy":

                break;
            case "fz":

                break;
            case "mx":

                break;
            case "my":

                break;
            case "mz":

                break;
            default:
                return;
        }

        //	色の指定
        Color color = s_noSelectColor;
        base.SetPartsColor(id, color);
    }


    private bool SetTxBlockStatus(string id, ref BlockWorkData blockWorkData, FrameWeb.LoadMemberData lm)
    {
        // 要素座標を取得
        FrameWeb.MemberData memberData = _webframe.ListMemberData[lm.m];

        // 節点が有効なら作成する
        float member_length = 0.0f;
        if (!_webframe.GetNodeLength(memberData.ni, memberData.nj, out member_length)) return false;
        base.InitBlock(ref blockWorkData, lm.row, id);

        // 位置を決定する
        Vector3 pos_i = _webframe.listNodePoint[memberData.ni];
        Vector3 pos_j = _webframe.listNodePoint[memberData.nj];

        Vector3 pos_1 = Vector3.Lerp(pos_i, pos_j, (float)lm.L1 / member_length);
        Vector3 pos_2 = Vector3.Lerp(pos_i, pos_j, (member_length - (float)lm.L2) / member_length);

        float length = Vector3.Distance(pos_1, pos_2);
        float P1 = _webframe.LoadBlockScale(lm.P1, "W");
        float P2 = _webframe.LoadBlockScale(lm.P2, "W");

        // 位置を設定する
        blockWorkData.rootBlockTransform.position = pos_1;
        blockWorkData.rootBlockTransform.LookAt(pos_j);

        //メッシュを編集する
        float MaxValue = Math.Max(P1, P2);
        if (P1 < P2)
        {
            List<Vector3> vertextList = new List<Vector3>();
            blockWorkData.mesh.GetVertices(vertextList);
            Vector3 vertext = vertextList[1];
            vertext.x *= P1 / P2;
            vertextList[1] = vertext;
            blockWorkData.mesh.SetVertices(vertextList);
        }
        else if (P1 > P2)
        {
            List<Vector3> vertextList = new List<Vector3>();
            blockWorkData.mesh.GetVertices(vertextList);
            Vector3 vertext = vertextList[3];
            vertext.x *= P2 / P1;
            vertextList[3] = vertext;
            blockWorkData.mesh.SetVertices(vertextList);
        }

        // 幅と長さを設定する
        Vector3 scale = new Vector3(MaxValue, 1, length);
        blockWorkData.rootBlockTransform.localScale = scale;

        // 画像のタイリング
        float Tiling = Mathf.Floor(length / MaxValue);
        blockWorkData.renderer.material.mainTextureScale = new Vector2(1, Tiling);

        // 向き(回転)を設定する
        Transform member = blockWorkData.rootBlockTransform.transform;
        Vector3 parts = member.up;
        Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i, parts);
        blockWorkData.rootBlockTransform.rotation = rotate;

        return true;
    }

    private bool SetTyzBlockStatus(string id, ref BlockWorkData blockWorkData, FrameWeb.LoadMemberData lm)
    {
        // 要素座標を取得
        if (!_webframe.ListMemberData.ContainsKey(lm.m)) return false;
        FrameWeb.MemberData memberData = _webframe.ListMemberData[lm.m];

        // 節点が有効なら作成する
        float member_length = 0.0f;
        if (!_webframe.GetNodeLength(memberData.ni, memberData.nj, out member_length)) return false;
        base.InitBlock(ref blockWorkData, lm.row, id);

        // 位置を決定する
        Vector3 pos_i = _webframe.listNodePoint[memberData.ni];
        Vector3 pos_j = _webframe.listNodePoint[memberData.nj];

        Vector3 pos_1 = Vector3.Lerp(pos_i, pos_j, (float)lm.L1 / member_length);
        Vector3 pos_2 = Vector3.Lerp(pos_i, pos_j, (member_length - (float)lm.L2) / member_length);

        float length = Vector3.Distance(pos_1, pos_2);
        float P1 = _webframe.LoadBlockScale(lm.P1, "W");
        float P2 = _webframe.LoadBlockScale(lm.P2, "W");

        // 位置を設定する
        blockWorkData.rootBlockTransform.position = pos_1;
        blockWorkData.rootBlockTransform.LookAt(pos_j);

        //メッシュを編集する
        float MaxValue = Math.Max(P1, P2);
        if (P1 < P2)
        {
            List<Vector3> vertextList = new List<Vector3>();
            blockWorkData.mesh.GetVertices(vertextList);
            Vector3 vertext = vertextList[1];
            vertext.x *= P1 / P2;
            vertextList[1] = vertext;
            blockWorkData.mesh.SetVertices(vertextList);
        }
        else if (P1 > P2)
        {
            List<Vector3> vertextList = new List<Vector3>();
            blockWorkData.mesh.GetVertices(vertextList);
            Vector3 vertext = vertextList[3];
            vertext.x *= P2 / P1;
            vertextList[3] = vertext;
            blockWorkData.mesh.SetVertices(vertextList);
        }

        // 幅と長さを設定する
        Vector3 scale = new Vector3(MaxValue, 1, length);
        blockWorkData.rootBlockTransform.localScale = scale;

        // 画像のタイリング
        float Tiling = Mathf.Floor(length / MaxValue);
        blockWorkData.renderer.material.mainTextureScale = new Vector2(1, Tiling);

        // 向き(回転)を設定する
        Transform member = blockWorkData.rootBlockTransform.transform;
        Vector3 parts = (lm.direction == "y") ? member.right : member.forward;
        Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i, parts);
        blockWorkData.rootBlockTransform.rotation = rotate;

        return true;
    }

    private bool SetTrBlockStatus(string id, ref BlockWorkData blockWorkData, FrameWeb.LoadMemberData lm)
    {
        // 要素座標を取得
        if (!_webframe.ListMemberData.ContainsKey(lm.m)) return false;
        FrameWeb.MemberData memberData = _webframe.ListMemberData[lm.m];

        // 節点が有効なら作成する
        float member_length = 0.0f;
        if (!_webframe.GetNodeLength(memberData.ni, memberData.nj, out member_length)) return false;
        base.InitBlock(ref blockWorkData, lm.row, id);

        // 位置を決定する
        Vector3 pos_i = _webframe.listNodePoint[memberData.ni];
        Vector3 pos_j = _webframe.listNodePoint[memberData.nj];

        Vector3 pos_1 = Vector3.Lerp(pos_i, pos_j, (float)lm.L1 / member_length);
        Vector3 pos_2 = Vector3.Lerp(pos_i, pos_j, (member_length - (float)lm.L2) / member_length);

        float length = Vector3.Distance(pos_1, pos_2);
        float P1 = _webframe.LoadBlockScale(lm.P1, "T");
        float P2 = _webframe.LoadBlockScale(lm.P2, "T");

        // 位置を設定する
        blockWorkData.rootBlockTransform.position = pos_1;
        blockWorkData.rootBlockTransform.LookAt(pos_j);

        //メッシュを編集する
        float MaxValue = Math.Max(P1, P2);
        if (P1 < P2)
        {
            List<Vector3> vertextList = new List<Vector3>();
            blockWorkData.mesh.GetVertices(vertextList);
            //P1側の Mesh を小さくする
            blockWorkData.mesh.SetVertices(vertextList);
        }
        else if (P1 > P2)
        {
            List<Vector3> vertextList = new List<Vector3>();
            blockWorkData.mesh.GetVertices(vertextList);
            //P2側の Mesh を小さくする
            blockWorkData.mesh.SetVertices(vertextList);
        }

        // 幅と長さを設定する
        Vector3 scale = new Vector3(MaxValue, MaxValue, length);
        blockWorkData.rootBlockTransform.localScale = scale;

        // 画像のタイリング
        float Tiling = Mathf.Floor(length / MaxValue);
        blockWorkData.renderer.material.mainTextureScale = new Vector2(1, Tiling);

        return true;
    }

    #endregion

    private void AddWorkData(string id, BlockWorkData blockWorkData)
    {
        base._blockWorkData.Add(id, blockWorkData);

        PartsDispStatus partsDispStatus;
        partsDispStatus.id = id;
        partsDispStatus.enable = true;

        if (base.SetBlockStatusCommon(partsDispStatus) == false)
        {
            return;
        }
    }

    /// <summary>JSに選択アイテムの変更を通知する </summary>
    public override void SendSelectChengeMessage(int row)
    {
        ExternalConnect.SendAngularSelectItemChenge(row);
    }


}
