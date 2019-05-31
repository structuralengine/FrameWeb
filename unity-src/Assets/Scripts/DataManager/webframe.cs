using UnityEngine;
using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;

/// <summary> 描画モード </summary>
public enum InputModeType
{
    Node,               //	節点
    Member,             //	要素
    Panel,              //	パネル
    FixNode,            //　支点
    Element,            //　材料
    Joint,              //　結合
    NoticePoints,       //　着目点
    FixMember,          //　バネ
    Load,               //　荷重
    Fsec,               //　断面力
    Disg,               //　変位量
    Reac,               //　反力

    Max,

    None = -1,
}


/// <summary> 骨組応答解析データ </summary>
public class FrameWeb //: Singleton<webframe>
{
    public void Clear()
    {
        this.listNodePoint.Clear();
        this.ListMemberData.Clear();
        this.ListNoticePoint.Clear();
        this._ListElementData.Clear();
        this.ListPanelData.Clear();
        this._ListFixNode.Clear();
        this._ListFixMember.Clear();
        this._ListJointData.Clear();
        this._ListLoadData.Clear();
    }
    public void ResultDataClear()
    {
        this._ListDisgData.Clear();
        this._ListReacData.Clear();
        this._ListFsecData.Clear();
    }

    #region 格点データ

    public Dictionary<string, Vector3> listNodePoint = new Dictionary<string, Vector3>();

    /// <summary> 格点データを読み込む </summary>
    private bool SetNodePoint(Dictionary<string, object> objJson)
    {
        bool OnChenge = false;
        try
        {
            if (!objJson.ContainsKey("node"))
                return false;

            this.listNodePoint.Clear();

            Dictionary<string, object> node1 = objJson["node"] as Dictionary<string, object>;
            foreach (string key in node1.Keys)
            {
                try
                {
                    Dictionary<string, object> node2 = node1[key] as Dictionary<string, object>;
                    float x = ComonFunctions.ConvertToSingle(node2["x"]);
                    float y = ComonFunctions.ConvertToSingle(node2["y"]);
                    float z = ComonFunctions.ConvertToSingle(node2["z"]);
                    Vector3 xyz = new Vector3(x, -y, z); // Unity 左手系 → FrameWeb 右手系 なので y にマイナスを乗ずる
                    this.listNodePoint.Add(key, xyz);
                }
                catch
                {
                    continue;
                }
            }
            OnChenge = true;

        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetNodePoint");
            Debug.Log(e.Message);
        }
        return OnChenge;
    }

    #endregion

    #region 要素データ

    public class MemberData
    {
        public string ni = "0";  //	節点番号ｉ
        public string nj = "0";  //	節点番号ｊ
        public string e = "0";   //	Element番号
        public float cg = 0F;   //	コードアングル
        public MemberData(string _ni, string _nj, string _e, float _cg = 0F)
        {
            this.ni = _ni;
            this.nj = _nj;
            this.e = _e;
            this.cg = _cg;
        }

    }

    public Dictionary<string, MemberData> ListMemberData = new Dictionary<string, MemberData>();

    /// <summary> 要素データを読み込む </summary>
    private bool SetMemberData(Dictionary<string, object> objJson)
    {
        bool OnChenge = false;
        try
        {
            if (!objJson.ContainsKey("member"))
                return false;

            this.ListMemberData.Clear();

            Dictionary<string, object> member1 = objJson["member"] as Dictionary<string, object>;
            foreach (string key in member1.Keys)
            {
                try
                {
                    Dictionary<string, object> member2 = member1[key] as Dictionary<string, object>;
                    string i = member2["ni"].ToString();
                    string j = member2["nj"].ToString();
                    string e = member2["e"].ToString();
                    if (this.listNodePoint.ContainsKey(i)
                        && this.listNodePoint.ContainsKey(j))
                    {
                        MemberData ex = new MemberData(i, j, e);
                        this.ListMemberData.Add(key, ex);
                    }
                }
                catch
                {
                    continue;
                }
            }
            OnChenge = true;

        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetMemberData");
            Debug.Log(e.Message);
        }
        return OnChenge;
    }

    #endregion

    #region 着目点データ

    public class NoticePointData
    {
        public string m;
        public List<float> Points = new List<float>();

