using UnityEngine;
using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;

/// <summary> 描画モード </summary>
public enum InputPanelLabel
{
    Node,               //	節点
    Member,             //	要素
    NoticePoints,       //　着目点
    Element,            //　材料
    Panel,              //	パネル
    FixNode,            //　支点
    FixMember,          //　バネ
    Joint,              //　結合
    Load,               //　荷重
    Disg,               //　変位量
    Reac,               //　反力
    Fsec,               //　断面力

    Max,

    None = -1,
}

/// <summary> 骨組応答解析データ </summary>
public class webframe : Singleton<webframe>
{
    #region 格点データ

    public Dictionary<int, Vector3> listNodePoint = new Dictionary<int, Vector3>();

    /// <summary> 格点データを読み込む </summary>
    public void SetNodePoint(Dictionary<string, object> objJson)
    {
        try
        {
            if (objJson.ContainsKey("node"))
            {
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
                        Vector3 xyz = new Vector3(x, y, z);
                        int id = int.Parse(key);
                        this.listNodePoint.Add(id, xyz);
                    }
                    catch
                    {
                        continue;
                    }
                }
            }
        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetNodePoint");
            Debug.Log(e.Message);
        }
    }

    #endregion

    #region 要素データ

    public class MemberData
    {
        public int ni = 0;  //	節点番号ｉ
        public int nj = 0;  //	節点番号ｊ
        public int e = 0;   //	Element番号
        public float cg = 0F;   //	コードアングル
        public MemberData(int _ni, int _nj, int _e, float _cg = 0F)
        {
            this.ni = _ni;
            this.nj = _nj;
            this.e = _e;
            this.cg = _cg;
        }

    }

    public Dictionary<int, MemberData> ListMemberData = new Dictionary<int, MemberData>();

    /// <summary> 要素データを読み込む </summary>
    public void SetMemberData(Dictionary<string, object> objJson)
    {
        try
        { 
            if (objJson.ContainsKey("member"))
            {
                this.ListMemberData.Clear();

                Dictionary<string, object> member1 = objJson["member"] as Dictionary<string, object>;
                foreach (string key in member1.Keys)
                {
                    try
                    {
                        Dictionary<string, object> member2 = member1[key] as Dictionary<string, object>;
                        int id = int.Parse(key);
                        int i = ComonFunctions.ConvertToInt(member2["ni"]);
                        int j = ComonFunctions.ConvertToInt(member2["nj"]);
                        int e = ComonFunctions.ConvertToInt(member2["e"], 1);
                        if (this.listNodePoint.ContainsKey(i)
                            && this.listNodePoint.ContainsKey(j))
                        {
                            MemberData ex = new MemberData(i, j, e);
                            this.ListMemberData.Add(id, ex);
                        }
                    }
                    catch
                    {
                        continue;
                    }
                }
            }
        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetMemberData");
            Debug.Log(e.Message);
        }
    }

    #endregion

    #region 着目点データ

    public Dictionary<int, List<float>> ListNoticePoint = new Dictionary<int, List<float>>();

    /// <summary> 着目点データを読み込む </summary>
    public void SetNoticePoint(Dictionary<string, object> objJson)
    {
        try {
            if (objJson.ContainsKey("notice_points"))
            {
                this.ListNoticePoint.Clear();

                List<object> notice1 = objJson["notice_points"] as List<object>;
                foreach (Dictionary<string, object> tmp in notice1)
                {
                    try
                    {
                        int id = ComonFunctions.ConvertToInt(tmp["m"]);
                        if (this.ListMemberData.ContainsKey(id))
                        {
                            List<object> pos1 = tmp["Points"] as List<object>;
                            List<float> pos2 = new List<float>();
                            foreach (var p in pos1)
                            {
                                if (p != null){
                                    float pos = ComonFunctions.ConvertToSingle(p, -1);
                                    if (pos > 0)
                                        pos2.Add(pos);
                                }
                            }
                            this.ListNoticePoint.Add(id, pos2);
                        }
                    }
                    catch
                    {
                        continue;
                    }
                }
            }
        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetNoticePoint");
            Debug.Log(e.Message);
        }
    }
    
    #endregion

    #region 属性データ

    public partial class ElementData
    {
        public float E = 0.0F;   //	ヤング率
        public float G = 0.0F;   //	せん断弾性係数
        public float Xp = 0.0F;  //	線膨張係数

        public float A = 0.0F;	//	断面積
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

    public Dictionary<int, Dictionary<int, ElementData>> ListElementData = new Dictionary<int, Dictionary<int, ElementData>>();

    /// <summary> 属性データを読み込む </summary>
    public void SetElementData(Dictionary<string, object> objJson)
    {
        try { 
            if (objJson.ContainsKey("element"))
            {
                this.ListElementData.Clear();

                Dictionary<string, object> element1 = objJson["element"] as Dictionary<string, object>;
                foreach (string key1 in element1.Keys)
                {
                    Dictionary<int, ElementData> tmp = new Dictionary<int, ElementData>();
                    try
                    {
                        Dictionary<string, object> element2 = element1[key1] as Dictionary<string, object>;
                        int id = int.Parse(key1);
                        foreach (string key2 in element2.Keys)
                        {
                            int type_no = int.Parse(key2);
                            Dictionary<string, object> element3 = element2[key2] as Dictionary<string, object>;
                            float E = ComonFunctions.ConvertToSingle(element3["E"]);
                            float G = ComonFunctions.ConvertToSingle(element3["G"]);
                            float Xp = ComonFunctions.ConvertToSingle(element3["Xp"]);
                            float A = ComonFunctions.ConvertToSingle(element3["A"]);
                            float J = ComonFunctions.ConvertToSingle(element3["J"]);
                            float Iz = ComonFunctions.ConvertToSingle(element3["Iz"]);
                            float Iy = ComonFunctions.ConvertToSingle(element3["Iy"]);
                            ElementData e = new ElementData(E, G, Xp, A, J, Iz, Iy);
                            tmp.Add(type_no, e);
                        }
                        this.ListElementData.Add(id, tmp);
                    }
                    catch
                    {
                        continue;
                    }
                }
            }
        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetElementData");
            Debug.Log(e.Message);
        }
    }

    #endregion

    #region パネルデータ

    public class PanelData
    {
        public int no1 = 0; // 構成節点No1
        public int no2 = 0; // 構成節点No2
        public int no3 = 0;	// 構成節点No3
        public int e = 0;   // Element番号

        public PanelData(int _no1, int _no2, int _no3, int _e)
        {
            this.no1 = _no1;
            this.no2 = _no2;
            this.no3 = _no3;
            this.e = _e;
        }
    }

    public Dictionary<int, PanelData> ListPanelData = new Dictionary<int, PanelData>();

    /// <summary> パネルデータを読み込む </summary>
    public void SetPanelData(Dictionary<string, object> objJson)
    {
        try { 
            if (objJson.ContainsKey("panel"))
            {
                this.ListPanelData.Clear();

                Dictionary<string, object> panel1 = objJson["panel"] as Dictionary<string, object>;
                foreach (string key in panel1.Keys)
                {
                    try
                    {
                        Dictionary<string, object> panel2 = panel1[key] as Dictionary<string, object>;
                        int id = int.Parse(key);
                        int n1 = ComonFunctions.ConvertToInt(panel2["no1"]);
                        int n2 = ComonFunctions.ConvertToInt(panel2["no2"]);
                        int n3 = ComonFunctions.ConvertToInt(panel2["no3"]);
                        int e = ComonFunctions.ConvertToInt(panel2["e"], 1);
                        if (this.listNodePoint.ContainsKey(n1)
                            && this.listNodePoint.ContainsKey(n2)
                            && this.listNodePoint.ContainsKey(n3))
                        {
                            PanelData ex = new PanelData(n1, n2, n3, e);
                            this.ListPanelData.Add(id, ex);
                        }
                    }
                    catch
                    {
                        continue;
                    }
                }
            }
        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetPanelData");
            Debug.Log(e.Message);
        }
    }

    #endregion

    #region 支点データ

    public partial class FixNodeData
    {
        public double tx = 0.0;
        public double ty = 0.0;
        public double tz = 0.0;
        public double rx = 0.0;
        public double ry = 0.0;
        public double rz = 0.0;
        public FixNodeData(double _tx, double _ty, double _tz, double _rx, double _ry, double _rz)
        {
            this.tx = _tx;
            this.ty = _ty;
            this.tz = _tz;
            this.rx = _rx;
            this.ry = _ry;
            this.rz = _rz;
        }
    }

    public Dictionary<int, Dictionary<int, FixNodeData>> ListFixNode = new Dictionary<int, Dictionary<int, FixNodeData>>();

    /// <summary> 支点データを読み込む </summary>
    public void SetFixNode(Dictionary<string, object> objJson)
    {
        try { 
            if (objJson.ContainsKey("fix_node"))
            {
                this.ListFixNode.Clear();

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

                            int id = Convert.ToInt32(fix_node3["n"]);

                            if (this.listNodePoint.ContainsKey(id) == false)
                                continue;

                            double tx = ComonFunctions.ConvertToDouble(fix_node3["tx"]);
                            double ty = ComonFunctions.ConvertToDouble(fix_node3["ty"]);
                            double tz = ComonFunctions.ConvertToDouble(fix_node3["tz"]);
                            double rx = ComonFunctions.ConvertToDouble(fix_node3["rx"]);
                            double ry = ComonFunctions.ConvertToDouble(fix_node3["ry"]);
                            double rz = ComonFunctions.ConvertToDouble(fix_node3["rz"]);

                            FixNodeData ex = new FixNodeData(tx, ty, tz, rx, ry, rz);
                            if (tmp.ContainsKey(id) == true)
                            {
                                ex.tx += tmp[id].tx;
                                ex.ty += tmp[id].ty;
                                ex.tz += tmp[id].tz;
                                ex.rx += tmp[id].rx;
                                ex.ry += tmp[id].ry;
                                ex.rz += tmp[id].rz;
                                tmp[id] = ex;
                            }
                            else
                            {
                                tmp.Add(id, ex);
                            }
                        }
                        this.ListFixNode.Add(typ, tmp);
                    }
                    catch
                    {
                        continue;
                    }
                }
            }
        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetFixNode");
            Debug.Log(e.Message);
        }
    }

    #endregion

    #region バネデータ

    public partial class FixMemberData
    {
        public double tx = 0.0;
        public double ty = 0.0;
        public double tz = 0.0;
        public double tr = 0.0;
        public FixMemberData(double _tx, double _ty, double _tz, double _tr)
        {
            this.tx = _tx;
            this.ty = _ty;
            this.tz = _tz;
            this.tr = _tr;
        }
    }

    public Dictionary<int, Dictionary<int, FixMemberData>> ListFixMember = new Dictionary<int, Dictionary<int, FixMemberData>>();

    /// <summary> 支点データを読み込む </summary>
    public void SetFixMember(Dictionary<string, object> objJson)
    {
        try { 
            if (objJson.ContainsKey("fix_member"))
            {
                this.ListFixMember.Clear();

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

                            int id = ComonFunctions.ConvertToInt(fix_member3["m"]);

                            if (this.ListMemberData.ContainsKey(id) == false)
                                continue;

                            double tx = ComonFunctions.ConvertToDouble(fix_member3["tx"]);
                            double ty = ComonFunctions.ConvertToDouble(fix_member3["ty"]);
                            double tz = ComonFunctions.ConvertToDouble(fix_member3["tz"]);
                            double tr = ComonFunctions.ConvertToDouble(fix_member3["tr"]);

                            FixMemberData ex = new FixMemberData(tx, ty, tz, tr);
                            if (tmp.ContainsKey(id) == true)
                            {
                                ex.tx += tmp[id].tx;
                                ex.ty += tmp[id].ty;
                                ex.tz += tmp[id].tz;
                                ex.tr += tmp[id].tr;
                                tmp[id] = ex;
                            }
                            else
                            {
                                tmp.Add(id, ex);
                            }
                        }
                        this.ListFixMember.Add(typ, tmp);
                    }
                    catch
                    {
                        continue;
                    }
                }
            }
        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetFixMember");
            Debug.Log(e.Message);
        }
    }

    #endregion

    #region 結合データ

    public partial class JointData
    {
        public int xi = 1;
        public int yi = 1;
        public int zi = 1;
        public int xj = 1;
        public int yj = 1;
        public int zj = 1;
        public JointData(int _xi, int _yi, int _zi, int _xj, int _yj, int _zj)
        {
            this.xi = _xi;
            this.yi = _yi;
            this.zi = _zi;
            this.xj = _xj;
            this.yj = _yj;
            this.zj = _zj;
        }
    }

    public Dictionary<int, Dictionary<int, JointData>> ListJointData = new Dictionary<int, Dictionary<int, JointData>>();

    /// <summary> 支点データを読み込む </summary>
    public void SetJointData(Dictionary<string, object> objJson)
    {

        try {
            if (objJson.ContainsKey("joint"))
            {
                this.ListJointData.Clear();

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

                            int id = ComonFunctions.ConvertToInt(joint3["m"]);

                            if (this.ListMemberData.ContainsKey(id) == false)
                                continue;

                            int xi = ComonFunctions.ConvertToInt(joint3["xi"]);
                            int yi = ComonFunctions.ConvertToInt(joint3["yi"]);
                            int zi = ComonFunctions.ConvertToInt(joint3["zi"]);
                            int xj = ComonFunctions.ConvertToInt(joint3["xj"]);
                            int yj = ComonFunctions.ConvertToInt(joint3["yj"]);
                            int zj = ComonFunctions.ConvertToInt(joint3["zj"]);

                            JointData ex = new JointData(xi, yi, zi, xj, yj, zj);
                            if (tmp.ContainsKey(id) == true)
                            {
                                tmp[id] = ex;
                            }
                            else
                            {
                                tmp.Add(id, ex);
                            }
                        }
                        this.ListJointData.Add(typ, tmp);
                    }
                    catch
                    {
                        continue;
                    }
                }
            }

        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetJointData");
            Debug.Log(e.Message);
        }
    }

    #endregion

    #region 荷重データ

    public partial class LoadData
    {
        public int fix_node = 1;
        public int fix_member = 1;
        public int element = 1;
        public int joint = 1;
        public List<LoadNodeData> load_node;
        public List<LoadMemberData> load_member;
    }

    public partial class LoadNodeData
    {
        public int n = 0;
        public double tx = 0.0;
        public double ty = 0.0;
        public double tz = 0.0;
        public double rx = 0.0;
        public double ry = 0.0;
        public double rz = 0.0;
        public LoadNodeData(int _n, double _tx, double _ty, double _tz, double _rx, double _ry, double _rz)
        {
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
        public int m = 0;
        public string direction = "";
        public int mark = 0;
        public double L1 = 0.0;
        public double L2 = 0.0;
        public double P1 = 0.0;
        public double P2 = 0.0;
        public LoadMemberData(int _m, string _direction, int _mark, double _L1, double _L2, double _P1, double _P2)
        {
            this.m = _m;
            this.direction = _direction;
            this.mark = _mark;
            this.L1 = _L1;
            this.L2 = _L2;
            this.P1 = _P1;
            this.P2 = _P2;
        }
    }

    public Dictionary<int, LoadData> ListLoadData = new Dictionary<int, LoadData>();

    /// <summary> 荷重データを読み込む </summary>
    public void SetLoadData(Dictionary<string, object> objJson)
    {

        try { 
            if (objJson.ContainsKey("load"))
            {
                this.ListLoadData.Clear();

                Dictionary<string, object> load1 = objJson["load"] as Dictionary<string, object>;
                foreach (string key1 in load1.Keys)
                {
                    LoadData tmp = new LoadData();
                    int caseNo = int.Parse(key1);
                    Dictionary<string, object> load2 = load1[key1] as Dictionary<string, object>;

                    int fix_node = ComonFunctions.ConvertToInt(load2["fix_node"],1);
                    int fix_member = ComonFunctions.ConvertToInt(load2["fix_member"],1);
                    int element = ComonFunctions.ConvertToInt(load2["element"],1);
                    int joint = ComonFunctions.ConvertToInt(load2["joint"],1);

                    List<LoadNodeData> load_node = new List<LoadNodeData>();
                    if (load2.ContainsKey("load_node"))
                    {
                        try { 
                            List<object> load3 = load2["load_node"] as List<object>;
                            foreach (Dictionary<string, object> ln in load3)
                            {
                                int id = ComonFunctions.ConvertToInt(ln["n"]);

                                if (this.listNodePoint.ContainsKey(id) == false)
                                    continue;

                                double tx = ComonFunctions.ConvertToDouble(ln["tx"]);
                                double ty = ComonFunctions.ConvertToDouble(ln["ty"]);
                                double tz = ComonFunctions.ConvertToDouble(ln["tz"]);
                                double rx = ComonFunctions.ConvertToDouble(ln["rx"]);
                                double ry = ComonFunctions.ConvertToDouble(ln["ry"]);
                                double rz = ComonFunctions.ConvertToDouble(ln["rz"]);

                                LoadNodeData ex = new LoadNodeData(id, tx, ty, tz, rx, ry, rz);
                                load_node.Add(ex);
                            }
                        }
                        catch (Exception e)
                        {
                            Debug.Log("Error!! at webframe SetLoadNodeData");
                            Debug.Log(e.Message);
                            return;
                        }
                    }
                    tmp.load_node = load_node;

                    List<LoadMemberData> load_member = new List<LoadMemberData>();
                    if (load2.ContainsKey("load_member"))
                    {
                        try { 
                            List<object> load3 = load2["load_member"] as List<object>;
                            foreach (Dictionary<string, object> lm in load3)
                            {
                                int id = ComonFunctions.ConvertToInt(lm["m"]);

                                if (this.ListMemberData.ContainsKey(id) == false)
                                    continue;

                                string direction = lm["direction"].ToString();
                                int mark = ComonFunctions.ConvertToInt(lm["mark"]);
                                double L1 = ComonFunctions.ConvertToDouble(lm["L1"]);
                                double L2 = ComonFunctions.ConvertToDouble(lm["L2"]);
                                double P1 = ComonFunctions.ConvertToDouble(lm["P1"]);
                                double P2 = ComonFunctions.ConvertToDouble(lm["P2"]);

                                LoadMemberData ex = new LoadMemberData(id, direction, mark, L1, L2, P1, P2);
                                load_member.Add(ex);
                            }
                        }
                        catch (Exception e)
                        {
                            Debug.Log("Error!! at webframe SetLoadMemberData");
                            Debug.Log(e.Message);
                            return;
                        }
                    }
                    tmp.load_member = load_member;

                    this.ListLoadData.Add(caseNo, tmp);
                }
            }
        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetLoadData");
            Debug.Log(e.Message);
        }
    }

    #endregion

    #region 変位量データ

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
    public Dictionary<int, DisgData> ListDisgData = new Dictionary<int, DisgData>();

    /// <summary> 変位量データを読み込む </summary>
    public void SetDisgData(Dictionary<string, object> objJson)
    {
        try { 

            if (objJson.ContainsKey("disg"))
            {
                this.ListDisgData.Clear();

                Dictionary<string, object> disg1 = objJson["disg"] as Dictionary<string, object>;
                foreach (string key in disg1.Keys)
                {
                    try
                    {
                        Dictionary<string, object> disg2 = disg1[key] as Dictionary<string, object>;

                        int id = int.Parse(key);

                        if (this.listNodePoint.ContainsKey(id))
                        {
                            double dx = ComonFunctions.ConvertToDouble(disg2["dx"]);
                            double dy = ComonFunctions.ConvertToDouble(disg2["dy"]);
                            double dz = ComonFunctions.ConvertToDouble(disg2["dz"]);
                            double rx = ComonFunctions.ConvertToDouble(disg2["rx"]);
                            double ry = ComonFunctions.ConvertToDouble(disg2["ry"]);
                            double rz = ComonFunctions.ConvertToDouble(disg2["rz"]);

                            DisgData ex = new DisgData(dx, dy, dz, rx, ry, rz);
                            this.ListDisgData.Add(id, ex);
                        }
                    }
                    catch
                    {
                        continue;
                    }
                }
            }

        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetDisgData");
            Debug.Log(e.Message);
        }
    }

    #endregion

    #region  反力データ

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
    public Dictionary<int, ReacData> ListReacData = new Dictionary<int, ReacData>();

    /// <summary> 反力データを読み込む </summary>
    public void SetReacData(Dictionary<string, object> objJson)
    {
        try { 

            if (objJson.ContainsKey("reac"))
            {
                this.ListReacData.Clear();

                Dictionary<string, object> reac1 = objJson["reac"] as Dictionary<string, object>;
                foreach (string key in reac1.Keys)
                {
                    try
                    {
                        Dictionary<string, object> reac2 = reac1[key] as Dictionary<string, object>;

                        int id = int.Parse(key);

                        if (this.listNodePoint.ContainsKey(id))
                        {
                            double tx = ComonFunctions.ConvertToDouble(reac2["tx"]);
                            double ty = ComonFunctions.ConvertToDouble(reac2["ty"]);
                            double tz = ComonFunctions.ConvertToDouble(reac2["tz"]);
                            double mx = ComonFunctions.ConvertToDouble(reac2["mx"]);
                            double my = ComonFunctions.ConvertToDouble(reac2["my"]);
                            double mz = ComonFunctions.ConvertToDouble(reac2["mz"]);

                            ReacData ex = new ReacData(tx, ty, tz, mx, my, mz);
                            this.ListReacData.Add(id, ex);
                        }
                    }
                    catch
                    {
                        continue;
                    }
                }
            }
        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetReacData");
            Debug.Log(e.Message);
        }
    }

    #endregion

    #region  断面力データ

    public partial class FsecData
    {
        public double fxi = 0.0;
        public double fyi = 0.0;
        public double fzi = 0.0;
        public double mxi = 0.0;
        public double myi = 0.0;
        public double mzi = 0.0;
        public double fxj = 0.0;
        public double fyj = 0.0;
        public double fzj = 0.0;
        public double mxj = 0.0;
        public double myj = 0.0;
        public double mzj = 0.0;
        public double L = 0.0;
        public FsecData(double _fxi, double _fyi, double _fzi, double _mxi, double _myi, double _mzi, 
            double _fxj, double _fyj, double _fzj, double _mxj, double _myj, double _mzj, double _L)
        {
            this.fxi = _fxi;
            this.fyi = _fyi;
            this.fzi = _fzi;
            this.mxi = _mxi;
            this.myi = _myi;
            this.mzi = _mzi;
            this.fxj = _fxj;
            this.fyj = _fyj;
            this.fzj = _fzj;
            this.mxj = _mxj;
            this.myj = _myj;
            this.mzj = _mzj;
            this.L = _L;
        }
    }

    public Dictionary<int, Dictionary<string, FsecData>> ListFsecData = new Dictionary<int, Dictionary<string, FsecData>>();

    /// <summary> 断面力データを読み込む </summary>
    public void SetFsecData(Dictionary<string, object> objJson)
    {
        try { 

            if (objJson.ContainsKey("fsec"))
            {
                this.ListFsecData.Clear();

                Dictionary<string, object> fsec1 = objJson["fsec"] as Dictionary<string, object>;
                foreach (string key1 in fsec1.Keys)
                {
                    Dictionary<string, FsecData> tmp = new Dictionary<string, FsecData>();
                    try
                    {
                        Dictionary<string, object> fsec2 = fsec1[key1] as Dictionary<string, object>;

                        int id = int.Parse(key1);

                        foreach (string key2 in fsec2.Keys)
                        {
                            Dictionary<string, object> fsec3 = fsec2[key2] as Dictionary<string, object>;

                            double fxi = ComonFunctions.ConvertToDouble(fsec3["fxi"]);
                            double fyi = ComonFunctions.ConvertToDouble(fsec3["fyi"]);
                            double fzi = ComonFunctions.ConvertToDouble(fsec3["fzi"]);
                            double mxi = ComonFunctions.ConvertToDouble(fsec3["mxi"]);
                            double myi = ComonFunctions.ConvertToDouble(fsec3["myi"]);
                            double mzi = ComonFunctions.ConvertToDouble(fsec3["mzi"]);
                            double fxj = ComonFunctions.ConvertToDouble(fsec3["fxj"]);
                            double fyj = ComonFunctions.ConvertToDouble(fsec3["fyj"]);
                            double fzj = ComonFunctions.ConvertToDouble(fsec3["fzj"]);
                            double mxj = ComonFunctions.ConvertToDouble(fsec3["mxj"]);
                            double myj = ComonFunctions.ConvertToDouble(fsec3["myj"]);
                            double mzj = ComonFunctions.ConvertToDouble(fsec3["mzj"]);
                            double L = ComonFunctions.ConvertToDouble(fsec3["L"]);

                            FsecData f = new FsecData(fxi, fyi, fzi, mxi, myi, mzi, fxj, fyj, fzj, mxj, myj, mzj, L);

                            tmp.Add(key2, f);
                        }
                        this.ListFsecData.Add(id, tmp);
                    }
                    catch
                    {
                        continue;
                    }
                }
            }

        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetFsecData");
            Debug.Log(e.Message);
        }
    }

    #endregion


    public bool SetDataFlag = false;

    /// <summary> データを作成する </summary>
    public void SetData(string strJson)
    {
        /* Jsonデータを読み込む */
        Dictionary<string, object> objJson;
        try {
            objJson = Json.Deserialize(strJson) as Dictionary<string, object>;
        }
        catch (Exception e)
        {
            Debug.Log("Error!! at webframe SetData Json.Deserialize");
            Debug.Log(e.Message);
            return;
        }

        /* 読み込んだデータをUnity内で使う用に編集・再定義 */
        // 格点データ
        SetNodePoint(objJson);
        // 属性データ
        SetElementData(objJson);
        // 要素データ
        SetMemberData(objJson);
        // 着目点データ
        SetNoticePoint(objJson);
        //	パネルデータ
        SetPanelData(objJson);
        //	支点データ
        SetFixNode(objJson);
        //	バネデータ
        SetFixMember(objJson);
        //	結合データ
        SetJointData(objJson);
        //	荷重データ
        SetLoadData(objJson);
        // 変位量データ
        SetDisgData(objJson);
        // 反力データ
        SetReacData(objJson);
        // 断面力データ
        SetFsecData(objJson);

        SetDataFlag = true;
    }

    #region データヘルパー

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

    #endregion


}



