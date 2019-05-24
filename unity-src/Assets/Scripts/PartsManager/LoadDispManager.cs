using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


/// <summary>
/// 荷重（ノード）の表示を管理するクラス
/// </summary>
public class LoadDispManager : PartsDispManager
{
    public override void CreateParts()
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
    }

    /// <summary>
    /// パーツを作成する
    /// </summary>
    /// <remarks>
    /// データの状況によって 生成するパーツの 個数が変わる本DispManbager は
    /// CreateParts ではなく SetBlockStatusAll でパーツの生成を行う
    /// </remarks>
    public override void SetBlockStatusAll()
    {
        try
        {
            this.SetLoadMemberBlockStatus();
            this.SetLoadNodeBlockStatus();
        }
        catch (Exception e)
        {
            Debug.Log("FixMemberDispManager CreateMembers" + e.Message);
        }
    }

    #region 節点荷重の新しいオブジェクトを生成する

    private void SetLoadNodeBlockStatus()
    {
        FrameWeb.LoadData ListLoadData = _webframe.ListLoadData;

        for (int i = 0; i < ListLoadData.load_node.Count; i++)
        {
            FrameWeb.LoadNodeData ln = ListLoadData.load_node[i];
            var tLoads = new Dictionary<string, double> { { "tx", ln.tx }, { "ty", ln.ty }, { "tz", ln.tz } };
            foreach (var key in tLoads.Keys)
            {
                double value = tLoads[key];
                if (value == 0) continue;
                if (!_webframe.listNodePoint.ContainsKey(ln.n)) continue;
                string id = string.Format("{0}:{1}-{2}-{3}", i, ln.row, ln.n, key);// これから作成するブロックの id




            }



        }
    }

    #endregion

    #region 要素荷重の新しいオブジェクトを生成する

    private void SetLoadMemberBlockStatus()
    {
        FrameWeb.LoadData ListLoadData = _webframe.ListLoadData;

        for (int i = 0; i < ListLoadData.load_member.Count; i++)
        {
            FrameWeb.LoadMemberData lm = ListLoadData.load_member[i];
            if (lm.P1 == 0 && lm.P2 == 0) continue;

            if (!_webframe.ListMemberData.ContainsKey(lm.m)) continue;
            FrameWeb.MemberData memberData = _webframe.ListMemberData[lm.m];

            string id = string.Format("{0}:{1}-{2}-{3}-{4}", i, lm.row, lm.m, lm.mark, lm.direction);// これから作成するブロックの id
            BlockWorkData blockWorkData;
            if (lm.mark == 2)
            {// 分布荷重
                switch (lm.direction)
                {
                    case "x":
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[3]) };
                        if (!this.SetTxBlockStatus(id, ref blockWorkData, lm)) continue;
                        this.AddWorkData(id, blockWorkData);
                        break;
                    case "y":
                    case "z":
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[2]) };
                        if (!this.SetTyzBlockStatus(id, ref blockWorkData, lm)) continue;
                        this.AddWorkData(id, blockWorkData);
                        break;
                    case "r":
                        blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[4]) };
                        if (!this.SetTrBlockStatus(id, ref blockWorkData, lm)) continue;
                        this.AddWorkData(id, blockWorkData);
                        break;
                    case "gx":
                    case "gy":
                    case "gz":
                    default:
                        Console.Write(string.Format("{0}は、まだ作ってない", lm.direction));
                        continue;
                }
            }
            else if (lm.mark == 1)
            {// 集中荷重

            }
            else if (lm.mark == 11)
            {// 集中回転荷重

            }
            else if (lm.mark == 9)
            {// 温度荷重

            }
        }
    }

    private bool SetTxBlockStatus(string id, ref BlockWorkData blockWorkData, FrameWeb.LoadMemberData lm)
    {
        // 要素が有効か調べる
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
        Vector3 parts = member.up;
        Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i, parts);
        blockWorkData.rootBlockTransform.rotation = rotate;

        return true;
    }

    private bool SetTyzBlockStatus(string id, ref BlockWorkData blockWorkData, FrameWeb.LoadMemberData lm)
    {
        // 要素が有効か調べる
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
        // 要素が有効か調べる
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
