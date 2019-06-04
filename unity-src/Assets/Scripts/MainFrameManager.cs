using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;
using UnityEngine.UI;
using UnityEditor;

/// <summary>
/// 
/// </summary>
public class MainFrameManager : MonoBehaviour
{

    FrameDataService _webframe = null;

    #region 表示モード制御用

    private InputModeType inputMode = InputModeType.None;

    //	表示用ワークバッファ
    class PartsDispWork
    {
        public GameObject partsGameObject;
        public PartsDispManager partsDispManager;
    }

    [SerializeField]
    GameObject[] _dispPrefabs = new GameObject[(int)InputModeType.Max];

    PartsDispWork[] _partsDispWorks = new PartsDispWork[(int)InputModeType.Max];

    GameObject MyToggle;

    /// <summary>
    /// 表示用オブジェクトのインスタンス化
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="dispObject"></param>
    /// <param name="dispManager"></param>
    void InstantiateDispPrefab(out PartsDispWork partsDispWork, GameObject baseObject)
    {
        partsDispWork = new PartsDispWork();
        if (baseObject == null)
        {
            return;
        }

        partsDispWork.partsGameObject = Instantiate(baseObject) as GameObject;
        partsDispWork.partsGameObject.transform.parent = this.gameObject.transform;

        partsDispWork.partsDispManager = partsDispWork.partsGameObject.GetComponent<PartsDispManager>();
    }

    /// <summary>
    /// プレハブをインスタンス化
    /// </summary>
    void InstantiatePrefab()
    {
        int i;

        for (i = 0; i < _partsDispWorks.Length; i++)
        {
            InstantiateDispPrefab(out _partsDispWorks[i], _dispPrefabs[i]);
        }
    }

    /// <summary> 初期化 </summary>
    void Start()
    {
#if !UNITY_EDITOR && UNITY_WEBGL
        WebGLInput.captureAllKeyboardInput = false;
#endif

        this._webframe = FrameDataService.Instance;

        //	描画マネージャを起動する
        InstantiatePrefab();

        // Fsec モード時の トグルボタン
        this.MyToggle = GameObject.Find("Toggle");
        this.MyToggle.SetActive(false);
    }

    #endregion

    #region マウスの制御

    /// <summary>
    /// マウスの制御
    /// </summary>
    void InputMouse()
    {
        if (this.inputMode == InputModeType.None)
        {
            return;
        }

        PartsDispWork partsDispWork = _partsDispWorks[(int)this.inputMode];

        if (partsDispWork == null)
            return;
        if (partsDispWork.partsGameObject == null)
            return;
        if (partsDispWork.partsGameObject.activeSelf == false)
            return;
        if (partsDispWork.partsDispManager == null)
            return;

        partsDispWork.partsDispManager.InputMouse();
    }


    /// <summary>
    /// 
    /// </summary>
    void Update()
    {
        InputMouse();
    }

    #endregion

    #region 描画パーツの表示制御

    /// <summary>
    /// 描画パーツの作成
    /// </summary>
    public void CreateParts()
    {
        //	パーツの作成
        for (int i = 0; i < _partsDispWorks.Length; i++)
        {
            if (_partsDispWorks[i].partsDispManager == null)
                continue;

            _partsDispWorks[i].partsDispManager.CreateParts();

        }
    }

    /// <summary> 全部のブロックのプロパティを初期化する </summary>
    public void SetAllBlockStatus()
    {
        //	全て設定する
        for (int i = 0; i < _partsDispWorks.Length; i++)
        {

            if (_partsDispWorks[i].partsDispManager == null)
                continue;

            _partsDispWorks[i].partsDispManager.SetBlockStatusAll();
        }
    }

    /// <summary>
    /// 断面力(Fsec)表示モードにおいて トグルボタンにより表示モードを変える
    /// </summary>
    public void ToggleOnChange()
    {
        if (this.inputMode != InputModeType.Fsec)
        {
            this.MyToggle.SetActive(false);
            return;
        }

        FsecDispManager f = _partsDispWorks[9].partsDispManager as FsecDispManager;

        ToggleGroup toggleGroup = this.MyToggle.GetComponent<ToggleGroup>();
        Toggle[] Toggles = toggleGroup.GetComponentsInChildren<Toggle>();
        foreach (Toggle toggle in Toggles)
        {
            if (toggle.isOn != true)
                continue;
            switch (toggle.name)
            {
                case "fx":
                    f.ChangeDispMode(FsecDispManager.DispType.fx);
                    break;
                case "fy":
                    f.ChangeDispMode(FsecDispManager.DispType.fy);
                    break;
                case "fz":
                    f.ChangeDispMode(FsecDispManager.DispType.fz);
                    break;
                case "mx":
                    f.ChangeDispMode(FsecDispManager.DispType.mx);
                    break;
                case "my":
                    f.ChangeDispMode(FsecDispManager.DispType.my);
                    break;
                case "mz":
                    f.ChangeDispMode(FsecDispManager.DispType.mz);
                    break;
            }
        }
        _partsDispWorks[9].partsDispManager.SetBlockStatusAll();
    }

    #endregion

    #region  JavaScript から 表示モードの変更通知が来た 

