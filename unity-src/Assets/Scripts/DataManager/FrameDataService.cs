using UnityEngine;
using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;
using System.Linq;

public class FrameDataService : webframe
{

    #region Singletonに関する部分
    private static readonly FrameDataService _singleton = null;

    static FrameDataService()
    {
        Type t = typeof(FrameDataService);
        object obj = Activator.CreateInstance(t, true);
        _singleton = obj as FrameDataService;
    }

    public static FrameDataService Instance
    {
        get { return _singleton; }
    }
    #endregion


    #region 物体の大きさを制御する変数

    private float NODESCALE = 0.3f;

    private float maxNodeDistance;
    private float minNodeDistance;
    private float NodeScale;

    private float ELEMENTSCALE = 0.8f;

    private float maxInertia;
    private float minInertia;
    private Dictionary<int, Vector2> ElementScale;

    #endregion

    public void SetData(string strJson)
    {
        var OnChengeList = base._SetData(strJson);

        // 節点データが変わったら _maxNodeLangth, _minNodeLangth を再計算
        if (OnChengeList[(int)InputModeType.Node] == true)
        {
            this.maxNodeDistance = -1f;
            this.minNodeDistance = -1f;
            this.NodeScale = -1f;
            this.SetNodeBlockScale();
        }

        // 材料データが変わったら _maxInertia, _minInertia を再計算
        if (OnChengeList[(int)InputModeType.Element] == true)
        {
            this.maxInertia = -1f;
            this.minInertia = -1f;
            this.SetElementInertia();
        }

    }

    #region 節点(Node)に関する部分

    /// <summary>
    /// 節点間の距離を計算する
    /// </summary>
    /// <param name="node_i"></param>
    /// <param name="node_j"></param>
    public bool GetNodeLength(int node_i, int node_j, out float length)
    {
        if (this.listNodePoint.ContainsKey(node_i) == false)
        {
            length = 0;
            return false;
        }
        if (this.listNodePoint.ContainsKey(node_j) == false)
        {
            length = 0;
            return false;
        }

        Vector3 pos_i = this.listNodePoint[node_i];
        Vector3 pos_j = this.listNodePoint[node_j];

        length = Vector3.Distance(pos_i, pos_j);

        return true;
    }

    /// <summary>
    /// 節点オブジェクトの大きさ
    /// </summary>
    /// <returns></returns>
    private void SetNodeBlockScale()
    {
        //	全検索
        float max_length = 0.0f;
        float min_length = float.MaxValue;
        foreach (int i in listNodePoint.Keys)
        {
            Vector3 startPos = listNodePoint[i];
            foreach (int j in listNodePoint.Keys)
            {
                if (i == j)
                    continue;
                Vector3 endPos = listNodePoint[j];
                Vector3 disVec = endPos - startPos;
                float length = Vector3.Dot(disVec, disVec);     //	高速化のためsqrtはしない
                max_length = Math.Max(max_length, length);
                min_length = Math.Min(min_length, length);
            }
        }
        this.maxNodeDistance = (float)System.Math.Sqrt(max_length);
        this.minNodeDistance = (float)System.Math.Sqrt(min_length);
        this.NodeScale = ((this.minNodeDistance <= 0) ? 1 : this.minNodeDistance) * NODESCALE;
    }

    public Vector3 NodeBlockScale
    {
        get
        {
            return new Vector3(this.NodeScale, this.NodeScale, this.NodeScale);
        }
    }

    #endregion

    #region 要素(Member) に関する部分

    public float MemberLineScale()
    {
        return this.NodeScale / 5;
    }

    #endregion

    #region 材料(Element) に関する部分

    public bool SetElementInertia()
    {
        if (!ListElementData.ContainsKey(ElemtType))
        {
            return false;
        }

        // 最大の大きさを決定する
        var MaxSize = minNodeDistance * ELEMENTSCALE;

        //
        Dictionary<int, Vector2> dict_scale = new Dictionary<int, Vector2>();
        var targetElementData = ListElementData[ElemtType];
        List<float> list_value = new List<float>();

        foreach (int i in targetElementData.Keys)
        {
            //	スケール値を計算
            ElementData elm = targetElementData[i];
            float _z = elm.Iz;
            float _y = elm.Iy;
            if (elm.A > 0.0f)
            {
                _z = (float)System.Math.Sqrt((double)(12.0f * elm.Iz / elm.A));
                _y = (float)System.Math.Sqrt((double)(12.0f * elm.Iy / elm.A));
            }
            float z = elm.Iz * (_z / _y); //* elm.E;
            float y = elm.Iy * (_y / _z); //* elm.E;
            dict_scale.Add(i, new Vector2(y, z));

            // 中央値を求める用の List に追加（重複は許さない）
            if (!list_value.Contains(y))
                list_value.Add(y);
            if (!list_value.Contains(z))
                list_value.Add(z);
        }
        // 中央値 を求める
        list_value.Sort();
        int m = (int)Math.Floor(list_value.Count() / 2.0);
        float Median = list_value[m]; // 中央値

        // 中央値を 1 とする ハイパブリックタンジェントtanh で補正する
        this.ElementScale = new Dictionary<int, Vector2>();
        foreach (int i in dict_scale.Keys)
        {
            Vector2 elm = dict_scale[i];
            elm.x = (float)sigmoid(elm.x - Median) * MaxSize;
            elm.y = (float)sigmoid(elm.y - Median) * MaxSize;
            this.ElementScale.Add(i, elm);
        }

        return true;
    }

    private double sigmoid(double x)
    {
        return 1.0 / (1.0 + Math.Exp(-x));
    }

    /// <summary>
    /// 材料の幅と高さを返す
    /// </summary>
    /// <param name="e">材料番号</param>
    /// <returns></returns>
    public Vector2 ElementBlockScale(int e)
    {
        Vector2 result;

        // 材料情報が有効かどうか調べる
        if (ElementScale.ContainsKey(e))
        {   // 材料の設定が存在しなければ デフォルト値
            result = ElementScale[e];
        }
        else
        {
            float MinSize = 0.0f;
            foreach (var i in ElementScale.Keys)
            {
                Vector2 elm = ElementScale[i];
                MinSize = Math.Min(MinSize, elm.x);
                MinSize = Math.Min(MinSize, elm.y);
            }
            if (MinSize <= 0)
            {
                MinSize = this.MemberLineScale();
            }
            result = new Vector2(MinSize, MinSize);
        }

        return result;
    }

    #endregion  


    /// <summary>
    /// 使用する荷重データを取得する
    /// </summary>
    /// <returns>Dictionary[int, FixMemberData]</returns>
    public LoadData ListLoadData
    {
        get
        {
            if (!base._ListLoadData.ContainsKey(LoadType)) return null;
            return base._ListLoadData[LoadType];
        }
    }


    /// <summary>
    /// 使用するバネリストを取得する（＝FixMemberTypeで指定した配列を取得）
    /// </summary>
    /// <returns>Dictionary[int, FixMemberData]</returns>
    public Dictionary<int, FixMemberData> ListFixMember
    {
        get
        {
            if (!base._ListFixMember.ContainsKey(FixMemberType)) return null;
            return base._ListFixMember[FixMemberType];
        }
    }


}

