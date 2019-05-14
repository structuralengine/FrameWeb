using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;


public class NodeDispManager : PartsDispManager
{
    static readonly Color s_DotTypeBlockColor = Color.black;

    public enum DispType
    {
        Block,
        Dot
    }

    private DispType _dispType = DispType.Dot;

    /// <summary>
    /// パーツを作成する
    /// </summary>
    public override void CreateParts()
    {
        if (_webframe == null)
        {
            Debug.Log("NodeDispManager _webframe == null");
            return;
        }

        try
        {
            BlockWorkData blockWorkData;

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
            foreach (int i in _webframe.listNodePoint.Keys)
            {
                blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab) };
                string id = GetBlockID(i);
                base.InitBlock(ref blockWorkData, i, id);
                base._blockWorkData.Add(id, blockWorkData);
            }

        }
        catch (Exception e)
        {
            Debug.Log("NodeDispManager CreateNodes" + e.Message);
        }
    }

    /// <summary>
    /// パーツを変更する
    /// </summary>
    public override void ChengeParts()
    {
        if (_webframe == null)
        {
            Debug.Log("NodeDispManager _webframe == null");
            return;
        }

        try
        {
            BlockWorkData blockWorkData;

            // データに無いブロックは消す
            List<string> DeleteKeys = new List<string>();
            foreach (string id in base._blockWorkData.Keys)
            {
                int i = GetDataID(id);
                if (!_webframe.listNodePoint.ContainsKey(i))
                {
                    try
                    {
                        Destroy(base._blockWorkData[id].renderer.sharedMaterial);
                        Destroy(base._blockWorkData[id].gameObject);
                    }
                    catch { }
                    finally
                    {
                        DeleteKeys.Add(id);
                    }
                }
            }
            foreach (string id in DeleteKeys)
            {
                base._blockWorkData.Remove(id);
            }

            // 新しいブロックを生成する
            foreach (int i in _webframe.listNodePoint.Keys)
            {
                string id = GetBlockID(i);
                if (!base._blockWorkData.ContainsKey(id))
                {
                    // 新しいオブジェクトを生成する
                    blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab) };
                    base.InitBlock(ref blockWorkData, i, id);
                    base._blockWorkData.Add(id, blockWorkData);
                }
            }
        }
        catch (Exception e)
        {
            Debug.Log("NodeDispManager ChengeParts" + e.Message);
        }
    }


    /// <summary> ブロックのIDを取得 </summary>
    /// <param name="i"></param>
    private string GetBlockID(int i)
    {
        return "Node[" + i + "]";
    }

    /// <summary> データのIDを取得 </summary>
    /// <param name="id"></param>
    private int GetDataID(string id)
    {
        string s1 = id.Replace("Node[", "");
        string s2 = s1.Replace("]", "");
        return int.Parse(s2);
    }

    /// <summary>JSに選択アイテムの変更を通知する </summary>
    public override void SendSelectChengeMessage(int inputID)
    {
        ExternalConnect.SendAngularSelectItemChenge(inputID);
    }

    /// <summary> ブロックの色を変更 </summary>
    public override void ChengeForcuseBlock(int i)
    {
        base.ChengeForcuseBlock(this.GetBlockID(i));
    }


    /// <summary> ブロックのステータスを変更 </summary>
    public override void SetBlockStatus(string id)
    {
        if (!base._blockWorkData.ContainsKey(id))
            return;

        Vector3 nodePoint = _webframe.listNodePoint[GetDataID(id)];

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
        blockWorkData.gameObjectTransform.position = nodePoint;
        blockWorkData.gameObjectTransform.localScale = _webframe.NodeBlockScale;

        //	色の指定
        //	色の指定
        Color color = (_dispType == DispType.Block) ? s_noSelectColor : s_DotTypeBlockColor;
        base.SetPartsColor(id, color);

    }

    /// <summary>
    /// 
    /// </summary>
    public override void InputMouse()
    {
        if (_dispType == DispType.Block)
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
