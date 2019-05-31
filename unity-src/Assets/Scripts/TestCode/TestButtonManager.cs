using System.Collections.Generic;
using System.Diagnostics;
using UnityEngine;
using UnityEngine.UI;

[DefaultExecutionOrder(1000)] //Start を最後に呼び出すため
public class TestButtonManager : MonoBehaviour
{
  [SerializeField]
  private ExternalConnect script;
  private int stepNo;

  /// <summary>開始時</summary>
  void Start()
  {
    GameObject connecter = GameObject.Find("ExternalConnect");
    this.script = connecter.GetComponent<ExternalConnect>();

#if UNITY_EDITOR
    this.stepNo = 1;
    this.DoTestCode();
#else
    GameObject TestButton = GameObject.Find("TestButton");
    TestButton.SetActive(false);
#endif

  }

  [Conditional("UNITY_EDITOR")]
  private void DoTestCode()
  {
    //ファイルを取得
    string path = Application.dataPath + "/Resources/Test/";
    string[] files = System.IO.Directory.GetFiles(path, string.Format("{0}*.json", this.stepNo));

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
          object output1 = objJson["strJson"];
          string strJson1 = Json.Serialize(output1);
          this.script.ReceiveData(strJson1);
          break;

        case "ChengeMode":
          string inputModeType = objJson["inputModeType"].ToString();
          this.script.ChengeMode(inputModeType);
          break;

        case "ReceiveModeData":
          object output3 = objJson["strJson"];
          string strJson2 = Json.Serialize(output3);
          this.script.ReceiveModeData(strJson2);
          break;

        case "ReceiveResultData":
            object output4 = objJson["strJson"];
            string strJson3 = Json.Serialize(output4);
            this.script.ReceiveResultData(strJson3);
            break;

        case "SendCapture":
          this.script.SendCapture();
          break;

        case "SelectItemChange":
          string id = objJson["id"].ToString();
          this.script.SelectItemChange(id);
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
    files = System.IO.Directory.GetFiles(path, string.Format("{0}*.json", this.stepNo));

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

}