    public void InputModeChange(InputModeType ModeId)
    {
        if (this.inputMode != ModeId)
        {
            this.SetActiveDispManager(ModeId);
            this.inputMode = ModeId;
        }
    }

    public void InputTypeChange(InputModeType ModeId, int TypeNo)
    {
        this.InputModeChange(ModeId);

        // ゲームオブジェクトを変更します。
        PartsDispWork partsDispWork = _partsDispWorks[(int)this.inputMode];

        if (partsDispWork.partsDispManager == null)
            return;

        partsDispWork.partsDispManager.ChangeTypeNo(TypeNo);
        partsDispWork.partsDispManager.CreateParts();
        partsDispWork.partsDispManager.SetBlockStatusAll();
    }

    /// <summary>
    /// アクティブな表示モードを切り替える
    /// </summary>
    /// <param name="label"></param>

    public void SetActiveDispManager(InputModeType label)
    {
        Debug.Log(string.Format("Unity 表示モードを切り替えます:{0}", label));

        try
        {
            for (int i = 0; i < _partsDispWorks.Length; i++)
            {
                if (_partsDispWorks[i] == null)
                    continue;
                if (_partsDispWorks[i].partsGameObject == null)
                    continue;

                switch ((InputModeType)i)
                {
                    case InputModeType.Node:
                        //	格点は非表示にせずに表示モードを切り替える
                        NodeDispManager n = _partsDispWorks[i].partsDispManager as NodeDispManager;
                        if (label == InputModeType.Node)
                            n.ChangeDispMode(NodeDispManager.DispType.Block);
                        else if (label == InputModeType.Disg)
                            n.ChangeDispMode(NodeDispManager.DispType.Disg);
                        else
                            n.ChangeDispMode(NodeDispManager.DispType.Dot);
                        break;

                    case InputModeType.Member:
                        //	要素は非表示にせずに表示モードを切り替える
                        if (label == InputModeType.Element)
                            _partsDispWorks[i].partsGameObject.SetActive(false);
                        else
                        {
                            _partsDispWorks[i].partsGameObject.SetActive(true);
                            MemberDispManager m = _partsDispWorks[i].partsDispManager as MemberDispManager;
                            if (label == InputModeType.Member)
                                m.ChangeDispMode(MemberDispManager.DispType.Block);
                            else if(label == InputModeType.Disg)
                                m.ChangeDispMode(MemberDispManager.DispType.Disg);
                            else
                                m.ChangeDispMode(MemberDispManager.DispType.Line);
                        }
                        break;

                    default:
                        _partsDispWorks[i].partsGameObject.SetActive((InputModeType)i == label);
                        break;
                }
            }
            // 画面右下のToggleボタンの表示
            if(this.MyToggle != null) { 
                if (label == InputModeType.Fsec)
                    this.MyToggle.SetActive(true);
                else
                    this.MyToggle.SetActive(false);
            }
        }
        catch (Exception e)
        {
            Debug.Log("MainFrameManager SetActiveDispManager エラー!!");
            Debug.Log(e.Message);
        }
    }

    #endregion

    #region JavaScript から インプットデータ の変更通知が来た 

    public void InputDataClear()
    {
        // jsonデータを読み込みます
        this._webframe.Clear();

        // ゲームオブジェクトを生成します。
        this.CreateParts();
    }

    public void InputDataChenge(string json)
    {
        // jsonデータを読み込みます
        this._webframe.SetData(json);

        // ゲームオブジェクトを生成します。
        this.CreateParts();

        // 生成したオブジェクトのステータスを初期化します。
        this.SetAllBlockStatus();

        // 表示モードが不明な場合
        if (this.inputMode == InputModeType.None)
        {
            // 表示モードを問い合わせます。
            ExternalConnect.SendAngular("GetInputMode");
        }
    }

    /// <summary> JavaScript から インプットデータ の変更通知が来た </summary>
    public void InputModeDataChenge(string json)
    {
        if (this.inputMode == InputModeType.None)
        {
            ExternalConnect.SendAngular("GetInputMode");
            return;
        }

        // jsonデータを読み込みます
        this._webframe.SetData(json, 1);

        // ゲームオブジェクトを変更します。
        PartsDispWork partsDispWork = _partsDispWorks[(int)this.inputMode];

        if (partsDispWork.partsDispManager == null)
            return;

        partsDispWork.partsDispManager.CreateParts();

        // 節点に変更があった場合 他のオブジェクトに影響する
        if (this.inputMode == InputModeType.Node)
        {
            this.SetAllBlockStatus();
        }
        else
        {
            partsDispWork.partsDispManager.SetBlockStatusAll();
        }
    }

    /// <summary> JavaScript から 計算結果データ が来た </summary>
    public void ResultDataChenge(string json)
    {
        // jsonデータを読み込みます
        this._webframe.SetData(json);

    }

    #endregion

    #region JavaScript から Active Item の変更通知が来た 

    public void SelectItemChange(int i)
    {
        if (this.inputMode == InputModeType.None)
        {
            ExternalConnect.SendAngular("GetInputMode");
            return;
        }

        PartsDispWork partsDispWork = _partsDispWorks[(int)this.inputMode];
        partsDispWork.partsDispManager.ChengeForcuseBlock(i);
    }

    #endregion

}