        public NoticePointData(string _m, List<float> _Points)
        {
            this.m = _m;
            this.Points = _Points;
        }
    }

    public Dictionary<int, NoticePointData> ListNoticePoint = new Dictionary<int, NoticePointData>();

    /// <summary> 着目点データを読み込む </summary>
    private bool SetNoticePoint(Dictionary<string, object> objJson)
    {
        bool OnChenge = false;
        try
        {
            if (!objJson.ContainsKey("notice_points"))
                return false;

            this.ListNoticePoint.Clear();

            List<object> notice1 = objJson["notice_points"] as List<object>;
            foreach (Dictionary<string, object> tmp in notice1)
            {
                try
                {
                    int id = ComonFunctions.ConvertToInt(tmp["row"]);
                    string m = tmp["m"].ToString();
                    if (this.ListMemberData.ContainsKey(m))
                    {
                        List<object> pos1 = tmp["Points"] as List<object>;
                        List<float> pos2 = new List<float>();
                        foreach (var p in pos1)
                        {
                            if (p != null)
                            {
                                float pos = ComonFunctions.ConvertToSingle(p, -1);
                                if (pos > 0)
                                    pos2.Add(pos);
                            }
                        }
                        this.ListNoticePoint.Add(id, new NoticePointData(m, pos2));
                    }
                }
                catch
                {
                    continue;
                }
            }
            OnChenge = true;

        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetNoticePoint");
            Debug.Log(e.Message);
        }
        return OnChenge;
    }

    #endregion

    #region 材料データ
    public int ElemtType = 1;

    public partial class ElementData
    {
        public float E = 0.0F;   //	ヤング率
        public float G = 0.0F;   //	せん断弾性係数
        public float Xp = 0.0F;  //	線膨張係数

        public float A = 0.0F;  //	断面積
        public float J = 0.0F;  //	ねじり定数
        public float Iz = 0.0F; //	断面２次モーメントZ軸まわり
        public float Iy = 0.0F; //	断面２次モーメントY軸まわり

        public ElementData(float _E, float _G, float _Xp, float _A, float _J, float _Iz, float _Iy)
        {
            this.E = _E;
            this.G = _G;
            this.Xp = _Xp;
            this.A = _A;
            this.J = _J;
            this.Iz = _Iz;
            this.Iy = _Iy;
        }
    }

    protected Dictionary<int, Dictionary<string, ElementData>> _ListElementData = new Dictionary<int, Dictionary<string, ElementData>>();

    /// <summary> 属性データを読み込む </summary>
    private bool SetElementData(Dictionary<string, object> objJson, int mode = 0)
    {
        bool OnChenge = false;
        try
        {
            if (!objJson.ContainsKey("element"))
                return false;

            if (mode == 0)
                this._ListElementData.Clear();

            Dictionary<string, object> element1 = objJson["element"] as Dictionary<string, object>;
            foreach (string key1 in element1.Keys)
            {
                Dictionary<string, ElementData> tmp = new Dictionary<string, ElementData>();
                try
                {
                    int typ = int.Parse(key1);

                    Dictionary<string, object> element2 = element1[key1] as Dictionary<string, object>;
                    foreach (string key2 in element2.Keys)
                    {
                        Dictionary<string, object> element3 = element2[key2] as Dictionary<string, object>;
                        float E = ComonFunctions.ConvertToSingle(element3["E"]);
                        float G = ComonFunctions.ConvertToSingle(element3["G"]);
                        float Xp = ComonFunctions.ConvertToSingle(element3["Xp"]);
                        float A = ComonFunctions.ConvertToSingle(element3["A"]);
                        float J = ComonFunctions.ConvertToSingle(element3["J"]);
                        float Iz = ComonFunctions.ConvertToSingle(element3["Iz"]);
                        float Iy = ComonFunctions.ConvertToSingle(element3["Iy"]);
                        ElementData e = new ElementData(E, G, Xp, A, J, Iz, Iy);
                        tmp.Add(key2, e);
                    }
                    if (this._ListElementData.ContainsKey(typ))
                        this._ListElementData[typ] = tmp;
                    else
                        this._ListElementData.Add(typ, tmp);
                }
                catch
                {
                    continue;
                }
            }
            OnChenge = true;
        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetElementData");
            Debug.Log(e.Message);
        }
        return OnChenge;
    }

