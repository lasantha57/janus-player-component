import React from 'react';
import JanusPlayer from './JanusPlayer';

const streamid = 31;
const options = {
  server: 'ws://35.193.69.236:8188',
  //iceServers: [{ urls: 'turn:35.193.69.236:3478', username: 'janususer', credential: 'januspwd' }],
  iceServers: [{ urls: 'stun:35.193.69.236:3478' }],
  //iceServers: '',
  apisecret: 'supersecret',
  videoOptions: {
    videoid: 'video1',
    streamid: streamid,
    request: 'create',
    type: 'live',
    name: 'H264-demo-' + streamid,
    description: 'New stream',
    audio: true,
    audioport: 10000 + streamid,
    audiopt: 111,
    audiortpmap: 'opus/48000/2',
    video: true,
    videoport: 11000 + streamid,
    videopt: 126,
    videortpmap: 'H264/90000',
    videofmtp: 'profile-level-id=42e01f\;packetization-mode=1'
  }
}

function App() {
  return (
    <div>
      <JanusPlayer options={options}></JanusPlayer>
    </div>
  );
}

export default App;
