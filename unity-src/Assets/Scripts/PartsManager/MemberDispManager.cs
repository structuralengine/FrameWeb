using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;
using Assets.Scripts.Comon;

public class MemberDispManager : PartsDispManager
{
  public enum DispType
  {
    Block,
    Line,
    Disg
  }

  private DispType _dispType = DispType.Line;

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
        int i = ComonFunctions.ConvertToInt(id);
        if (!base._blockWorkData.ContainsKey(id))
        {
          blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
          base.InitBlock(ref blockWorkData, i, id);
          base._blockWorkData.Add(id, blockWorkData);
        }
      }
    }
    catch (Exception e)
    {
      Debug.Log("MemberDispManager CreateMembers" + e.Message);
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

    base.ChengeForcuseBlock(id);
    foreach (string j in base._blockWorkData.Keys)
    {
      if (j == id)
        this.SetAllowStatus(j, true);
      else
        this.SetAllowStatus(j, false);
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
    if (_dispType == DispType.Disg)
    {
      FrameWeb.DisgData disg_i = _webframe.ListDisgData[nodeI];
      pos_i.x += _webframe.DisgScale(disg_i.dx);
      pos_i.y += _webframe.DisgScale(disg_i.dy);
      pos_i.z += _webframe.DisgScale(disg_i.dz);
      FrameWeb.DisgData disg_j = _webframe.ListDisgData[nodeJ];
      pos_j.x += _webframe.DisgScale(disg_j.dx);
      pos_j.y += _webframe.DisgScale(disg_j.dy);
      pos_j.z += _webframe.DisgScale(disg_j.dz);
    }


    float Line_scale = _webframe.MemberLineScale;
    Vector3 scale = new Vector3(Line_scale, Line_scale, length);
    if (_dispType == DispType.Block)
    {
      //	幅と高さを設定する
      scale = _webframe.ElementBlockScale(memberData.e);
      scale.z = length;
    }

    //	姿勢を設定
    blockWorkData = base._blockWorkData[id];

    blockWorkData.rootBlockTransform.position = pos_i;
    blockWorkData.rootBlockTransform.LookAt(pos_j);
    //blockWorkData.transform.Rotate(new Vector3(0, 0, 60));
    //blockWorkData.directionArrow.transform.Rotate(new Vector3(0, 0, 60));
    blockWorkData.rootBlockTransform.localScale = scale;

    //	方向矢印の表示
    if (blockWorkData.directionArrow != null)
    {
      if (_dispType == DispType.Block)
      {
        Vector3 upwards = tMatrix.upwards(pos_i, pos_j);
        Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i, upwards);
        Vector3 arrowCenter = Vector3.Lerp(pos_i, pos_j, 0.5f);
        Vector3 arrowSize = new Vector3(Line_scale / 2, Line_scale / 2, length * 0.25f);

        blockWorkData.directionArrow.SetArrowDirection(arrowCenter, rotate, arrowSize);
        blockWorkData.directionArrow.EnableRenderer(enabled);
      }
      else
      {
        blockWorkData.directionArrow.EnableRenderer(false);
      }
    }


    //	色の指定
    Color color = (_dispType == DispType.Block) ? s_noSelectColor : s_lineTypeBlockColor;
    base.SetPartsColor(id, color);
    this.SetAllowStatus(id, false);

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