    #endregion

    #region パネルデータ

    public class PanelData
    {
        public string no1 = "0"; // 構成節点No1
        public string no2 = "0"; // 構成節点No2
        public string no3 = "0"; // 構成節点No3
        public string e = "0";   // Element番号

        public PanelData(string _no1, string _no2, string _no3, string _e)
        {
            this.no1 = _no1;
            this.no2 = _no2;
            this.no3 = _no3;
            this.e = _e;
        }
    }

    public Dictionary<string, PanelData> ListPanelData = new Dictionary<string, PanelData>();

    /// <summary> パネルデータを読み込む </summary>
    private bool SetPanelData(Dictionary<string, object> objJson)
    {
        bool OnChenge = false;
        try
        {
            if (!objJson.ContainsKey("panel"))
                return false;

            this.ListPanelData.Clear();

            Dictionary<string, object> panel1 = objJson["panel"] as Dictionary<string, object>;
            foreach (string key in panel1.Keys)
            {
                try
                {
                    Dictionary<string, object> panel2 = panel1[key] as Dictionary<string, object>;
                    string n1 = panel2["no1"].ToString();
                    string n2 = panel2["no2"].ToString();
                    string n3 = panel2["no3"].ToString();
                    string e = panel2["e"].ToString();
                    if (this.listNodePoint.ContainsKey(n1)
                        && this.listNodePoint.ContainsKey(n2)
                        && this.listNodePoint.ContainsKey(n3))
                    {
                        PanelData ex = new PanelData(n1, n2, n3, e);
                        this.ListPanelData.Add(key, ex);
                    }
                }
                catch
                {
                    continue;
                }
            }
            OnChenge = true;

        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetPanelData");
            Debug.Log(e.Message);
        }
        return OnChenge;
    }

    #endregion

    #region 支点データ
    public int FixNodeType = 1;

    public partial class FixNodeData
    {
        public string n = "0";
        public double tx = 0.0;
        public double ty = 0.0;
        public double tz = 0.0;
        public double rx = 0.0;
        public double ry = 0.0;
        public double rz = 0.0;
        public FixNodeData(string _n, double _tx, double _ty, double _tz, double _rx, double _ry, double _rz)
        {
            this.n = _n;
            this.tx = _tx;
            this.ty = _ty;
            this.tz = _tz;
            this.rx = _rx;
            this.ry = _ry;
            this.rz = _rz;
        }

        public FixNodeData Clone()
        {
            FixNodeData result = new FixNodeData(this.n, this.tx, this.ty, this.tz, this.rx, this.ry, this.rz);
            return result;
        }
    }

    protected Dictionary<int, Dictionary<int, FixNodeData>> _ListFixNode = new Dictionary<int, Dictionary<int, FixNodeData>>();

    /// <summary> 支点データを読み込む </summary>
    private bool SetFixNode(Dictionary<string, object> objJson, int mode = 0)
    {
        bool OnChenge = false;
        try
        {
            if (!objJson.ContainsKey("fix_node"))
                return false;

            if (mode == 0)
                this._ListFixNode.Clear();

            Dictionary<string, object> fix_node1 = objJson["fix_node"] as Dictionary<string, object>;
            foreach (string key1 in fix_node1.Keys)
            {
                Dictionary<int, FixNodeData> tmp = new Dictionary<int, FixNodeData>();
                try
                {
                    int typ = int.Parse(key1);
                    List<object> fix_node2 = fix_node1[key1] as List<object>;

                    foreach (var fn in fix_node2)
                    {
                        Dictionary<string, object> fix_node3 = fn as Dictionary<string, object>;

                        int id = ComonFunctions.ConvertToInt(fix_node3["row"]);
                        string n = fix_node3["n"].ToString();

                        if (this.listNodePoint.ContainsKey(n) == false)
                            continue;

                        double tx = ComonFunctions.ConvertToDouble(fix_node3["tx"]);
                        double ty = ComonFunctions.ConvertToDouble(fix_node3["ty"]);
                        double tz = ComonFunctions.ConvertToDouble(fix_node3["tz"]);
                        double rx = ComonFunctions.ConvertToDouble(fix_node3["rx"]);
                        double ry = ComonFunctions.ConvertToDouble(fix_node3["ry"]);
                        double rz = ComonFunctions.ConvertToDouble(fix_node3["rz"]);

                        FixNodeData ex = new FixNodeData(n, tx, ty, tz, rx, ry, rz);
                        tmp.Add(id, ex);
                    }
                    if (this._ListFixNode.ContainsKey(typ))
                        this._ListFixNode[typ] = tmp;
                    else
                        this._ListFixNode.Add(typ, tmp);
                }
                catch
                {
                    continue;
                }
            }
            OnChenge = true;
        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetFixNode");
            Debug.Log(e.Message);
        }
        return OnChenge;
    }

