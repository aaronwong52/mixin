import { useState, useEffect, useRef, useContext } from 'react';
import { Transport as ToneTransport } from 'tone';
import Draggable from 'react-draggable';
import * as styles from './Styles/TransportStyles';
import { StateContext, StateDispatchContext } from '../utils/StateContext';
import { PIX_TO_TIME } from '../utils/constants';

// an absolutely positioned component to match height and with of parent, displaying a playline on top
/* @ts-ignore */
export default function Playline({height}) {
	const state = useContext(StateContext);
	const dispatch = useContext(StateDispatchContext);
    /* @ts-ignore */
	const timeRef = useRef(state.time);

	const [animation, setAnimation] = useState(null);

	  // additional reference to Transport time for updating view
	  // this reference should exist globally in the reducer? No
	  // we need Transport time to render views for playline drag and transport click to set - both of these need to sync with playview
	  // for everything p5, simply passing Transport.seconds to sketch.draw() is fine, as it runs every animation cycle
	  // for the movement of the playline when playing, the web animation handles it, and that's fine as long as animation controls
		// are handled

    /* @ts-ignore */
	const onStop = (data) => {
		let newPosition = (data.x) / PIX_TO_TIME;
		if (newPosition < 0.1) {
			newPosition = 0;
		}
		ToneTransport.seconds = newPosition;
		updateTransportPosition(newPosition);
	};

    /* @ts-ignore */
	const updateTransportPosition = (time) => {
		timeRef.current = time;
        { /* @ts-ignore */}
		dispatch({type: 'updateTransportPosition', payload: time});
	};

    /* @ts-ignore */
	const _checkPastTransport = (time) => {
        { /* @ts-ignore */}
		return time * PIX_TO_TIME > state.transportLength;
	}
	  
	useEffect(() => {
        /* @ts-ignore */
		if (_checkPastTransport(state.time)) {
			return;
		}
		const playAnimation = [
            /* @ts-ignore */
			{ transform: `translateX(${state.time * PIX_TO_TIME}px)` },
            /* @ts-ignore */
			{ transform: `translateX(${state.transportLength}px)` },
		];

        /* @ts-ignore */
		let _duration = (state.transportLength - (state.time * PIX_TO_TIME)) * 10;
		const playAnimationTiming = {
			duration: _duration >= 0 ? _duration : 0,
			fill: "forwards",
			iterations: 1
		};

		let playline = document.getElementById("playline");
		let playKeyframes = new KeyframeEffect(
			playline,
			playAnimation,
            /* @ts-ignore */
			playAnimationTiming
		);
		
		let animationObject = new Animation(playKeyframes, document.timeline);
		animationObject.oncancel = (event) => {
            /* @ts-ignore */
			playline.style.transform = `translate(${timeRef.current * PIX_TO_TIME}px, 0px)`;
		}
        /* @ts-ignore */
		setAnimation(animationObject);
        /* @ts-ignore */
	}, [state.time]);

	useEffect(() => {
		// animate the playline when start is pressed
		/* 
		
		Necessary functionality:
		Animation state should be synced with Tone Transport state
		Playline position synced with ToneTransport.seconds (it's only necessary to deliberately sync position
		outside of playback, as the animation is set up to move in realtime)
		  Unless restarted, animation location should be remembered to allow for pause / play
			- animation.play(), animation.pause() for starting / resuming
			- animation.updatePlaybackRate() when scaling transport
		  animation should always begin at ToneTransport.seconds
		
		Drag playhead when not playing to update position
		Click under transport (even when playing) to adjust position
		*/
	   
        /* @ts-ignore */
		if (!animation || _checkPastTransport(state.time)) {
			return;
	   	}
        /* @ts-ignore */
		if (state.playing) {
            /* @ts-ignore */
			animation.play();
		} else {
			updateTransportPosition(ToneTransport.seconds);
            /* @ts-ignore */
			animation.cancel();
            /* @ts-ignore */
			animation.commitStyles();
		}
        /* @ts-ignore */
	}, [state.time, state.playing]);

	return [
		<styles.PlaylineView key={"playline_elem"}>
			<Draggable bounds={{left: 0, top: 0, bottom: 0}}
			onStop={(e, data) => onStop(data)}
            /* @ts-ignore */
			position={{x: state.time * PIX_TO_TIME, y: 0}}>
                {/* @ts-ignore */}
				<styles.StyledPlayline id="playline" height={height}>
				</styles.StyledPlayline>
		  </Draggable>
		</styles.PlaylineView>
	];
};