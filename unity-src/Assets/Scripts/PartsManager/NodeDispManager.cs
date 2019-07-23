using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;

public class NodeDispManager : PartsDispManager
{
    public enum DispType
    {
        Block,
        Dot,
        Disg
    }

    private DispType _dispType = DispType.Dot;

    /// <summary>
    /// パーツを作成する
    /// </summary>
    public override void CreateParts()
    {
        try
        {
            BlockWorkData blockWorkData;

            // データに無いブロックは消す
            List<string> DeleteKeys = new List<string>();
            foreach (string id in base._blockWorkData.Keys)
            {
                if (!_webframe.listNodePoint.ContainsKey(id))
                    DeleteKeys.Add(id);
            }


            // 前のオブジェクトを消す
            foreach (string id in DeleteKeys)
            {
                try
                {
                    Destroy(base._blockWorkData[id].renderer.sharedMaterial);
                    Destroy(base._blockWorkData[id].gameObject);
                    base._blockWorkData.Remove(id);
                }
                catch { }
            }


            // 新しいオブジェクトを生成する
            foreach (string id in _webframe.listNodePoint.Keys)
            {
                if (!base._blockWorkData.ContainsKey(id))
                {
                    int i = ComonFunctions.ConvertToInt(id);
                    blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                    base.InitBlock(ref blockWorkData, i, id);
                    base._blockWorkData.Add(id, blockWorkData);
                }
            }

        }
        catch (Exception e)
        {
            Debug.Log("NodeDispManager CreateNodes" + e.Message);
        }
    }


    /// <summary>JSに選択アイテムの変更を通知する </summary>
    public override void SendSelectChengeMessage(int row)
    {
        ExternalConnect.SendAngularSelectItemChenge(row);
    }

    /// <summary> ブロックの色を変更 </summary>
    public override void ChengeForcuseBlock(int i)
    {
        base.ChengeForcuseBlock(i.ToString());
    }


    /// <summary> ブロックのステータスを変更 </summary>
    public override void SetBlockStatus(string id)
    {
        if (!base._blockWorkData.ContainsKey(id))
            return;

        Vector3 nodePoint = _webframe.listNodePoint[id];

        PartsDispManager.PartsDispStatus partsDispStatus;

        partsDispStatus.id = id;
        partsDispStatus.enable = true;

        if (base.SetBlockStatusCommon(partsDispStatus) == false)
        {
            return;
        }

        //	表示に必要なパラメータを用意する
        BlockWorkData blockWorkData = base._blockWorkData[id];

        //	姿勢を設定
        if(_dispType == DispType.Disg)
        {
            FrameWeb.DisgData disg = _webframe.ListDisgData[id];
            nodePoint.x += _webframe.DisgScale(disg.dx);
            nodePoint.y += _webframe.DisgScale(disg.dy);
            nodePoint.z += _webframe.DisgScale(disg.dz);
        }

        blockWorkData.gameObjectTransform.position = nodePoint;
        blockWorkData.gameObjectTransform.localScale = _webframe.NodeBlockScale;

        //	色の指定
        Color color = (_dispType != DispType.Dot) ? s_noSelectColor : s_lineTypeBlockColor;
        base.SetPartsColor(id, color);

    }

    /// <summary>
    /// 
    /// </summary>
    public override void InputMouse()
    {
        if (_dispType != DispType.Dot)
        {
            base.InputMouse();
        }
    }

    /// <summary>
    /// 
    /// </summary>
    /// <param name="dispType"></param>
    public void ChangeDispMode(DispType dispType)
    {
        if (_dispType == dispType)
        {
            return;
        }

        _dispType = dispType;
        SetBlockStatusAll();
    }
}
