const peerConnectionConfig = {
  iceServers: [
    {
      urls: [
        "turn:173.194.72.127:19305?transport=udp",
        "turn:[2404:6800:4008:C01::7F]:19305?transport=udp",
        "turn:173.194.72.127:443?transport=tcp",
        "turn:[2404:6800:4008:C01::7F]:443?transport=tcp",
      ],
      username: "CKjCuLwFEgahxNRjuTAYzc/s6OMT",
      credential: "u1SQDR/SQsPQIxXNWQT7czc/G4c=",
    },
    {
      urls: ["stun:stun.l.google.com:19302"],
    },
  ],
};

const localVideo = document.querySelector("#localStream");
const remoteVideo = document.querySelector("#remoteStream");
const recieverPeer = new RTCPeerConnection(peerConnectionConfig);
const socket = io();

let curr = 0;
socket.on("offer", async (e) => {
  if (curr < 1) {
    initAnswer(e.data);
    curr++;
  }
});

let localStream, remoteStream;

recieverPeer.oniceconnectionstatechange = (e) => {
  // console.log(e);
};
recieverPeer.onicecandidate = (e) => {
  // console.log(recieverPeer.localDescription);
};
recieverPeer.ontrack = (track) => {
  remoteStream = track;
  const resultStream = new MediaStream();
  resultStream.addTrack(remoteStream.track);
  remoteVideo.srcObject = resultStream;
};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  })
  .then((mediaStream) => {
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
    mediaStream.getTracks().forEach((track) => {
      recieverPeer.addTrack(track, mediaStream);
    });
    // console.log("Tracks added with stream");
  })
  .catch((e) => {
    console.error("ERROR : " + e.message);
  });

const initAnswer = async (offer) => {
  try {
    recieverPeer
      .setRemoteDescription(offer)
      .then(async (e) => {
        const answer = await recieverPeer.createAnswer();
        await recieverPeer.setLocalDescription(answer);
        return answer;
      })
      .then((answer) => {
        socket.emit("answer", answer);
      });
  } catch (e) {
    console.log("An error occured while creating answer");
  }
};