    #endregion

    #region バネデータ
    public int FixMemberType = 1;

    public partial class FixMemberData
    {
        public string m = "0";
        public double tx = 0.0;
        public double ty = 0.0;
        public double tz = 0.0;
        public double tr = 0.0;
        public FixMemberData(string _m, double _tx, double _ty, double _tz, double _tr)
        {
            this.m = _m;
            this.tx = _tx;
            this.ty = _ty;
            this.tz = _tz;
            this.tr = _tr;
        }
    }

    protected Dictionary<int, Dictionary<int, FixMemberData>> _ListFixMember = new Dictionary<int, Dictionary<int, FixMemberData>>();

    /// <summary> バネデータを読み込む </summary>
    private bool SetFixMember(Dictionary<string, object> objJson, int mode = 0)
    {
        bool OnChenge = false;
        try
        {
            if (!objJson.ContainsKey("fix_member"))
                return false;

            if (mode == 0)
                this._ListFixMember.Clear();

            Dictionary<string, object> fix_member1 = objJson["fix_member"] as Dictionary<string, object>;
            foreach (string key1 in fix_member1.Keys)
            {
                Dictionary<int, FixMemberData> tmp = new Dictionary<int, FixMemberData>();
                try
                {
                    int typ = int.Parse(key1);
                    List<object> fix_member2 = fix_member1[key1] as List<object>;

                    foreach (var fm in fix_member2)
                    {
                        Dictionary<string, object> fix_member3 = fm as Dictionary<string, object>;

                        int id = ComonFunctions.ConvertToInt(fix_member3["row"]);
                        string m = fix_member3["m"].ToString();

                        if (this.ListMemberData.ContainsKey(m) == false)
                            continue;

                        double tx = ComonFunctions.ConvertToDouble(fix_member3["tx"]);
                        double ty = ComonFunctions.ConvertToDouble(fix_member3["ty"]);
                        double tz = ComonFunctions.ConvertToDouble(fix_member3["tz"]);
                        double tr = ComonFunctions.ConvertToDouble(fix_member3["tr"]);

                        FixMemberData ex = new FixMemberData(m, tx, ty, tz, tr);
                        tmp.Add(id, ex);
                    }
                    if (this._ListFixMember.ContainsKey(typ))
                        this._ListFixMember[typ] = tmp;
                    else
                        this._ListFixMember.Add(typ, tmp);
                }
                catch
                {
                    continue;
                }
            }
            OnChenge = true;

        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetFixMember");
            Debug.Log(e.Message);
        }
        return OnChenge;
    }



    #endregion

    #region 結合データ
    public int JointType = 1;

    public partial class JointData
    {
        public string m = "0";
        public int xi = 1;
        public int yi = 1;
        public int zi = 1;
        public int xj = 1;
        public int yj = 1;
        public int zj = 1;
        public JointData(string _m, int _xi, int _yi, int _zi, int _xj, int _yj, int _zj)
        {
            this.m = _m;
            this.xi = _xi;
            this.yi = _yi;
            this.zi = _zi;
            this.xj = _xj;
            this.yj = _yj;
            this.zj = _zj;
        }
    }

    protected Dictionary<int, Dictionary<int, JointData>> _ListJointData = new Dictionary<int, Dictionary<int, JointData>>();

