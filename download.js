var bb;
var downloadTime;
var fps = 29.97;
var lastPercent;

function getFrameAsBuffer() {
  var canvas = $("#video").get(0);
  var parts = canvas.toDataURL().match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);
  var binStr = atob(parts[3]); // assume base64 encoding
  var buf = new ArrayBuffer(binStr.length);
  var view = new Uint8Array(buf);
  for(var i = 0; i < view.length; ++i) {
    view[i] = binStr.charCodeAt(i);
  }
  return buf;
}

function downloadTick() {
  var percent = Math.floor(downloadTime/duration()*100);
  if (percent > lastPercent) {
    console.info("   ..." + percent + "%");
    lastPercent = percent;
  }

  setTime(downloadTime); refresh();
  var data = getFrameAsBuffer();
  var len = data.byteLength;
  len = new Uint32Array([len]);
  bb.append(len.buffer);
  bb.append(data);

  downloadTime += 1/fps;
  if (downloadTime < duration()) {
    requestAnimationFrame(downloadTick, $("#video").get(0));
  } else {
    finishDownload();
  }
}

function startDownload() {
  if (playing) { playOrPause(); }
  downloadTime = 0;
  bb = new WebKitBlobBuilder();
  lastPercent = -1;
  console.info("Encoding...");
  downloadTick();
}

function finishDownload() {
  var blob = bb.getBlob("application/octet-stream");
  console.info("Blob size is " + Math.floor(blob.size/1000) + " kb");
  var uri = webkitURL.createObjectURL(blob);
  console.info("Offering download...");
  location.href = uri;
}

function testDownload(size) {
  var bb = new WebKitBlobBuilder();
  bb.append(new ArrayBuffer(size));
  var blob = bb.getBlob("application/octet-stream");
  //location.href = webkitURL.createObjectURL(blob);
  window.open(webkitURL.createObjectURL(blob));
}
