using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;

public class FixNodeDispManager : PartsDispManager
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
            foreach (int i in _webframe.ListFixNode.Keys)
            {
                FrameWeb.FixNodeData fn = _webframe.ListFixNode[i];
                if (!_webframe.listNodePoint.ContainsKey(fn.n)) continue;
                Vector3 nodeData = _webframe.listNodePoint[fn.n];

                var tmp = fn.Clone();
                foreach (var target in new string[] { "xy", "zy", "xz" })
                {
                    double Tx = 0, Ty = 0, Rz = 0;
                    switch (target)
                    {
                        case "xy":
                            Ty = tmp.ty;
                            Tx = tmp.tx;
                            Rz = tmp.rz;
                            tmp.ty = 0;
                            tmp.tx = 0;
                            tmp.rz = 0;
                            break;
                        case "zy":
                            Ty = tmp.ty;
                            Tx = tmp.tz;
                            Rz = tmp.rx;
                            tmp.ty = 0;
                            tmp.tz = 0;
                            tmp.rx = 0;
                            break;
                        case "xz":
                            Ty = tmp.tz;
                            Tx = tmp.tx;
                            Rz = tmp.ry;
                            tmp.tz = 0;
                            tmp.tx = 0;
                            tmp.ry = 0;
                            break;
                    }
                    if (Ty == 1 && Tx == 1 && Rz == 1)
                    {// 固定(fix)支点を描く条件
                        string id = i.ToString() + "fix" + target; // これから作成するブロックの id
                        BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[4]) };
                        if (!this.CreateFixNodeParts(i, id, nodeData, ref blockWorkData)) continue;
                        this.AddWorkData(id, blockWorkData);
                    }
                    else if (Ty == 1 && Tx == 1 && Rz == 0)
                    {// ピン(pin)支点を描く条件
                        string id = i.ToString() + "pin" + target; // これから作成するブロックの id
                        BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[1]) };
                        if (!this.CreateFixNodeParts(i, id, nodeData, ref blockWorkData)) continue;
                        this.AddWorkData(id, blockWorkData);
                    }
                    else if (Rz == 1 && (Ty != 1 || Tx != 1))
                    {// 回転固定(fixR)支点を描く条件
                        string id = i.ToString() + "fixR" + target; // これから作成するブロックの id
                        BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[3]) };
                        if (!this.CreateFixNodeParts(i, id, nodeData, ref blockWorkData)) continue;
                        this.AddWorkData(id, blockWorkData);
                    }
                    else if (Tx == 1 && (Ty != 1 || Rz != 1))
                    {// ローラー(roller)支点を描く条件
                        string id = i.ToString() + "rollerX" + target; // これから作成するブロックの id
                        BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                        if (!this.CreateFixNodeParts(i, id, nodeData, ref blockWorkData)) continue;
                        this.AddWorkData(id, blockWorkData);
                    }
                    else if (Ty == 1 && (Tx != 1 || Rz != 1))
                    {// ローラー(roller)支点を描く条件
                        string id = i.ToString() + "rollerY" + target; // これから作成するブロックの id
                        BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                        if (!this.CreateFixNodeParts(i, id, nodeData, ref blockWorkData, 90f)) continue;
                        this.AddWorkData(id, blockWorkData);
                    }
                    else if (Ty == 0 && Tx == 1 && Rz == 1)
                    {// 回転ローラー(fixR_roller)支点を描く条件
                        string id = i.ToString() + "fixR_rollerY" + target; // これから作成するブロックの id
                        BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[2]) };
                        if (!this.CreateFixNodeParts(i, id, nodeData, ref blockWorkData)) continue;
                        this.AddWorkData(id, blockWorkData);
                    }
                    else if (Ty == 1 && Tx == 0 && Rz == 1)
                    {// 回転ローラー(fixR_roller)支点を描く条件
                        string id = i.ToString() + "fixR_rollerX" + target; // これから作成するブロックの id
                        BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[2]) };
                        if (!this.CreateFixNodeParts(i, id, nodeData, ref blockWorkData, 90f)) continue;
                        this.AddWorkData(id, blockWorkData);
                    }

                    if (Tx != 0 && Tx != 1)
                    {// 鉛直バネ(spring)を描く条件
                        string id = i.ToString() + "springX" + target; // これから作成するブロックの id
                        BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[5]) };
                        if (!this.CreateFixNodeParts(i, id, nodeData, ref blockWorkData, 90f)) continue;
                        this.AddWorkData(id, blockWorkData);
                    }
                    if (Ty != 0 && Ty != 1)
                    {// 鉛直バネ(spring)を描く条件
                        string id = i.ToString() + "springY" + target; // これから作成するブロックの id
                        BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[5]) };
                        if (!this.CreateFixNodeParts(i, id, nodeData, ref blockWorkData)) continue;
                        this.AddWorkData(id, blockWorkData);
                    }
                    if (Rz != 0 && Rz != 1)
                    {// 回転バネ(springR)を描く条件
                        string id = i.ToString() + "springR" + target; // これから作成するブロックの id
                        BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[6]) };
                        if (!this.CreateFixNodeParts(i, id, nodeData, ref blockWorkData)) continue;
                        this.AddWorkData(id, blockWorkData);
                    }
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
    private bool CreateFixNodeParts(int i, string id, Vector3 position, ref BlockWorkData blockWorkData, float rotate90=0)
    {
        base.InitBlock(ref blockWorkData, i, id);

        //	幅と高さを設定する
        Vector3 scale = new Vector3(_webframe.FixNodeBlockScale, _webframe.FixNodeBlockScale, _webframe.FixNodeBlockScale);
        Quaternion rotate = Quaternion.Euler(0f, 0f, rotate90);
        if (id.IndexOf("zy") >= 0)
            rotate = Quaternion.Euler(90f, 0f, 0f); 
        else if (id.IndexOf("xz") >= 0)
            rotate = Quaternion.Euler(0f, 90f, 0f);

        //	姿勢を設定
        blockWorkData.rootBlockTransform.position = position;
        blockWorkData.rootBlockTransform.rotation = rotate;
        blockWorkData.rootBlockTransform.localScale = scale;

        //	色の指定
        Color color = s_noSelectColor;
        blockWorkData.materialPropertyBlock.SetColor("_Color", color);
        blockWorkData.renderer.SetPropertyBlock(blockWorkData.materialPropertyBlock);

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
        foreach (string j in _blockWorkData.Keys)
        {
            var target = _blockWorkData[j];

            if (target.blockData.id == i)
            {
                SetPartsColor(j, s_selectColor);
            }
            else
            {
                SetPartsColor(j, s_noSelectColor);
            }
        }
    }

}
