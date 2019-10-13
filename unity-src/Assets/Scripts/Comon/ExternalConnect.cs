using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;
using UnityEngine.UI;
using System.Diagnostics;

#pragma warning disable CS0618    //	回避策がないのでとりあえず警告を無効にしておく

[DefaultExecutionOrder(100)] //Start を最後に呼び出すため
public class ExternalConnect : MonoBehaviour
{
  MainFrameManager mainFrameObject;

  void Start()
  {
    GameObject Obj = GameObject.Find("MainFrameManager");
    this.mainFrameObject = Obj.GetComponent<MainFrameManager>();

    // テストに関わる
#if UNITY_EDITOR
    this.stepNo = 1;
    this.DoTestCode();
#else
    GameObject TestButton = GameObject.Find("TestButton");
    TestButton.SetActive(false);
    // javascript に起動時のデータを問い合わせる
    SendAngular("GetInputJSON");
#endif

  }

  #region Unity → Html へ メッセージを送る

  [DllImport("__Internal")]
  private static extern void ReceiveUnity(string message);

  [DllImport("__Internal")]
  private static extern void ReceiveUnitySelectItemChenge(string message);

  /// <summary>
  /// Html へ メッセージを送る
  /// </summary>
  /// <param name="message"></param>
  internal static void SendAngular(string message)
  {
#if UNITY_EDITOR
    UnityEngine.Debug.Log("ReceiveUnity(" + message + ")");
#else
    ReceiveUnity(message);
#endif
  }
  
  internal static void SendAngularSelectItemChenge(int id)
  {
#if UNITY_EDITOR
    UnityEngine.Debug.Log("ReceiveUnitySelectItemChenge(" + id.ToString() + ")");
#else
    ReceiveUnitySelectItemChenge(id.ToString());
#endif
  }

  #endregion

  #region Html→Unity (JSからUnity内でイベント発火)

  /// <summary> Htmlから Jsonデータが一式届く </summary>
  public void ReceiveData(string strJson)
  {
    UnityEngine.Debug.Log("Unity Function ReceiveData Called ----------------------------");
    mainFrameObject.InputDataChenge(strJson);
    UnityEngine.Debug.Log("End ReceiveData ----------------------------------------------");
  }

  /// <summary> Htmlから 現在のモードのJsonデータが届く </summary>
  public void ReceiveModeData(string strJson)
  {
    UnityEngine.Debug.Log("Unity Function ReceiveModeData Called ------------------------");
    mainFrameObject.InputModeDataChenge(strJson);
    UnityEngine.Debug.Log("End ReceiveModeData ------------------------------------------");
  }

  /// <summary> Htmlから 計算結果のJsonデータが届く </summary>
  public void ReceiveResultData(string strJson)
  {
    UnityEngine.Debug.Log("Unity Function ReceiveResultData Called ---------------------");
    mainFrameObject.ResultDataChenge(strJson);
    UnityEngine.Debug.Log("End ReceiveResultData ---------------------------------------");
  }

  /// <summary> Htmlから キャプチャー画像の送付依頼がくる </summary>
  public void SendCapture()
  {
    UnityEngine.Debug.Log("Unity Function SendCapture Called ---------------------------");
    StartCoroutine(_Execute());
    UnityEngine.Debug.Log("End SendCapture ---------------------------------------------");
  }

  [DllImport("__Internal")]
  private static extern void CanvasCapture(byte[] img, int size);

  IEnumerator _Execute()
  {
    yield return new WaitForEndOfFrame();
    Texture2D tex = new Texture2D(Screen.width, Screen.height);
    tex.ReadPixels(new Rect(0, 0, Screen.width, Screen.height), 0, 0);
    tex.Apply();
    byte[] img = tex.EncodeToPNG();
    CanvasCapture(img, img.Length);
  }

