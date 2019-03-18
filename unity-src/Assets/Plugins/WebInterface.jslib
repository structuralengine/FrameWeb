mergeInto(LibraryManager.library, {
  ReceiveUnity: function (str) {
    window.ReceiveUnity(Pointer_stringify(str));
  },
  ReceiveUnitySelectItemChenge: function (str) {
    window.ReceiveUnitySelectItemChenge(Pointer_stringify(str));
  }
});