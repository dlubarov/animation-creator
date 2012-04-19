var editor;
var codeFunc;
var renderer;
var playing = false;
var timeout;
var fps = 0.1;

function getFrameAsBuffer() {
  var canvas = $("#video").get(0);

  // take apart data URL
  var parts = canvas.toDataURL().match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);
  // assume base64 encoding
  var binStr = atob(parts[3]);

  // convert to binary in ArrayBuffer
  var buf = new ArrayBuffer(binStr.length);
  var view = new Uint8Array(buf);
  for(var i = 0; i < view.length; ++i) {
    view[i] = binStr.charCodeAt(i);
  }
  return buf;
}

function getAllFramesData() {
  var dur = duration();
  var lastPercent = -1;
  var builder = new WebKitBlobBuilder();
  console.info("Encoding...");
  for (var t = 0; t < dur; t += 1/fps) {
    var percent = Math.floor(t/dur*100);
    if (percent > lastPercent) {
      console.info("   ..." + percent + "%");
      lastPercent = percent;
    }
    setTime(t); refresh();
    var data = getFrameAsBuffer();
    var len = data.byteLength;
    len = new Uint32Array([len]);
    builder.append(len.buffer);
    builder.append(data);
  }
  return builder.getBlob("application/octet-stream");
}

function downloadVideo() {
  if (playing) { playOrPause(); }
  var blob = getAllFramesData();
  console.info("Blob size is " + Math.floor(blob.size/1000) + " kb");
  var uri = webkitURL.createObjectURL(blob);
  console.info("Offering download...");
  console.info(uri);
  //window.open(uri, "result");
  location.href = uri;
}

function formatTime(t) {
  var mins = Math.floor(t / 60), secs = Math.floor(t % 60);
  mins = mins.toString(); secs = secs.toString();
  while (secs.length < 2) { secs = "0" + secs; }
  return mins + ":" + secs;
}

function updateTiming() {
  $("#currentTime").text(formatTime(time()));
  $("#duration").text(formatTime(duration()));
}

function updateSlider() {
  $("#slider").get(0).value = 1000 * time() / duration();
}

function playOrPause() {
  var music = $("#music").get(0);
  var button = $("#playPause");
  playing = !playing;
  if (playing) {
    music.play();
    button.text("Pause");
  } else {
    music.pause();
    button.text("Play");
  }
  refresh();
}

function refresh() {
  updateTiming();
  updateSlider();
  var canvas = $("#video").get(0);

  try {
    codeFunc();
  } catch (err) {
    console.warn(err.message);
  }

  if (playing) {
    requestAnimationFrame(refresh, $("#video").get(0));
  }
}

function save() {
  localStorage.setItem("code", getCode());
  console.info("Saved code.");
}

function onEdit() {
  var code = getCode();
  updateCode(code);
  refresh();

  if (timeout !== undefined) {
    clearTimeout(timeout);
  }
  timeout = setTimeout("save()", 1000);
}

function onSlide() {
  var newTime = $("#slider").get(0).value / 1000 * duration();
  setTime(newTime);
  refresh();
}

function duration() {
  return $("#music").get(0).duration;
}

function time() {
  return $("#music").get(0).currentTime;
}

function setTime(newTime) {
  $("#music").get(0).currentTime = newTime;
}

function width() {
  return $("#video").width();
}

function height() {
  return $("#video").height();
}

function getCode() {
  return editor.getSession().getValue();
}

function updateCode(code) {
  try {
    codeFunc = new Function(code);
  } catch (err) {
    console.warn("syntax error");
  }
}

window.onload = function() {
  editor = ace.edit("editor");
  var session = editor.getSession();
  session.setMode("ace/mode/javascript");
  session.setUseSoftTabs(true);
  session.setTabSize(2);
  session.on('change', function() {setTimeout(onEdit, 10)});

  var code = localStorage.getItem("code");
  session.setValue(code);
  updateCode(session.getValue());

  renderer = new THREE.CanvasRenderer({
    canvas: $("#video").get(0),
  });
  renderer.setSize(width(), height());

  onEdit();
};
