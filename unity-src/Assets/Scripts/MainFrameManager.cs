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
	public enum InputModeType {
    nodes,
    members,
    panels,
    fix_nodes,
    elements,
    joints,
    notice_points,
    fix_members,
    loads,
    fsec,
    comb_fsec,
    disg,
    comb_disg,
    reac,
    comb_reac
  }

  webframe _webframe = null;

    #region 表示モード制御用

    private InputPanelLabel inputMode = InputPanelLabel.None;

    //	表示用ワークバッファ
    class PartsDispWork
    {
		public	GameObject			partsGameObject;
		public	PartsDispManager	partsDispManager;
	}

	[SerializeField]
	GameObject[]			        _dispPrefabs = new GameObject[(int)InputPanelLabel.Max];

    PartsDispWork[]					_partsDispWorks = new PartsDispWork[(int)InputPanelLabel.Max];


    /// <summary>
    /// 表示用オブジェクトのインスタンス化
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="dispObject"></param>
    /// <param name="dispManager"></param>
    void InstantiateDispPrefab( out PartsDispWork partsDispWork, GameObject baseObject )
	{
		partsDispWork = new PartsDispWork();
		if( baseObject == null ) {
			return;
		}

		partsDispWork.partsGameObject = Instantiate( baseObject ) as GameObject;
		partsDispWork.partsGameObject.transform.parent = this.gameObject.transform;

		partsDispWork.partsDispManager = partsDispWork.partsGameObject.GetComponent<PartsDispManager>();
	}

	/// <summary>
	/// プレハブをインスタンス化
	/// </summary>
	void	InstantiatePrefab()
	{
		int		i;

		for( i=0; i<_partsDispWorks.Length; i++ ){
			InstantiateDispPrefab( out _partsDispWorks[i], _dispPrefabs[i] );	
		}
	}

    /// <summary> 初期化 </summary>
    void Start()
    {
        #if !UNITY_EDITOR && UNITY_WEBGL
        WebGLInput.captureAllKeyboardInput = false;
        #endif

        this._webframe = webframe.Instance;

        //	描画マネージャを起動する
        InstantiatePrefab();

    }

    #endregion

    #region マウスの制御

    /// <summary>
    /// マウスの制御
    /// </summary>
    void InputMouse()
	{
		if( this.inputMode == InputPanelLabel.None ) {
			return;
		}

		PartsDispWork	partsDispWork = _partsDispWorks[(int)this.inputMode];
		
		if( partsDispWork.partsGameObject == null ) {
			return;
		}
		if( partsDispWork.partsGameObject.activeSelf == false ){
			return;
		}
		if( partsDispWork.partsDispManager == null ){
			return;
		}
			
		partsDispWork.partsDispManager.InputMouse();
	}


	/// <summary>
	/// 
	/// </summary>
	void Update ()
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
        for (int i = 0; i < _partsDispWorks.Length; i++){
            if (_partsDispWorks[i].partsDispManager == null){
                continue;
            }
            _partsDispWorks[i].partsDispManager.CreateParts();
            //if ((InputPanelLabel)i != InputPanelLabel.Member){          // 要素は常に表示             
            //    _partsDispWorks[i].partsGameObject.SetActive(true);    // 最初は全部無効にしておく
            //}
        }
    }

    /// <summary> 全部のブロックのプロパティを初期化する </summary>
    public void	SetAllBlockStatus()
	{
		//	全て設定する
        for (int i = 0; i < _partsDispWorks.Length; i++){

            if (_partsDispWorks[i].partsDispManager == null)
                continue;

            if ((InputPanelLabel)i == InputPanelLabel.Node) {
                NodeDispManager n = _partsDispWorks[i].partsDispManager as NodeDispManager;
                n.CalcNodeBlockScale();
             }

            _partsDispWorks[i].partsDispManager.SetBlockStatusAll();
        }
	}

    #endregion

    #region  JavaScript から 表示モードの変更通知が来た 

    public void InputModeChange(InputModeType inputModeType)
    {
        InputPanelLabel ModeId = GetModeId(inputModeType);
        if (this.inputMode != ModeId)
        {
            this.SetActiveDispManager(ModeId);
            this.inputMode = ModeId;
        }
    }

    private InputPanelLabel GetModeId(InputModeType inputModeType)
    {
        InputPanelLabel result = InputPanelLabel.Node;
        switch (inputModeType)
        {
			case InputModeType.nodes:
                result = InputPanelLabel.Node;
                break;

            case InputModeType.members:
                result = InputPanelLabel.Member;
                break;

            case InputModeType.panels:
                result = InputPanelLabel.Panel;
                break;

            case InputModeType.fix_nodes:
                result = InputPanelLabel.FixNode;
                break;

            case InputModeType.elements:
                result = InputPanelLabel.Element;
                break;

            case InputModeType.joints:
                result = InputPanelLabel.Joint;
                break;

            case InputModeType.notice_points:
                result = InputPanelLabel.NoticePoints;
                break;

            case InputModeType.fix_members:
                result = InputPanelLabel.FixMember;
                break;

            case InputModeType.loads:
                result = InputPanelLabel.Load;
                break;

            case InputModeType.fsec:
            case InputModeType.comb_fsec:
                result = InputPanelLabel.Fsec;
                break;

            case InputModeType.disg:
            case InputModeType.comb_disg:
                result = InputPanelLabel.Disg;
                break;

            case InputModeType.reac:
            case InputModeType.comb_reac:
                result = InputPanelLabel.Reac;
                break;

            default:
                result = InputPanelLabel.None;
                break;
        }
        return result;
    }

    /// <summary>
    /// アクティブな表示モードを切り替える
    /// </summary>
    /// <param name="label"></param>

    public void SetActiveDispManager(InputPanelLabel label)
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
                if ((InputPanelLabel)i == InputPanelLabel.Member)
                {
                    //	要素の時は非表示にせずに表示モードを切り替える
                    MemberDispManager m = _partsDispWorks[i].partsDispManager as MemberDispManager;

                    if (label == InputPanelLabel.Member)
                        m.ChangeDispMode(MemberDispManager.DispType.Block);
                    else if (label != InputPanelLabel.Element)
                        m.ChangeDispMode(MemberDispManager.DispType.Line);
                    else _partsDispWorks[i].partsGameObject.SetActive(false);
                }
                else
                {
                    _partsDispWorks[i].partsGameObject.SetActive((InputPanelLabel)i == label);
                }
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


    public void InputDataChenge(string json)
    {
        // jsonデータを読み込みます
        this._webframe.SetData(json);

        // ゲームオブジェクトを生成します。
        this.CreateParts();
        
        // 生成したオブジェクトのステータスを初期化します。
        this.SetAllBlockStatus();

        // 表示モードが不明な場合
        if (this.inputMode == InputPanelLabel.None){
            // 表示モードを問い合わせます。
            ExternalConnect.SendAngular("GetInputMode");
        }
    }

    /// <summary> JavaScript から インプットデータ の変更通知が来た </summary>
    public void InputModeDataChenge( string json)
    {
        if (this.inputMode == InputPanelLabel.None){
            ExternalConnect.SendAngular("GetInputMode");
            return;
        }


        // jsonデータを読み込みます
        this._webframe.SetData(json);

        // ゲームオブジェクトを変更します。
        PartsDispWork partsDispWork = _partsDispWorks[(int)this.inputMode];

        if (partsDispWork.partsDispManager == null)
            return;

        partsDispWork.partsDispManager.ChengeParts();

        // 節点に変更があった場合 他のオブジェクトに影響する
        if (this.inputMode == InputPanelLabel.Node){
            this.SetAllBlockStatus();
        }
    }

    #endregion

    #region JavaScript から Active Item の変更通知が来た 

    public void SelectItemChange(int i)
    {
        if (this.inputMode == InputPanelLabel.None){
            ExternalConnect.SendAngular("GetInputMode");
            return;
        }

        PartsDispWork partsDispWork = _partsDispWorks[(int)this.inputMode];
        partsDispWork.partsDispManager.ChengeForcuseBlock(i);
    }

    #endregion

}
