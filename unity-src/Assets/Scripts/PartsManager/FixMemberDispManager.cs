using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;
using UnityEngine;

/// <summary>
/// バネの表示を管理するクラス
/// </summary>
public class FixMemberDispManager : PartsDispManager
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
            // 新しいオブジェクトを生成する
            foreach (int i in _webframe.ListFixMember.Keys)
            {
                FrameWeb.FixMemberData fm = _webframe.ListFixMember[i];
                if (!_webframe.ListMemberData.ContainsKey(fm.m)) continue;
                FrameWeb.MemberData memberData = _webframe.ListMemberData[fm.m];

                if (fm.tx > 0)
                {
                    string id = i.ToString() + "tx"; // これから作成するブロックの id
                    BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                    if (!this.CreateFixMemberParts(i, id, memberData, ref blockWorkData)) continue;
                    if (!this.SetTxBlockStatus(ref blockWorkData, memberData, fm.tx)) continue;
                    this.AddWorkData(id, blockWorkData);
                }
                if (fm.ty > 0)
                {
                    string id = i.ToString() + "ty"; // これから作成するブロックの id
                    BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[1]) };
                    if (!this.CreateFixMemberParts(i, id, memberData, ref blockWorkData)) continue;
                    if (!this.SetTyBlockStatus(ref blockWorkData, memberData, fm.ty)) continue;
                    this.AddWorkData(id, blockWorkData);
                }
                if (fm.tz > 0)
                {
                    string id = i.ToString() + "tz"; // これから作成するブロックの id
                    BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[1]) };
                    if (!this.CreateFixMemberParts(i, id, memberData, ref blockWorkData)) continue;
                    if (!this.SetTzBlockStatus(ref blockWorkData, memberData, fm.tz)) continue;
                    this.AddWorkData(id, blockWorkData);
                }
                if (fm.tr > 0)
                {
                    string id = i.ToString() + "tr"; // これから作成するブロックの id
                    BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[2]) };
                    if (!this.CreateFixMemberParts(i, id, memberData, ref blockWorkData)) continue;
                    if (!this.SetTrBlockStatus(ref blockWorkData, memberData, fm.tr)) continue;
                    this.AddWorkData(id, blockWorkData);
                }
            }
        }
        catch (Exception e)
        {
            Debug.Log("FixMemberDispManager CreateMembers" + e.Message);
        }
    }

    /// <summary>
    /// 基本的な、ブロックの登録などを行う
    /// </summary>
    private bool CreateFixMemberParts(
        int i,
        string id, 
        FrameWeb.MemberData memberData,
        ref BlockWorkData blockWorkData
        )
    {
        // 節点が有効かどうか調べる
        string nodeI = memberData.ni;
        string nodeJ = memberData.nj;

        //	表示に必要なパラメータを用意する
        float length = 0.0f;
        if (!_webframe.GetNodeLength(nodeI, nodeJ, out length)) 
        {
            return false;
        }
        Vector3 pos_i = _webframe.listNodePoint[nodeI];
        Vector3 pos_j = _webframe.listNodePoint[nodeJ];

        base.InitBlock(ref blockWorkData, i, id);

        //	幅と高さを設定する
        Vector3 scale = new Vector3(1, 1, length);
        Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i);

        //	姿勢を設定
        blockWorkData.rootBlockTransform.position = pos_i;
        blockWorkData.rootBlockTransform.LookAt(pos_j);
        blockWorkData.rootBlockTransform.localScale = scale;

        //	色の指定
        Color color = s_noSelectColor;
        blockWorkData.materialPropertyBlock.SetColor("_Color", color);
        blockWorkData.renderer.SetPropertyBlock(blockWorkData.materialPropertyBlock);

        //ブロックの矢印を設定する
        Vector3 arrowCenter = Vector3.Lerp(pos_i, pos_j, 0.5f);
        Vector3 arrowSize = new Vector3(length * 0.25f, length * 0.25f, length * 0.25f);
        blockWorkData.directionArrow.SetArrowDirection(arrowCenter, rotate, arrowSize);
        blockWorkData.directionArrow.EnableRenderer(true);

        return true;

    }

    private bool SetTxBlockStatus(ref BlockWorkData blockWorkData, FrameWeb.MemberData memberData, double value)
    {
        Transform part = blockWorkData.rootBlockTransform.transform;

        Vector3 pos_i = _webframe.listNodePoint[memberData.ni];
        Vector3 pos_j = _webframe.listNodePoint[memberData.nj];
        Transform member = blockWorkData.rootBlockTransform.transform;
        Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i, member.up);
        //Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i, Vector3.back);

        float L = _webframe.FixMemberBlockScale(blockWorkData.blockData.id, "tx");

        Vector3 scale = blockWorkData.rootBlockTransform.localScale;
        scale.x = L;
        scale.y = L;
        float Tiling = Mathf.Floor(scale.z / L);

        blockWorkData.renderer.material.mainTextureScale = new Vector2(1, Tiling);
        blockWorkData.rootBlockTransform.rotation = rotate;
        blockWorkData.rootBlockTransform.localScale = scale;


        return true;
    }

    private bool SetTyBlockStatus(ref BlockWorkData blockWorkData, FrameWeb.MemberData memberData, double value)
    {
        Vector3 pos_i = _webframe.listNodePoint[memberData.ni];
        Vector3 pos_j = _webframe.listNodePoint[memberData.nj];
        Transform member = blockWorkData.rootBlockTransform.transform;
        Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i, member.right);
        //Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i, Vector3.left);

        float L = _webframe.FixMemberBlockScale(blockWorkData.blockData.id, "ty");

        Vector3 scale = blockWorkData.rootBlockTransform.localScale;
        scale.x = L;
        scale.y = L;
        float Tiling = Mathf.Floor(scale.z / L);

        blockWorkData.renderer.material.mainTextureScale = new Vector2(1, Tiling);
        blockWorkData.rootBlockTransform.rotation = rotate;
        blockWorkData.rootBlockTransform.localScale = scale;


        return true;
    }

    private bool SetTzBlockStatus(ref BlockWorkData blockWorkData, FrameWeb.MemberData memberData, double value)
    {
        Vector3 pos_i = _webframe.listNodePoint[memberData.ni];
        Vector3 pos_j = _webframe.listNodePoint[memberData.nj];
        Transform member = blockWorkData.rootBlockTransform.transform;
        Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i, member.forward);
        //Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i, Vector3.forward);

        float L = _webframe.FixMemberBlockScale(blockWorkData.blockData.id, "tz");

        Vector3 scale = blockWorkData.rootBlockTransform.localScale;
        scale.x = L;
        scale.y = L;
        float Tiling = Mathf.Floor(scale.z / L);

        blockWorkData.renderer.material.mainTextureScale = new Vector2(1, Tiling);
        blockWorkData.rootBlockTransform.rotation = rotate;
        blockWorkData.rootBlockTransform.localScale = scale;

        return true;
    }

    private bool SetTrBlockStatus(ref BlockWorkData blockWorkData, FrameWeb.MemberData memberData, double value)
    {
        Vector3 pos_i = _webframe.listNodePoint[memberData.ni];
        Vector3 pos_j = _webframe.listNodePoint[memberData.nj];
        Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i);

        float L = _webframe.FixMemberBlockScale(blockWorkData.blockData.id, "tr");
        Vector3 scale = blockWorkData.rootBlockTransform.localScale;
        scale.x = L;
        scale.y = L;
        float Tiling = Mathf.Floor(scale.z / L);

        blockWorkData.renderer.material.mainTextureScale = new Vector2(1, Tiling);
        blockWorkData.rootBlockTransform.rotation = rotate;
        blockWorkData.rootBlockTransform.localScale = scale;

        return true;
    }

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
    public override void SendSelectChengeMessage(int inputID)
    {
        ExternalConnect.SendAngularSelectItemChenge(inputID);
    }

    /// <summary> ブロックの色を変更 </summary>
    public override void ChengeForcuseBlock(int i)
    {
        string id = i.ToString();
        base.ChengeForcuseBlock(id + "tx");
        base.ChengeForcuseBlock(id + "ty");
        base.ChengeForcuseBlock(id + "tz");
        base.ChengeForcuseBlock(id + "tr");
    }

}
