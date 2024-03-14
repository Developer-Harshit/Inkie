window.app = {};
window.seriously = {};
window.target = {};
window.src = {};

app.init = false;

app.video_mode = 0;

// 0 = loading
// 1 = started

app.change_canvas_state = (state = 0, msg = "loading...") => {
    let cnvDiv = document.getElementById("cnv-div");
    let loadingDiv = document.getElementById("loading-div");
    let effectSection = document.getElementById("effects-section");
    let controlSection = document.getElementById("controls-section");

    if (state === 0) {
        cnvDiv.style.display = "none";
        effectSection.style.display = "none";
        controlSection.style.display = "none";
        loadingDiv.style.display = "flex";
        loadingDiv.innerText = msg;
    } else {
        cnvDiv.style.display = "flex";
        loadingDiv.style.display = "none";
        effectSection.style.display = "block";
    }
};

// mode 0 = storage , mode 1 = camera
// state 0 = loading state 1 = started
app.change_video_mode = (mode = 0) => {
    let controlSection = document.getElementById("controls-section");
    let camButton = document.getElementById("cam-btn");
    let fileButton = document.getElementById("file-btn");

    if (mode == 0) {
        controlSection.style.display = "block";
        // turn off web cam ///////////
        app.cam.pause();
        app.cam.src = "";
        try {
            const track = app.localstream.getTracks();

            track[0].stop();
            console.log("Camera off");
        } catch (e) {
            console.error("Error in turning off camera", e);
        }

        //////////////////////////////
        // play main video
        app.vid.play();
        // change class
        fileButton.classList.add("active");
        camButton.classList.remove("active");
    } else {
        controlSection.style.display = "none";
        // turn off main video
        app.vid.pause();
        // play cam
        app.cam.play();
        // change class
        camButton.classList.add("active");
        fileButton.classList.remove("active");
    }
};

app.setup = () => {
    app.vid = document.getElementById("main-video");
    app.cam = document.getElementById("cam-video");
    app.change_canvas_state(0, "Select video to start");
    videoSource = document.querySelector("#main-video source");

    let camButton = document.getElementById("cam-btn");
    camButton.addEventListener("click", () => {
        app.change_canvas_state(0);

        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: false,
            })
            .then((stream) => {
                app.localstream = stream;
                app.cam.srcObject = stream;
                app.start(app.cam);
                app.change_video_mode(1);
            })
            .catch((err) => {
                console.error("something bad happened", err);
            });
    });

    // using file
    const fileInput = document.getElementById("file-input");
    fileInput.addEventListener("change", (e) => {
        if (!(e.target.files && e.target.files[0])) return;
        app.change_canvas_state(0);
        const reader = new FileReader();

        reader.onload = function (ev) {
            let videoSource = document.querySelector("#main-video source");
            videoSource.src = ev.target.result;

            app.vid.load();

            app.start(app.vid);
            app.change_canvas_state();
            app.change_video_mode(0);
        };
        reader.readAsDataURL(e.target.files[0]);
        fileInput.type = "text";
        fileInput.type = "file";
    });
};
app.initilize = () => {
    if (app.init) return;
    app.vid.addEventListener("canplay", () => {
        app.resize(app.vid);
    });
    app.setControlEvents();
    app.cam.addEventListener("canplay", () => {
        app.resize(app.cam);
    });
    window.seriously = new Seriously();

    filters = [seriously.effect("ink"), seriously.effect("crosshatch")];

    let effectLabels = document.querySelectorAll("#effects-section label");
    for (let eLabel of effectLabels) {
        eLabel.addEventListener("click", () => {
            for (let other of effectLabels) {
                other.classList.remove("active");
            }
            eLabel.classList.add("active");
        });
    }
    let effectRadios = document.querySelectorAll("#effects-section input");
    for (let eRadio of effectRadios) {
        eRadio.addEventListener("change", () => {
            app.connect_effect();
        });
    }

    app.init = true;
};

app.setControlEvents = () => {
    let playButton = document.getElementById("play-btn");
    let pauseButton = document.getElementById("pause-btn");
    let plusTenButton = document.getElementById("plus-10");
    let minusTenButton = document.getElementById("minus-10");
    playButton.addEventListener("click", () => {
        app.vid.play();
        seriously.go();
        playButton.style.display = "none";
        pauseButton.style.display = "inline-block";
    });

    pauseButton.addEventListener("click", () => {
        app.vid.pause();
        seriously.stop();
        pauseButton.style.display = "none";
        playButton.style.display = "inline-block";
    });

    plusTenButton.addEventListener("click", () => {
        let newTime = app.vid.currentTime + 10;

        app.vid.currentTime = newTime;
    });
    minusTenButton.addEventListener("click", () => {
        let newTime = app.vid.currentTime - 10;

        app.vid.currentTime = Math.max(0, newTime);
    });
};

app.resize = (ele) => {
    if (!app.init) app.initilize();
    let x = ele.videoWidth;
    let y = ele.videoHeight;

    app.effect.width = x;
    app.effect.height = y;

    app.target.width = x;
    app.target.height = y;
};

app.connect_effect = () => {
    let current_effect = document.querySelector(
        'input[name="effects"]:checked'
    );
    if (current_effect) {
        app.effect = filters[+current_effect.value];
    } else {
        app.effect = filters[0];
        console.log("Setted default effect");
    }

    // connecting them
    app.effect.source = app.src;
    app.target.source = app.effect;
};

app.start = (mysource = "#main-video") => {
    if (!app.init) app.initilize();
    if (app.src) app.src.destroy();
    if (app.target) app.target.destroy();
    //   adding source and target
    app.src = seriously.source(mysource);
    app.target = seriously.target("#main-canvas");

    app.connect_effect();

    app.resize(mysource);
    seriously.go();
    setTimeout(() => {
        app.change_canvas_state(1);
    }, 10);
};

// Call setup fubnction
window.addEventListener(
    "DOMContentLoaded",
    () => {
        app.setup();
    },
    { once: true }
);
