
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById('actionBtn');
const video = document.getElementById('preview');

let stream;
let recorder;
let videoFile;

const files = {
    input: "recording.webm",
    ouput: "output.mp4",
    thumb: "thumbnail.jpeg"
}

const downloadFiles = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
}

const handelDownload = async () => {

    actionBtn.removeEventListener('click', handelDownload);
    actionBtn.innerText = "Transcoding....";
    actionBtn.disable = true;

    const ffmpeg = createFFmpeg({
        corePath: "/convert/ffmpeg-core.js",
        log: true
    });// console 에서 내용 확인

    await ffmpeg.load();

    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

    await ffmpeg.run("-i", files.input, "-r", "60", files.ouput);

    await ffmpeg.run("-i", files.input, "-ss", "00:00:01", "-frames:v", "1", files.thumb);

    const mp4File = ffmpeg.FS("readFile", files.ouput);
    const thumbFile = ffmpeg.FS("readFile", files.thumb);

    const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
    const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpeg" });

    const mp4Url = URL.createObjectURL(mp4Blob);
    const thumnUrl = URL.createObjectURL(thumbBlob);

    downloadFiles(mp4Url, "MyRecording.mp4");
    downloadFiles(thumnUrl, "MyThumbnail.jpeg");

    ffmpeg.FS("unlink", files.input);
    ffmpeg.FS("unlink", files.ouput);
    ffmpeg.FS("unlink", files.thumb);

    URL.revokeObjectURL(mp4Url);
    URL.revokeObjectURL(thumnUrl);
    URL.revokeObjectURL(videoFile);

    actionBtn.disable = false;
    actionBtn.innerHTML = "Record Again";
    actionBtn.addEventListener('click', handleStart);
};

const handleStart = () => {
    actionBtn.innerText = 'Recording';
    actionBtn.disabled = true;
    actionBtn.removeEventListener('click', handleStart);

    recorder = new MediaRecorder(stream, { MimeType: 'video/webm' });
    recorder.ondataavailable = (event) => { // 녹화가 멈추면 발생하는 이벤트
        videoFile = URL.createObjectURL(event.data);
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
        actionBtn.innerText = "Download";
        actionBtn.disabled = false;
        actionBtn.addEventListener('click', handelDownload);
    };

    recorder.start();

    setTimeout(() => {
        recorder.stop();
    }, 3000);
};

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            width: 1024,
            height: 576,
        },
    });
    video.srcObject = stream;
    video.play();
}

init();

actionBtn.addEventListener('click', handleStart);