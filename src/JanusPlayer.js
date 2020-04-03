import React, { Component } from 'react';
import Janus from './utils/janus';
import subscribeFeed from './utils/janus-subscriber';

class JanusPlayer extends Component {

    constructor(props) {
        super(props);
        this.videoNode = React.createRef();
    }

    componentDidMount() {

        const { server, iceServers, apisecret, videoOptions } = { ...this.props };

        const remoteFeedCallback = (eventType, stream) => {
            if (eventType === 'onremotestream') {
                Janus.attachMediaStream(this.videoNode.current, stream);

                const videoTracks = stream.getVideoTracks();

                if (videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
                    Janus.log('Error');
                }

            } else if (eventType === 'oncleanup') {
                Janus.log('Paused');
            } else if (eventType === 'error') {
                Janus.log('Error');
            }
        }

        Janus.init({
            debug: 'all',
            dependencies: Janus.useDefaultDependencies(),
            callback: () => {

                if (!Janus.isWebrtcSupported()) {
                    Janus.log(' ::: No WebRTC support... ::: ');
                    return;
                }

                const janus = new Janus({
                    server: server,
                    dependencies: Janus.useDefaultDependencies(),
                    // No "iceServers" is provided, meaning janus.js will use a default STUN server
                    // Here are some examples of how an iceServers field may look like to support TURN
                    // 		iceServers: [{urls: "turn:yourturnserver.com:3478", username: "janususer", credential: "januspwd"}],
                    // 		iceServers: [{urls: "turn:yourturnserver.com:443?transport=tcp", username: "janususer", credential: "januspwd"}],
                    // 		iceServers: [{urls: "turns:yourturnserver.com:443?transport=tcp", username: "janususer", credential: "januspwd"}],
                    // Should the Janus API require authentication, you can specify either the API secret or user token here too
                    //		token: "mytoken",
                    //	or
                    //		apisecret: "serversecret",

                    iceServers: iceServers,
                    apisecret: apisecret,

                    success: () => {
                        console.log(' ::: Janus loaded... ::: ');
                        videoOptions.opaqueId = `streamingtest-${Janus.randomString(12)}`;

                        subscribeFeed({ janus, apisecret, ...videoOptions, callback: remoteFeedCallback });
                    },
                    error: (error) => {
                        Janus.error(error);
                    },
                    destroyed: () => {
                        console.log('destroyed');
                    }
                });
            }
        });
    }

    render() {
        return (
            <React.Fragment>
                <video ref={this.videoNode} autoPlay playsInline controls width='340' height='200' />
            </React.Fragment>
        )
    }
}

export default JanusPlayer;