using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;
using Assets.Scripts.Comon;

public class ElementDispManager : PartsDispManager
{
  /// <summary>
  /// パーツを作成する
  /// </summary>
  public override void CreateParts()
  {
    try
    {
      BlockWorkData blockWorkData;

      if (_webframe.ListElementData.Count == 0)
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
        return;
      }

      // データに無いブロックは消す
      List<string> DeleteKeys = new List<string>();
      foreach (string id in base._blockWorkData.Keys)
      {
        if (!_webframe.ListMemberData.ContainsKey(id))
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
      foreach (string id in _webframe.ListMemberData.Keys)
      {
        if (!base._blockWorkData.ContainsKey(id))
        {
          blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
          var m = _webframe.ListMemberData[id];
          int e = ComonFunctions.ConvertToInt(m.e);
          InitBlock(ref blockWorkData, e, id);
          base._blockWorkData.Add(id, blockWorkData);
        }
      }

    }
    catch (Exception e)
    {
      Debug.Log("ElementDispManager CreateElements" + e.Message);
    }
  }

  public override void ChangeTypeNo(int TypeNo)
  {
    _webframe.ElemtType = TypeNo;
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
        this.SetAllowStatus(j, true);
      }
      else
      {
        SetPartsColor(j, s_noSelectColor);
        this.SetAllowStatus(j, false);
      }
    }
  }


  /// <summary> ブロックの矢印を設定する </summary>
  /// <param name="onoff"></param>
  private void SetAllowStatus(string id, bool onoff)
  {
    BlockWorkData blockWorkData = base._blockWorkData[id];

    if (blockWorkData.directionArrow != null)
    {
      blockWorkData.directionArrow.EnableRenderer(onoff);
    }
  }

  /// <summary>
  /// 
  /// </summary>
  public override void SetBlockStatus(string id)
  {
    if (!base._blockWorkData.ContainsKey(id))
      return;

    FrameWeb.MemberData memberData = _webframe.ListMemberData[id];

    BlockWorkData blockWorkData;

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

    //	幅と高さを設定する
    Vector3 scale = _webframe.ElementBlockScale(memberData.e);
    scale.z = length;

    //	姿勢を設定
    blockWorkData = base._blockWorkData[id];

    blockWorkData.rootBlockTransform.position = pos_i;
    blockWorkData.rootBlockTransform.LookAt(pos_j);
    blockWorkData.rootBlockTransform.localScale = scale;

    //	方向矢印の表示
    if (blockWorkData.directionArrow != null)
    {
      float Line_scale = _webframe.MemberLineScale;

      Vector3 upwards = tMatrix.upwards(pos_i, pos_j);
      Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i, upwards);
      Vector3 arrowCenter = Vector3.Lerp(pos_i, pos_j, 0.5f);
      Vector3 arrowSize = new Vector3(Line_scale / 2, Line_scale / 2, length * 0.25f);

      blockWorkData.directionArrow.SetArrowDirection(arrowCenter, rotate, arrowSize);
      blockWorkData.directionArrow.EnableRenderer(enabled);

    }

    //	色の指定
    if (_webframe.ListElementData.ContainsKey(memberData.e))
      base.SetPartsColor(id, s_noSelectColor);
    else
      base.SetPartsColor(id, s_lineTypeBlockColor);
    this.SetAllowStatus(id, false);
  }

}
