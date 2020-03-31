const {desktopCapturer, remote} = require('electron');

const {Menu} = remote;

//Buttons
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');

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

videoSelectBtn.onclick = getVideoSources;

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
}