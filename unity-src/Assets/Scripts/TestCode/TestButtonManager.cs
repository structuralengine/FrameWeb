using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

[DefaultExecutionOrder(1000)] //Start を最後に呼び出すため
public class TestButtonManager : MonoBehaviour {
	[SerializeField]
	private MainFrameManager.InputModeType _inputModeType = (MainFrameManager.InputModeType)0;
    private ExternalConnect script;

	//[SerializeField, Multiline(10)]
	string _initText;

	//[SerializeField, Multiline(10)]
	string _testText;



	/// <summary>
	/// 開始時
	/// </summary>
    void Start()
    {
        GameObject connecter = GameObject.Find("ExternalConnect");
        this.script = connecter.GetComponent<ExternalConnect>();

		this.script.ChengeMode(_inputModeType);

		string initTextPath = "Test/" + _inputModeType.ToString() + "/InitText";
		TextAsset textAsset = Resources.Load<TextAsset>(initTextPath);
		if( textAsset == null )
		{ 
			Debug.LogError("ファイルが読み込めません。 : " + initTextPath );
		}

		_initText = textAsset.text;
        this.script.ReceiveData(_initText);
    }



	/// <summary>
	/// テストボタンをクリックしたとき
	/// </summary>
    public void testBotton_Click()
    {
		string initTextPath = "Test/" + _inputModeType.ToString() + "/TestText";
		TextAsset textAsset = Resources.Load<TextAsset>(initTextPath);
		if( textAsset == null )
		{ 
			Debug.LogError("ファイルが読み込めません。 : " + initTextPath );
		}
		_testText = textAsset.text;
        this.script.ReceiveModeData(_testText);
        
		/*
            case "nodes":
            case "members":
            case "panels":
            case "fix_nodes":
            case "elements":
            case "joints":
            case "notice_points":
            case "fix_members":
            case "loads":
            case "fsec":
            case "comb.fsec":
            case "pic.fsec":
            case "disg":
            case "reac":
         */
    }

}
