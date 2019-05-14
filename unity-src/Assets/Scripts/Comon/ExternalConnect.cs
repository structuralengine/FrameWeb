using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;

#pragma warning disable CS0618		//	回避策がないのでとりあえず警告を無効にしておく



[DefaultExecutionOrder(100)] //Start を最後に呼び出すため
public class ExternalConnect : MonoBehaviour
{

    MainFrameManager mainFrameObject;

    void Start()
    {
        GameObject Obj = GameObject.Find("MainFrameManager");
        this.mainFrameObject = Obj.GetComponent<MainFrameManager>();

        // javascript に起動時のデータを問い合わせる
        SendAngular("GetInputJSON");
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
        Debug.Log("ReceiveUnity(" + message + ")");
#else
    ReceiveUnity(message);
#endif
    }

    internal static void SendAngularSelectItemChenge(int id)
    {
#if UNITY_EDITOR
        Debug.Log("ReceiveUnitySelectItemChenge(" + id.ToString() + ")");
#else
    ReceiveUnitySelectItemChenge(id.ToString());
#endif
    }

    #endregion

    #region Html→Unity (JSからUnity内でイベント発火)

    /// <summary> Htmlから Jsonデータが一式届く </summary>
    public void ReceiveData(string strJson)
    {
        mainFrameObject.InputDataChenge(strJson);
    }

    /// <summary> Htmlから 現在のモードのJsonデータが届く </summary>
    public void ReceiveModeData(string strJson)
    {
        mainFrameObject.InputModeDataChenge(strJson);
    }

    /// <summary> Htmlから キャプチャー画像の送付依頼がくる </summary>
    public void SendCapture()
    {
        StartCoroutine(_Execute());
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
        InputModeType inputModeType = InputModeType.None;
        switch (mode)
        {
            case "nodes":
                inputModeType = InputModeType.Node;
                break;
            case "members":
                inputModeType = InputModeType.Member;
                break;
            case "panels":
                inputModeType = InputModeType.Panel;
                break;
            case "fix_nodes":
                inputModeType = InputModeType.FixNode;
                break;
            case "elements":
                inputModeType = InputModeType.Element;
                break;
            case "joints":
                inputModeType = InputModeType.Joint;
                break;
            case "notice_points":
                inputModeType = InputModeType.NoticePoints;
                break;
            case "fix_members":
                inputModeType = InputModeType.FixMember;
                break;
            case "loads":
                inputModeType = InputModeType.Load;
                break;
            case "fsec":
                inputModeType = InputModeType.Fsec;
                break;
            case "comb_fsec":
                inputModeType = InputModeType.Fsec;
                break;
            case "disg":
                inputModeType = InputModeType.Disg;
                break;
            case "comb_disg":
                inputModeType = InputModeType.Disg;
                break;
            case "reac":
                inputModeType = InputModeType.Reac;
                break;
            case "comb_reac":
                inputModeType = InputModeType.Reac;
                break;
            default:
                return;
        }
        mainFrameObject.InputModeChange(inputModeType);
    }

    /// <summary> Htmlから セレクトアイテム変更の通知がくる </summary>
    /// <param name="i">セレクトアイテムid</param>
    public void SelectItemChange(string id)
    {
        int i = int.Parse(id);
        mainFrameObject.SelectItemChange(i);
    }

    #endregion

}
