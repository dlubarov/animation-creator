var editor;
var codeFunc;
var renderer;
var playing = false;
var timeout;
var fps = 0.1;

// Gets base 64 encoded PNG data for the current frame.
function getFrameData() {
  var canvas = $("#video").get(0);
  var data = canvas.toDataURL("image/png");
  data = data.replace(/^data:image\/(png|jpg);base64,/, "");
  return data;
}

function getAllFramesData() {
  var dur = duration();
  var parts = [];
  var lastPercent = -1;
  console.info("Encoding...");
  for (var t = 0; t < dur; t += 1/fps) {
    var percent = Math.floor(t/dur*100);
    if (percent > lastPercent) {
      console.info("   ..." + percent + "%");
      lastPercent = percent;
    }
    setTime(t); refresh();
    parts.push(getFrameData());
  }
  console.info("Concatenating...");
  var data = parts.join("|");
  data = Base64.encode(data);
  return data;
}

function downloadVideo() {
  if (playing) {
    playOrPause();
  }
  var data = getAllFramesData();
  console.info("Blob size is " + Math.floor(data.length/1000) + " kb");
  console.info("Constructing data URI...");
  var uri = "data:application/octet-stream;base64," + data;
  console.info("Offering download...");
  //window.open(uri);
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
  updateCode();
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

function updateCode() {
  codeFunc = new Function(getCode());
}

window.onload = function() {
  editor = ace.edit("editor");
  var session = editor.getSession();
  session.setMode("ace/mode/javascript");
  session.setUseSoftTabs(true);
  session.setTabSize(2);
  session.on('change', onEdit);

  session.setValue(localStorage.getItem("code"));
  updateCode();

  renderer = new THREE.CanvasRenderer({
    canvas: $("#video").get(0),
  });
  renderer.setSize(width(), height());

  onEdit();
};
