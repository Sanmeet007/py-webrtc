const localVideoEl = document.querySelector("#local");
const remoteVideoEl = document.querySelector("#remote");
const socket = io(); // SocketIO object

let isInitiator = true;
let localStream, remoteStreams;
let PeerConnection;

/**
 * Socket functions
 */

socket.on("offer", async (offer) => {
  console.log("Someone is calling");
  await shouldAnswer(offer);
});

socket.on("answer", async (answer) => {
  await acceptAnswer(answer);
  console.log("call accepted");
});

socket.on("candidate", async (candidate) => {
  if (PeerConnection) {
    PeerConnection.addIceCandidate(candidate);
  }
});

const shouldAnswer = async (offer) => {
  const userChoice = confirm("Accept call ?");
  if (userChoice === true) {
    await answerCall(offer);
  } else {
    console.log("Call denied");
  }
};

/**
 * Functionality
 */

const makeCall = async () => {
  try {
    const offer = await createOffer();
    await socket.emit("offer", offer);
  } catch (E) {
    console.log("Unable to place call", E);
  }
};

const answerCall = async (offer) => {
  try {
    const answer = await generateAnswer(offer);
    await socket.emit("answer", answer);
  } catch (E) {
    console.log("Unable to answer call", E);
  }
};

/**
 * RTCPeerConnection functions
 */

// Adds all the necessary events for the peer connection
const addPeerStreamAndEvents = async (peerConnection) => {
  localStream.getTracks().forEach((track) => {
    PeerConnection.addTrack(track, localStream);
  });

  peerConnection.oniceconnectionstatechange = async (event) => {
    // console.log("ICE state: ", peerConnection.iceConnectionState, event);
    // Uncomment for debugging
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate != null) {
      socket.emit("candidate", event.candidate);
    }
  };

  peerConnection.ontrack = (event) => {
    updateRemoteStream(event.streams);
  };
};

const endConnection = async (peerConnection) => {
  peerConnection.close();
};

// Creates the offer
const createOffer = async () => {
  try {
    if (localStream instanceof MediaStream) {
      PeerConnection = new RTCPeerConnection();
      addPeerStreamAndEvents(PeerConnection);
      const offer = await PeerConnection.createOffer();
      await PeerConnection.setLocalDescription(offer);
      return offer;
    } else {
      throw Error("Unable to attach local stream to peer connection...");
    }
  } catch (E) {
    console.log(E);
  }
};

// Sets the answer generated against the offer
const acceptAnswer = async (answer) => {
  try {
    await PeerConnection.setRemoteDescription(answer);
  } catch (e) {
    console.log(e);
  }
};

// Generates answer against the offer
const generateAnswer = async (offer) => {
  try {
    if (localStream instanceof MediaStream) {
      PeerConnection = new RTCPeerConnection();
      addPeerStreamAndEvents(PeerConnection);
      await PeerConnection.setRemoteDescription(offer);
      const answer = await PeerConnection.createAnswer(offer);
      await PeerConnection.setLocalDescription(answer);
      return answer;
    } else {
      throw Error("Unalble to attach media strem to the peer connection...");
    }
  } catch (E) {
    console.log(E);
  }
};

/**
 * Stream function
 */

// Grabs the video stream from users device and stores it in localStream variable
const grabWebVideo = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        mirror: true,
      },
      audio: false,
    });

    localStream = mediaStream;
    localVideoEl.srcObject = localStream;
  } catch (E) {
    console.log(E);
  }
};

// Pauses all the track of the localStream ( user's media stream )
const pauseStream = async () => {
  if (localStream instanceof MediaStream) {
    localStream.getTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  }
};

// Stops all the track of the localStream ( user's media stream )
const endStream = async () => {
  if (localStream instanceof MediaStream) {
    if (PeerConnection) {
      endConnection(PeerConnection);
    }
    localStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  return;
};

const updateRemoteStream = (streams) => {
  console.log("Updating the remote stream...");
  remoteStreams = streams;
  remoteVideoEl.srcObject = streams[0];
  console.log("Updated streams");
};

/**
 * UI functions
 */

grabWebVideo();