    /// <summary> 支点データを読み込む </summary>
    private bool SetJointData(Dictionary<string, object> objJson, int mode = 0)
    {
        bool OnChenge = false;
        try
        {
            if (!objJson.ContainsKey("joint"))
                return false;

            if (mode == 0)
                this._ListJointData.Clear();

            Dictionary<string, object> joint1 = objJson["joint"] as Dictionary<string, object>;

            foreach (string key1 in joint1.Keys)
            {
                Dictionary<int, JointData> tmp = new Dictionary<int, JointData>();
                try
                {
                    int typ = int.Parse(key1);
                    List<object> joint2 = joint1[key1] as List<object>;

                    foreach (var jo in joint2)
                    {
                        Dictionary<string, object> joint3 = jo as Dictionary<string, object>;

                        int id = ComonFunctions.ConvertToInt(joint3["row"]);
                        string m = joint3["m"].ToString();

                        if (this.ListMemberData.ContainsKey(m) == false)
                            continue;

                        int xi = ComonFunctions.ConvertToInt(joint3["xi"]);
                        int yi = ComonFunctions.ConvertToInt(joint3["yi"]);
                        int zi = ComonFunctions.ConvertToInt(joint3["zi"]);
                        int xj = ComonFunctions.ConvertToInt(joint3["xj"]);
                        int yj = ComonFunctions.ConvertToInt(joint3["yj"]);
                        int zj = ComonFunctions.ConvertToInt(joint3["zj"]);

                        JointData ex = new JointData(m, xi, yi, zi, xj, yj, zj);
                        tmp.Add(id, ex);
                    }
                    if (this._ListJointData.ContainsKey(typ))
                        this._ListJointData[typ] = tmp;
                    else this._ListJointData.Add(typ, tmp);
                }
                catch
                {
                    continue;
                }
            }
            OnChenge = true;


        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetJointData");
            Debug.Log(e.Message);
        }
        return OnChenge;
    }

    #endregion

    #region 荷重データ
    public int LoadType = 1;

    public partial class LoadData
    {
        public int fix_node = 1;
        public int fix_member = 1;
        public int element = 1;
        public int joint = 1;
        public List<LoadNodeData> load_node = new List<LoadNodeData>();
        public List<LoadMemberData> load_member = new List<LoadMemberData>();
    }

    public partial class LoadNodeData
    {
        public int row = 0;
        public string n = "0";
        public double tx = 0.0;
        public double ty = 0.0;
        public double tz = 0.0;
        public double rx = 0.0;
        public double ry = 0.0;
        public double rz = 0.0;
        public LoadNodeData(int _row, string _n, double _tx, double _ty, double _tz, double _rx, double _ry, double _rz)
        {
            this.row = _row;
            this.n = _n;
            this.tx = _tx;
            this.ty = _ty;
            this.tz = _tz;
            this.rx = _rx;
            this.ry = _ry;
            this.rz = _rz;
        }
    }

    public partial class LoadMemberData
    {
        public int row = 0;
        public string m = "0";
        public string direction = "";
        public int mark = 0;
        public double L1 = 0.0;
        public double L2 = 0.0;
        public double P1 = 0.0;
        public double P2 = 0.0;
        public LoadMemberData(int _row, string _m, string _direction, int _mark, double _L1, double _L2, double _P1, double _P2)
        {
            this.row = _row;
            this.m = _m;
            this.direction = _direction;
            this.mark = _mark;
            this.L1 = _L1;
            this.L2 = _L2;
            this.P1 = _P1;
            this.P2 = _P2;
        }
    }

    protected Dictionary<int, LoadData> _ListLoadData = new Dictionary<int, LoadData>();

