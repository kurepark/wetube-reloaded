const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const totalTime = document.getElementById("totalTime");
const currenTime = document.getElementById("currenTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenBtnIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let constorlsMovemetTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;


const handlePlayClick = (e) => {
    // if player => puase
    // else play the video
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }

    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
}

const handlePause = (e) => (playBtnIcon.classList = "fas fa-play");
const handlePlay = (e) => (playBtnIcon.classList = "fas fa-pause");

const handleMute = (e) => {
    if (video.muted) {
        video.muted = false;
    } else {
        video.muted = true;
    }
    muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumeValue;
}

const handleVolumeChange = (event) => {
    const { target: { value } } = event;
    if (video.muted) {
        video.muted = false;
        muteBtnIcon.classList = "fas fa-volume-mute";
    }
    volumeValue = value;
    video.volume = value;
}

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substring(11, 19);

const handelLoadedMetaData = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
}

const handelTimeUpdate = () => {
    currenTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
}

const handelTimelineChange = (event) => {
    const { target: { value } } = event;
    video.currentTime = value;
}

const handelFullScreen = (event) => {
    const fullScreen = document.fullscreenElement;
    if (fullScreen) {
        document.exitFullscreen();
        fullScreenBtnIcon.classList = "fas fa-expand";
    } else {
        videoContainer.requestFullscreen();
        fullScreenBtnIcon.classList = "fas fa-compress";
    }
}

const hideControls = () => videoContainer.classList.remove("showing");

const handleMouseMove = () => {
    if (controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    if (constorlsMovemetTimeout) {
        clearTimeout(constorlsMovemetTimeout);
        constorlsMovemetTimeout = null;
    }

    videoContainer.classList.add("showing");
    constorlsMovemetTimeout = setTimeout(hideControls, 3000)
}

const handelMouseLeave = () => {
    controlsTimeout = setTimeout(hideControls, 3000);
}

const handleEnded = () => {
    const { id } = videoContainer.dataset;
    fetch(`/api/videos/${id}/view`, {
        method: "POST",
    });
}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handelLoadedMetaData);
video.addEventListener("timeupdate", handelTimeUpdate);
video.addEventListener("click", handlePlayClick);
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handelTimelineChange);
fullScreenBtn.addEventListener("click", handelFullScreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handelMouseLeave);
videoContainer.addEventListener("keydown", handlePlayClick); // TODO: space 눌림 영역 수정필요