  /// <summary> Htmlから モードの変更通知がくる </summary>
  public void ChengeMode(string mode)
  {
    UnityEngine.Debug.Log("Unity Function ChengeMode Called ----------------------------");

    InputModeType inputModeType = InputModeType.None;

    string[] values = mode.Split(':');

    int option = 0;
    if (values.Length > 1)
      Int32.TryParse(values[1], out option);

    switch (values[0])
    {
      case "nodes":
        inputModeType = InputModeType.Node;
        mainFrameObject.InputModeChange(inputModeType);
        break;
      case "members":
        inputModeType = InputModeType.Member;
        mainFrameObject.InputModeChange(inputModeType);
        break;
      case "panels":
        inputModeType = InputModeType.Panel;
        mainFrameObject.InputModeChange(inputModeType);
        break;
      case "fix_nodes":
        inputModeType = InputModeType.FixNode;
        mainFrameObject.InputTypeChange(inputModeType, option);
        break;
      case "elements":
        inputModeType = InputModeType.Element;
        mainFrameObject.InputTypeChange(inputModeType, option);
        break;
      case "joints":
        inputModeType = InputModeType.Joint;
        mainFrameObject.InputTypeChange(inputModeType, option);
        break;
      case "notice_points":
        inputModeType = InputModeType.NoticePoints;
        mainFrameObject.InputModeChange(inputModeType);
        break;
      case "fix_members":
        inputModeType = InputModeType.FixMember;
        mainFrameObject.InputTypeChange(inputModeType, option);
        break;
      case "loads":
        inputModeType = InputModeType.Load;
        mainFrameObject.InputTypeChange(inputModeType, option);
        break;
      case "fsec":
        inputModeType = InputModeType.Fsec;
        mainFrameObject.InputTypeChange(inputModeType, option);
        break;
      case "disg":
        inputModeType = InputModeType.Disg;
        mainFrameObject.InputTypeChange(inputModeType, option);
        break;
      case "reac":
        inputModeType = InputModeType.Reac;
        mainFrameObject.InputTypeChange(inputModeType, option);
        break;
      default:
        return;
    }

    UnityEngine.Debug.Log("End ChengeMode ----------------------------------------------");

  }

  /// <summary> Htmlから セレクトアイテム変更の通知がくる </summary>
  /// <param name="i">セレクトアイテムid</param>
  public void SelectItemChange(string id)
  {
    UnityEngine.Debug.Log("Unity Function SelectItemChange Called ----------");
    mainFrameObject.SelectItemChange(int.Parse(id));
    UnityEngine.Debug.Log("-------------------------------------------------");
  }

  #endregion

  #region テストボタンクリック時のコード

  [SerializeField]
  private int stepNo;

  [Conditional("UNITY_EDITOR")]
  private void DoTestCode()
  {
    //ファイルを取得
    string path = Application.dataPath + "/Resources/Test/";
    string[] files = System.IO.Directory.GetFiles(path, string.Format("{0}_*.json", this.stepNo));

    // ファイルを読み込む
    TextAsset textAsset = null;
    string stepName = null;
    foreach (string fileName in files)
    {
      stepName = System.IO.Path.GetFileNameWithoutExtension(fileName);
      textAsset = Resources.Load<TextAsset>("Test/" + stepName);
      break;
    }
    if (textAsset == null)
    {
      UnityEngine.Debug.LogError("ファイルが読み込めません。 :" + stepName);
      return;
    }

    // JSON データを解釈する
    string ReceiveJson = textAsset.text;
    Dictionary<string, object> objJson;
    try
    {
      objJson = Json.Deserialize(ReceiveJson) as Dictionary<string, object>;
    }
    catch
    {
      UnityEngine.Debug.Log("Error!! at webframe SetData Json.Deserialize");
      return;
    }

    // 処理を実行する
    try
    {
      string methodName = objJson["methodName"].ToString();

      switch (methodName)
      {
        case "ReceiveData":
          this.ReceiveData(Json.Serialize(objJson["value"]));
          break;

        case "ChengeMode":
          this.ChengeMode(objJson["value"].ToString());
          break;

        case "ReceiveModeData":
           this.ReceiveModeData(Json.Serialize(objJson["value"]));
          break;

        case "ReceiveResultData":
          this.ReceiveResultData(Json.Serialize(objJson["value"]));
          break;

        case "SendCapture":
          this.SendCapture();
          break;

        case "SelectItemChange":
          this.SelectItemChange(objJson["value"].ToString());
          break;

        default:
          break;
      }
      UnityEngine.Debug.Log(stepName + " を実行しました。");
    }
    catch
    {
      UnityEngine.Debug.Log(stepName + " の実行に失敗しました。");
      return;
    }

    // 次の手順の準備をする
    this.stepNo += 1;
    GameObject TestButton = GameObject.Find("TestButton");

    //ファイルを取得
    files = System.IO.Directory.GetFiles(path, string.Format("{0}_*.json", this.stepNo));

    // ファイルを読み込む
    stepName = null;
    foreach (string fileName in files)
    {
      stepName = System.IO.Path.GetFileNameWithoutExtension(fileName);
      break;
    }
    if (stepName == null)
    {
      Text targetText = this.FindText(TestButton);
      targetText.text = "次の処理はありません";
      Button btn = TestButton.GetComponent<Button>();
      btn.interactable = false; // 無効フラグを設定
    }
    else
    {
      Text targetText = this.FindText(TestButton);
      targetText.text = stepName;
    }
  }

  /// <summary>
  /// テストボタンをクリックしたとき
  /// </summary>
  [Conditional("UNITY_EDITOR")]
  public void testBotton_Click()
  {
    this.DoTestCode();
  }

  /// 指定のオブジェクトのTextを探す
  public Text FindText(GameObject target)
  {
    foreach (Transform child in target.transform)
      if (child.name == "Text")
        return child.GetComponent<Text>();
    return null;
  }
  #endregion

}
