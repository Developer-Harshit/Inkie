window.app = {};
app.init = false;
app.initcam = false;
app.videoSource = document.createElement("source");
app.videoSource.src = "";
app.videoElement = document.createElement("video");
app.videoElement.controls = true;
app.videoElement.appendChild(app.videoSource);

app.camElement = document.createElement("video");

app.canvas = document.createElement("canvas");
app.canvas.getContext("webgl", {
  antialias: false,
  depth: false,
});

app.initilize = () => {
  const appDiv = document.getElementById("app");

  app.videoElement.id = "main-video";
  appDiv.appendChild(app.videoElement);

  app.camElement.id = "cam-video";
  appDiv.appendChild(app.camElement);

  app.canvas.id = "main-canvas";
  appDiv.appendChild(app.canvas);

  app.videoElement.addEventListener("canplay", () => {
    app.resize(app.videoElement);
  });
  app.setControlEvents();
  app.camElement.addEventListener("canplay", () => {
    app.resize(app.camElement);
  });

  app.init = true;
};
app.setControlEvents = () => {
  let playButton = document.getElementById("play-btn");
  playButton.addEventListener("click", () => app.videoElement.play());

  let pauseButton = document.getElementById("pause-btn");
  pauseButton.addEventListener("click", () => app.videoElement.pause());

  let plusTenButton = document.getElementById("plus-10");
  plusTenButton.addEventListener("click", () => {
    let newTime = app.videoElement.currentTime + 10;

    app.videoElement.currentTime = newTime;
  });
  let minusTenButton = document.getElementById("minus-10");
  minusTenButton.addEventListener("click", () => {
    let newTime = app.videoElement.currentTime - 10;

    app.videoElement.currentTime = Math.max(0, newTime);
  });
};
app.resize = (ele) => {
  let x = app.src.width;
  let y = app.src.height;

  app.src.width = x;
  app.src.height = y;

  app.effect.width = x;
  app.effect.height = y;

  app.effect2.width = x;
  app.effect2.height = y;

  app.target.width = x;
  app.target.height = y;

  app.canvas.style.width = x + "px";
  app.canvas.style.height = y + "px";
};
app.start = (srcId = "#main-video") => {
  if (app.target) app.target.destroy();
  if (app.src) app.src.destroy();
  if (app.effect) app.effect.destroy();
  if (app.effect2) app.effect2.destroy();

  window.seriously = new Seriously();

  //   adding source and target
  app.src = seriously.source(srcId);
  app.target = seriously.target("#main-canvas");

  app.effect2 = seriously.effect("blur");
  app.effect = seriously.effect("edge");

  app.effect2.amount = "#blur-amount";
  // connecting them
  app.effect2.source = app.src;
  app.effect.source = app.effect2;

  app.target.source = app.effect;

  seriously.go();
};
// using webcam
const camButton = document.getElementById("cam-btn");
camButton.addEventListener("click", () => {
  let s = Math.min(innerWidth, innerHeight);
  let r = 5 / 4;
  if (app.initcam) {
    app.start("#cam-video");
    return;
  }

  navigator.mediaDevices
    .getUserMedia({
      video: {
        width: Math.floor(s * r),
        height: Math.floor(s / r),
      },
      audio: false,
    })
    .then((stream) => {
      app.camElement.srcObject = stream;
      app.camElement.play();
      if (!app.init) app.initilize();
      app.start("#cam-video");
      app.initcam = true;
    })
    .catch((err) => {
      console.error("something bad happened");
    });
});

// using file
const fileInput = document.getElementById("file-input");
fileInput.addEventListener("change", (e) => {
  if (!(e.target.files && e.target.files[0])) return;

  const reader = new FileReader();

  reader.onload = function (ev) {
    app.init = false;
    seriously = null;
    app.videoSource.src = ev.target.result;
    app.videoElement.load();
    app.videoElement.play();

    if (!app.init) app.initilize();

    app.start();
  };
  reader.readAsDataURL(e.target.files[0]);
});
