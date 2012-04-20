var editor;
var codeFunc;
var renderer;
var playing = false;
var saveTimeout;
var refreshTimeout;

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

  if (saveTimeout !== undefined) {
    clearTimeout(saveTimeout);
    saveTimeout = undefined;
  }
  saveTimeout = setTimeout("save()", 1000);
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
  var music = $("#music").get(0);
  music.currentTime = newTime;
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
  session.on('change', function() {
    if (refreshTimeout !== undefined) {
      clearTimeout(refreshTimeout);
      refreshTimeout = undefined;
    }
    refreshTimeout = setTimeout(onEdit, 1000);
  });

  var code = localStorage.getItem("code");
  session.setValue(code);
  updateCode(session.getValue());

  renderer = new THREE.CanvasRenderer({
    canvas: $("#video").get(0),
  });
  renderer.setSize(width(), height());

  onEdit();
};
