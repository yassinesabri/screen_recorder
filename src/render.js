const {desktopCapturer, remote} = require('electron');

const {Menu} = remote;

let mediaRecorder; // MediaRecorder instance to capture footage

const recordedChunks = [];

//Buttons
const videoElement = document.querySelector('video');

const startBtn = document.getElementById('startBtn');
startBtn.onclick = e => {
    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
}

const stopBtn = document.getElementById('stopBtn');
stopBtn.onclick = e => {
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
}

const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;

// get available video sources 
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );

    videoOptionsMenu.popup();
}

// change the videoSource window to record
async function selectSource(source) {
    videoSelectBtn.innerText = source.name;
    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    } ;

    // create stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // preview the stream in real time within the video element
    videoElement.srcObject = stream;
    videoElement.play();

    // create Media Recorder
    const options = {mimeType: 'video/webm; codecs=vp9'};
    mediaRecorder = new MediaRecorder(stream, options);
    
    // Register event handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
}


function handleDataAvailable(e) {
    recordedChunks.push(e.data);
}

const {dialog} = remote;
const {writeFile} = require('fs');

// Save video file on stop
async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const {filePath} = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `record-${Date.now()}.webm`
    });

    console.log(filePath);

    if(filePath) {
        writeFile(filePath, buffer, () => {
            console.log('Record was saved successfully');
        });
    }
}