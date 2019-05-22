using UnityEngine;
using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;
using System.Linq;

public class FrameDataService : FrameWeb
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
    private Dictionary<string, Vector2> ElementScale;


    private float MEMBERSPRINGSCALE = 0.8f;
    private double[] maxMemberSpring;

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

        // 分布バネデータが変わったら maxMemberSpring を再計算
        if (OnChengeList[(int)InputModeType.FixMember] == true)
        {
            this.maxMemberSpring = new double[4] { 0.0, 0.0, 0.0, 0.0 };
            this.SetMemberSpringScale();
        }

    }

    #region 節点(Node)に関する部分

    /// <summary>
    /// 節点間の距離を計算する
    /// </summary>
    /// <param name="node_i"></param>
    /// <param name="node_j"></param>
    public bool GetNodeLength(string node_i, string node_j, out float length)
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
        foreach (string i in listNodePoint.Keys)
        {
            Vector3 startPos = listNodePoint[i];
            foreach (string j in listNodePoint.Keys)
            {
                if (i == j)
                    continue;
                Vector3 endPos = listNodePoint[j];
                Vector3 disVec = endPos - startPos;
                float length = Vector3.Dot(disVec, disVec);     //	高速化のためsqrtはしない
                max_length = Mathf.Max(max_length, length);
                min_length = Mathf.Min(min_length, length);
            }
        }
        this.maxNodeDistance = Mathf.Sqrt(max_length);
        this.minNodeDistance = Mathf.Sqrt(min_length);
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

    public float MemberLineScale
    {
        get
        {
            return this.NodeScale / 5;
        }
    }

    #endregion

    #region 材料(Element) に関する部分

    public bool SetElementInertia()
    {
        if (!_ListElementData.ContainsKey(ElemtType))
        {
            return false;
        }

        // 最大の大きさを決定する
        var MaxSize = this.NodeScale * ELEMENTSCALE;

        //
        Dictionary<string, Vector2> dict_scale = new Dictionary<string, Vector2>();
        var targetElementData = this.ListElementData;
        List<float> list_value = new List<float>();

        foreach (string id in targetElementData.Keys)
        {
            //	スケール値を計算
            ElementData elm = targetElementData[id];
            float _z = elm.Iz;
            float _y = elm.Iy;
            if (elm.A > 0.0f)
            {
                _z = Mathf.Sqrt(12.0f * elm.Iz / elm.A);
                _y = Mathf.Sqrt(12.0f * elm.Iy / elm.A);
            }
            float z = elm.Iz * (_z / _y); //* elm.E;
            float y = elm.Iy * (_y / _z); //* elm.E;
            dict_scale.Add(id, new Vector2(y, z));

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
        this.ElementScale = new Dictionary<string, Vector2>();
        foreach (string id in dict_scale.Keys)
        {
            Vector2 elm = dict_scale[id];
            elm.x = Sigmoid(elm.x - Median) * MaxSize;
            elm.y = Sigmoid(elm.y - Median) * MaxSize;
            this.ElementScale.Add(id, elm);
        }

        return true;
    }

    private float Sigmoid(float x)
    {
        return 1.0f / (1.0f + Mathf.Exp(-x));
    }

    /// <summary>
    /// 材料の幅と高さを返す
    /// </summary>
    /// <param name="e">材料番号</param>
    /// <returns></returns>
    public Vector2 ElementBlockScale(string e)
    {
        Vector2 result;

        // 材料情報が有効かどうか調べる
        if (ElementScale.ContainsKey(e))
        {
            result = ElementScale[e];
        }
        else
        {   // 材料の設定が存在しなければ デフォルト値
            float MinSize = this.MemberLineScale;
            result = new Vector2(MinSize, MinSize);
        }

        return result;
    }

    /// <summary>
    /// 使用するバネリストを取得する（＝FixMemberTypeで指定した配列を取得）
    /// </summary>
    /// <returns>Dictionary[int, FixMemberData]</returns>
    public Dictionary<string, ElementData> ListElementData
    {
        get
        {
            if (!base._ListElementData.ContainsKey(ElemtType))
                return new Dictionary<string, ElementData>();
            return base._ListElementData[ElemtType];
        }
    }

    #endregion

    #region 分布バネ(FixMember) に関する部分

    public bool SetMemberSpringScale()
    {
        if (!base._ListFixMember.ContainsKey(ElemtType))
        {
            return false;
        }

        // 最大のバネ値を決定する
        foreach (var id in this.ListFixMember.Keys)
        {
            FixMemberData fm = this.ListFixMember[id];
            var i = 0;
            foreach (double value in new double[] { fm.tx, fm.ty, fm.tz, fm.tr })
            {
                maxMemberSpring[i] = Math.Max(maxMemberSpring[i], value);
                i++;
            }
        }

        return true;
    }

    /// <summary>
    /// 分布バネの大きさを返す
    /// </summary>
    /// <param name="row">入力行</param>
    /// <param name="target">tx, ty, tz, tr のどれか</param>
    /// <returns></returns>
    public float FixMemberBlockScale(int id, string target)
    {
        float result;

        // 材料情報が有効かどうか調べる
        if (ListFixMember.ContainsKey(id))
        {
            // 最大の大きさを決定する
            var MaxSize = this.NodeScale * MEMBERSPRINGSCALE;

            // バネ値に応じて大きさを決定する
            FixMemberData fm = this.ListFixMember[id];
            double size = 0;
            switch (target)
            {
                case "tx":
                    size = MaxSize * fm.tx / maxMemberSpring[0] ;
                    break;
                case "ty":
                    size = MaxSize * fm.ty / Math.Max(maxMemberSpring[1], maxMemberSpring[2]);
                    break;
                case "tz":
                    size = MaxSize * fm.tz / Math.Max(maxMemberSpring[1], maxMemberSpring[2]);
                    break;
                case "tr":
                    size = MaxSize * fm.tr / maxMemberSpring[3];
                    break;
            }
            result = (float)size;
        }
        else
        {   // 材料の設定が存在しなければ デフォルト値
            result = 0f;
        }
        return result;
    }

    /// <summary>
    /// 使用するバネリストを取得する（＝FixMemberTypeで指定した配列を取得）
    /// </summary>
    /// <returns>Dictionary[int, FixMemberData]</returns>
    public Dictionary<int, FixMemberData> ListFixMember
    {
        get
        {
            if (!base._ListFixMember.ContainsKey(FixMemberType))
                return new Dictionary<int, FixMemberData>();
            return base._ListFixMember[FixMemberType];
        }
    }
    #endregion

    #region 支点(FixNode)に関する部分

    public float FixNodeBlockScale
    {
        get
        {
            return this.NodeScale * 3f;
        }
    }

    /// <summary>
    /// 使用する支点リストを取得する（＝FixNodeTypeで指定した配列を取得）
    /// </summary>
    /// <returns>Dictionary[int, FixNodeData]</returns>
    public Dictionary<int, FixNodeData> ListFixNode
    {
        get
        {
            if (!base._ListFixNode.ContainsKey(FixNodeType))
                return new Dictionary<int, FixNodeData>();
            return base._ListFixNode[FixNodeType];
        }
    }
    #endregion

    #region 結合(Joint)に関する部分

    public float JointBlockScale
    {
        get
        {
            return this.NodeScale * 2f;
        }
    }

    /// <summary>
    /// 使用する支点リストを取得する（＝FixNodeTypeで指定した配列を取得）
    /// </summary>
    /// <returns>Dictionary[int, FixNodeData]</returns>
    public Dictionary<int, JointData> ListJointData
    {
        get
        {
            if (!base._ListJointData.ContainsKey(JointType))
                return new Dictionary<int, JointData>();
            return base._ListJointData[JointType];
        }
    }
    #endregion

    #region 着目点(NoticePoint)に関する部分

    public float NoticePointBlockScale
    {
        get
        {
            return this.NodeScale * 1.5f;
        }
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
            if (!base._ListLoadData.ContainsKey(LoadType))
                return new LoadData();
            return base._ListLoadData[LoadType];
        }
    }



}

