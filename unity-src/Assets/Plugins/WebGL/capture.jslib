var MyPlugin = {
	CanvasCapture: function(img, size) {
		var binary = '';
		for (var i = 0; i < size; i++)
			binary += String.fromCharCode(HEAPU8[img + i]);
		var dataUrl = 'data:image/png;base64,' + btoa(binary);
	
		var capture = document.getElementById("capture");
		capture.src = dataUrl;
	},
};
mergeInto(LibraryManager.library, MyPlugin);