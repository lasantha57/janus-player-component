import Janus from './janus';

const subscribeFeed = ({
  janus,
  apisecret,
  opaqueId,
  videoid,
  streamid,
  request,
  type,
  name,
  description,
  audio,
  audioport,
  audiopt,
  audiortpmap,
  video,
  videoport,
  videopt,
  videortpmap,
  videofmtp,
  callback
}) => {

  if (!janus) {
    Janus.error(' ::: Janus has not loaded ::: ');
    return;
  }

  janus.attach({
    plugin: 'janus.plugin.streaming',
    opaqueId: opaqueId,

    success: (pluginHandle) => {
      janus.streaming = pluginHandle;
      startStream();
    },
    error: (error) => {
      Janus.error(' ::: Error attaching plugin ::: ', error);
      callback('error', error);
    },
    onmessage: (msg, jsep) => {
      Janus.debug(' ::: Got a message (subscriber) ::: ');
      Janus.debug(msg);

      if (msg['error_code'] === 455) {
        Janus.error(` ::: Mountpoint error. Recreating stream ${videoid}  ::: `);
        recreateStream();
      }

      if (jsep !== undefined && jsep !== null) {
        Janus.debug(' ::: SUBS: Handling SDP as well...  ::: ');
        Janus.debug(jsep);

        janus.streaming.createAnswer({
          jsep: jsep,
          media: {
            audioSend: false,
            videoSend: false,
            data: false
          },

          success: (jsep) => {
            Janus.debug(' ::: Got SDP! ::: ');
            Janus.debug(jsep);

            const body = { request: 'start' };

            janus.streaming.send({
              message: body,
              jsep: jsep,

              success: (result) => {
                Janus.log(' ::: JSEP Start sent ' + result);
              },

              error: (error) => {
                Janus.error(' ::: JSEP Start failed ' + error);
              }
            });
          },

          error: (error) => {
            Janus.error(' ::: WebRTC error:', error);
          }
        });
      }
    },
    onremotestream: (stream) => {
      Janus.log(` ::: Remote stream attaching to ${videoid}  ::: `);
      callback('onremotestream', stream);
    },
    oncleanup: () => {
      callback('oncleanup');
    }
  });

  function startStream() {
    const body = {
      request: 'watch',
      id: streamid
    };

    janus.streaming.send({
      message: body,

      success: (result) => {
        Janus.log(` ::: Stream ${videoid} started  ::: `);
      },

      error: (error) => {
        Janus.log('error: ' + error);
      }
    });
  }

  function recreateStream() {
    const body = {
      id: streamid,
      request: 'destroy',
    };

    Janus.log(' ::: Destroying stream ::: ');

    janus.streaming.send({
      'message': body,

      success: (result) => {
        Janus.log(` ::: Stream ${streamid} destroyed ::: `);
        createStream();
      },

      error: (error) => {
        Janus.error(` ::: Error destroying stream ${error}  ::: `);
      }
    });
  }

  function createStream() {
    const body = {
      id: streamid,
      request: request,
      apisecret: apisecret,
      type: type,
      name: name,
      description: description,
      audio: audio,
      audioport: audioport,
      audiopt: audiopt,
      audiortpmap: audiortpmap,
      video: video,
      videoport: videoport,
      videopt: videopt,
      videortpmap: videortpmap,
      videofmtp: videofmtp
    };

    janus.streaming.send({
      message: body,

      success: (result) => {
        Janus.log(` ::: Stream ${streamid} created  ::: `);
        startStream();
      },

      error: (error) => {
        Janus.error(` ::: Error creating stream ${streamid} ${error}  ::: `);
      }
    });
  }
}

export default subscribeFeed;