    /// <summary> 荷重データを読み込む </summary>
    private bool SetLoadData(Dictionary<string, object> objJson, int mode = 0)
    {
        bool OnChenge = false;
        try
        {
            if (!objJson.ContainsKey("load"))
                return false;

            if (mode == 0)
                this._ListLoadData.Clear();

            Dictionary<string, object> load1 = objJson["load"] as Dictionary<string, object>;
            foreach (string key1 in load1.Keys)
            {
                LoadData tmp = new LoadData();
                int caseNo = int.Parse(key1);
                Dictionary<string, object> load2 = load1[key1] as Dictionary<string, object>;

                int fix_node = ComonFunctions.ConvertToInt(load2["fix_node"], 1);
                int fix_member = ComonFunctions.ConvertToInt(load2["fix_member"], 1);
                int element = ComonFunctions.ConvertToInt(load2["element"], 1);
                int joint = ComonFunctions.ConvertToInt(load2["joint"], 1);

                List<LoadNodeData> load_node = new List<LoadNodeData>();
                if (load2.ContainsKey("load_node"))
                {
                    try
                    {
                        List<object> load3 = load2["load_node"] as List<object>;
                        foreach (Dictionary<string, object> ln in load3)
                        {
                            int row = ComonFunctions.ConvertToInt(ln["row"]);
                            string id = ln["n"].ToString();

                            if (this.listNodePoint.ContainsKey(id) == false)
                                continue;

                            double tx = ComonFunctions.ConvertToDouble(ln["tx"]);
                            double ty = ComonFunctions.ConvertToDouble(ln["ty"]);
                            double tz = ComonFunctions.ConvertToDouble(ln["tz"]);
                            double rx = ComonFunctions.ConvertToDouble(ln["rx"]);
                            double ry = ComonFunctions.ConvertToDouble(ln["ry"]);
                            double rz = ComonFunctions.ConvertToDouble(ln["rz"]);

                            LoadNodeData ex = new LoadNodeData(row, id, tx, ty, tz, rx, ry, rz);
                            load_node.Add(ex);
                        }
                    }
                    catch (Exception e)
                    {
                        Debug.Log("Error!! at webframe SetLoadNodeData");
                        Debug.Log(e.Message);
                        return OnChenge;
                    }
                }
                tmp.load_node = load_node;

                List<LoadMemberData> load_member = new List<LoadMemberData>();
                if (load2.ContainsKey("load_member"))
                {
                    try
                    {
                        List<object> load3 = load2["load_member"] as List<object>;
                        foreach (Dictionary<string, object> lm in load3)
                        {
                            int row = ComonFunctions.ConvertToInt(lm["row"]);
                            string id = lm["m"].ToString();

                            if (this.ListMemberData.ContainsKey(id) == false)
                                continue;

                            string direction = lm["direction"].ToString();
                            int mark = ComonFunctions.ConvertToInt(lm["mark"]);
                            double L1 = ComonFunctions.ConvertToDouble(lm["L1"]);
                            double L2 = ComonFunctions.ConvertToDouble(lm["L2"]);
                            double P1 = ComonFunctions.ConvertToDouble(lm["P1"]);
                            double P2 = ComonFunctions.ConvertToDouble(lm["P2"]);

                            LoadMemberData ex = new LoadMemberData(row, id, direction, mark, L1, L2, P1, P2);
                            load_member.Add(ex);
                        }
                    }
                    catch (Exception e)
                    {
                        Debug.Log("Error!! at webframe SetLoadMemberData");
                        Debug.Log(e.Message);
                        return OnChenge;
                    }
                }
                tmp.load_member = load_member;

                if (this._ListLoadData.ContainsKey(caseNo))
                    this._ListLoadData[caseNo] = tmp;
                else
                    this._ListLoadData.Add(caseNo, tmp);
            }
            OnChenge = true;

        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetLoadData");
            Debug.Log(e.Message);
        }
        return OnChenge;
    }

    #endregion

    #region 変位量データ
    public int DisgType = 1;

    public partial class DisgData
    {
        public double dx = 0.0;
        public double dy = 0.0;
        public double dz = 0.0;
        public double rx = 0.0;
        public double ry = 0.0;
        public double rz = 0.0;
        public DisgData(double _dx, double _dy, double _dz, double _rx, double _ry, double _rz)
        {
            this.dx = _dx;
            this.dy = _dy;
            this.dz = _dz;
            this.rx = _rx;
            this.ry = _ry;
            this.rz = _rz;
        }
    }
    protected Dictionary<int, Dictionary<string, DisgData>> _ListDisgData = new Dictionary<int, Dictionary<string, DisgData>>();

