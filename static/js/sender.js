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

let localStream, remoteStream;
const localVideo = document.querySelector("#localStream");
const remoteVideo = document.querySelector("#remoteStream");
const senderPeer = new RTCPeerConnection(peerConnectionConfig);
const socket = io();

socket.on("answer", (e) => {
  setAnswer(e.data);
});

senderPeer.oniceconnectionstatechange = (e) => {
  // console.log(e);
};

senderPeer.onicecandidate = (e) => {
  socket.emit("offer", senderPeer.localDescription);
};

senderPeer.ontrack = (track) => {
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
      senderPeer.addTrack(track, mediaStream);
    });
    // console.log("Tracks added with stream");
    initOffering();
  })
  .catch((e) => {
    console.error("ERROR : " + e.message);
  });

const initOffering = async () => {
  try {
    const offer = await senderPeer.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    senderPeer.setLocalDescription(offer);
    // .then((x) => console.log("Offer successfuly generated"));
  } catch (e) {
    console.log("An error occured while creating offer");
  }
};

const setAnswer = async (answer) => {
  try {
    await senderPeer.setRemoteDescription(answer);
  } catch (e) {
    console.error("Error : " + e.message);
  }
};
