
const startBtn = document.getElementById('startBtn');
const video = document.getElementById('preview');

let stream;
let recorder;
let videoFile;

const handelDownload = () => {
    const link = document.createElement('a');
    link.href = videoFile;
    link.download = "MyRecording.webm";
    document.body.appendChild(link);
    link.click();
}


const handleStop = () => {
    startBtn.innerText = 'Download recording';
    startBtn.removeEventListener('click', handleStop);
    startBtn.addEventListener('click', handelDownload);
    recorder.stop();
}
const handleStart = () => {
    startBtn.innerText = 'stop recording'
    startBtn.removeEventListener('click', handleStart);
    startBtn.addEventListener('click', handleStop);

    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
        videoFile = URL.createObjectURL(event.data);
        console.log(videoFile);
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
    };
    recorder.start();
};

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    });
    video.srcObject = stream;
    video.play();
}

init();

startBtn.addEventListener('click', handleStart);