    /// <summary> 変位量データを読み込む </summary>
    private bool SetDisgData(Dictionary<string, object> objJson)
    {
        bool OnChenge = false;
        try
        {
            if (!objJson.ContainsKey("disg"))
                return false;

            this._ListDisgData.Clear();

            Dictionary<string, object> disg1 = objJson["disg"] as Dictionary<string, object>;
            foreach (string CaseNo in disg1.Keys)
            {
                try
                {
                    List<object> disg2 = disg1[CaseNo] as List<object>;

                    Dictionary<string, DisgData> tmp = new Dictionary<string, DisgData>();

                    for (int i = 0; i < disg2.Count; i++)
                    {
                        Dictionary<string, object> disg3 = disg2[i] as Dictionary<string, object>;

                        string n = disg3["id"].ToString();

                        double dx = ComonFunctions.ConvertToDouble(disg3["dx"]);
                        double dy = ComonFunctions.ConvertToDouble(disg3["dy"]);
                        double dz = ComonFunctions.ConvertToDouble(disg3["dz"]);
                        double rx = ComonFunctions.ConvertToDouble(disg3["rx"]);
                        double ry = ComonFunctions.ConvertToDouble(disg3["ry"]);
                        double rz = ComonFunctions.ConvertToDouble(disg3["rz"]);

                        DisgData ex = new DisgData(dx, dy, dz, rx, ry, rz);
                        tmp.Add(n, ex);
                    }

                    int typ = ComonFunctions.ConvertToInt(CaseNo);
                    this._ListDisgData.Add(typ, tmp);
                }
                catch
                {
                    continue;
                }
            }
            OnChenge = true;
        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetDisgData");
            Debug.Log(e.Message);
        }
        return OnChenge;
    }

    #endregion

    #region  反力データ
    public int ReacType = 1;

    public partial class ReacData
    {
        public double tx = 0.0;
        public double ty = 0.0;
        public double tz = 0.0;
        public double mx = 0.0;
        public double my = 0.0;
        public double mz = 0.0;
        public ReacData(double _tx, double _ty, double _tz, double _mx, double _my, double _mz)
        {
            this.tx = _tx;
            this.ty = _ty;
            this.tz = _tz;
            this.mx = _mx;
            this.my = _my;
            this.mz = _mz;
        }
    }
    protected Dictionary<int, Dictionary<string, ReacData>> _ListReacData = new Dictionary<int, Dictionary<string, ReacData>>();

    /// <summary> 反力データを読み込む </summary>
    private bool SetReacData(Dictionary<string, object> objJson)
    {
        bool OnChenge = false;
        try
        {
            if (!objJson.ContainsKey("reac"))
                return false;

            this._ListReacData.Clear();

            Dictionary<string, object> reac1 = objJson["reac"] as Dictionary<string, object>;
            foreach (string CaseNo in reac1.Keys)
            {
                try
                {
                    List<object> reac2 = reac1[CaseNo] as List<object>;

                    Dictionary<string, ReacData> tmp = new Dictionary<string, ReacData>();

                    for (int i = 0; i < reac2.Count; i++)
                    {
                        Dictionary<string, object> reac3 = reac2[i] as Dictionary<string, object>;

                        string n = reac3["id"].ToString();

                        double tx = ComonFunctions.ConvertToDouble(reac3["tx"]);
                        double ty = ComonFunctions.ConvertToDouble(reac3["ty"]);
                        double tz = ComonFunctions.ConvertToDouble(reac3["tz"]);
                        double mx = ComonFunctions.ConvertToDouble(reac3["mx"]);
                        double my = ComonFunctions.ConvertToDouble(reac3["my"]);
                        double mz = ComonFunctions.ConvertToDouble(reac3["mz"]);

                        ReacData ex = new ReacData(tx, ty, tz, mx, my, mz);
                        tmp.Add(n, ex);
                    }

                    int typ = ComonFunctions.ConvertToInt(CaseNo);
                    this._ListReacData.Add(typ, tmp);
                }
                catch
                {
                    continue;
                }
            }
            OnChenge = true;

        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetReacData");
            Debug.Log(e.Message);
        }
        return OnChenge;
    }

    #endregion

    #region  断面力データ
    public int FsecType = 1;

    public partial class FsecData
    {
        public double fx = 0.0;
        public double fy = 0.0;
        public double fz = 0.0;
        public double mx = 0.0;
        public double my = 0.0;
        public double mz = 0.0;
        public double L = 0.0;
        public FsecData(double _fx, double _fy, double _fz, double _mx, double _my, double _mz, double _L)
        {
            this.fx = _fx;
            this.fy = _fy;
            this.fz = _fz;
            this.mx = _mx;
            this.my = _my;
            this.mz = _mz;
            this.L = _L;
        }
    }

    protected Dictionary<int, Dictionary<string, SortedDictionary<int, FsecData>>> _ListFsecData 
        = new Dictionary<int, Dictionary<string, SortedDictionary<int, FsecData>>>();

    /// <summary> 断面力データを読み込む </summary>
    private bool SetFsecData(Dictionary<string, object> objJson)
    {
        bool OnChenge = false;
        try
        {
            if (!objJson.ContainsKey("fsec"))
                return false;

            this._ListFsecData.Clear();

            Dictionary<string, object> fsec1 = objJson["fsec"] as Dictionary<string, object>;
            foreach (string CaseNo in fsec1.Keys)
            {
                try
                {
                    List<object> fsec2 = fsec1[CaseNo] as List<object>;

                    Dictionary<string, SortedDictionary<int, FsecData>> tmp = new Dictionary<string, SortedDictionary<int, FsecData>>();
                    SortedDictionary<int, FsecData> member = new SortedDictionary<int, FsecData>();

                    string old_m = "";
                    for (int i = 0; i < fsec2.Count; i++)
                    {
                        Dictionary<string, object> fsec3 = fsec2[i] as Dictionary<string, object>;

                        int id = ComonFunctions.ConvertToInt(fsec3["row"]);

                        string m = fsec3["m"].ToString();
                        if (m == "")
                            m = old_m;
                        else
                            old_m = m;

                        double fx = ComonFunctions.ConvertToDouble(fsec3["fx"]);
                        double fy = ComonFunctions.ConvertToDouble(fsec3["fy"]);
                        double fz = ComonFunctions.ConvertToDouble(fsec3["fz"]);
                        double mx = ComonFunctions.ConvertToDouble(fsec3["mx"]);
                        double my = ComonFunctions.ConvertToDouble(fsec3["my"]);
                        double mz = ComonFunctions.ConvertToDouble(fsec3["mz"]);
                        double L = ComonFunctions.ConvertToDouble(fsec3["l"]);

                        FsecData ex = new FsecData( fx, fy, fz, mx, my, mz, L);
                        member.Add(id, ex);

                        if (tmp.ContainsKey(m))
                            tmp[m] = member;
                        else
                            tmp.Add(m, member);
                    }

                    int typ = ComonFunctions.ConvertToInt(CaseNo);
                    this._ListFsecData.Add(typ, tmp);
                }
                catch
                {
                    continue;
                }
            }
            OnChenge = true;

        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetFsecData");
            Debug.Log(e.Message);
        }
        return OnChenge;
    }

    #endregion

    /// <summary> データを作成する </summary>
    protected bool[] _SetData(string strJson, int mode = 0)
    {
        var OnChengeList = new bool[(int)InputModeType.Max];

        /* Jsonデータを読み込む */
        Dictionary<string, object> objJson = Json.Deserialize(strJson) as Dictionary<string, object>;

        if (objJson.Count == 0)
        {
            this.Clear();
            this.ResultDataClear();
            return OnChengeList;
        }

        /* 読み込んだデータをUnity内で使う用に編集・再定義 */
        // 格点データ
        OnChengeList[(int)InputModeType.Node] = SetNodePoint(objJson);
        // 属性データ
        OnChengeList[(int)InputModeType.Element] = SetElementData(objJson, mode);
        // 要素データ
        OnChengeList[(int)InputModeType.Member] = SetMemberData(objJson);
        // 着目点データ
        OnChengeList[(int)InputModeType.NoticePoints] = SetNoticePoint(objJson);
        //	パネルデータ
        OnChengeList[(int)InputModeType.Panel] = SetPanelData(objJson);
        //	支点データ
        OnChengeList[(int)InputModeType.FixNode] = SetFixNode(objJson, mode);
        //	バネデータ
        OnChengeList[(int)InputModeType.FixMember] = SetFixMember(objJson, mode);
        //	結合データ
        OnChengeList[(int)InputModeType.Joint] = SetJointData(objJson, mode);
        //	荷重データ
        OnChengeList[(int)InputModeType.Load] = SetLoadData(objJson, mode);
        // 変位量データ
        OnChengeList[(int)InputModeType.Disg] = SetDisgData(objJson);
        // 反力データ
        OnChengeList[(int)InputModeType.Reac] = SetReacData(objJson);
        // 断面力データ
        OnChengeList[(int)InputModeType.Fsec] = SetFsecData(objJson);

        return OnChengeList;
    }

}



