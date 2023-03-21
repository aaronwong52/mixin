import { useState, useEffect, useRef, useContext, Dispatch } from 'react';
import { Transport as ToneTransport } from 'tone';
import Draggable, { DraggableData } from 'react-draggable';
import * as styles from './Styles/transportStyles';
import { StateContext, StateDispatchContext } from '../utils/StateContext';
import { PIX_TO_TIME } from '../utils/constants';
import { Action, ActionType, State } from '../Reducer/AppReducer';


export default function Playline({height}: styles.HeightProp) {
	const state = useContext(StateContext) as unknown as State;
	const dispatch = useContext(StateDispatchContext) as unknown as Dispatch<Action>;
	const timeRef = useRef(state.time);

	const [animation, setAnimation] = useState<Animation>();

	  // additional reference to Transport time for updating view
	  // this reference should exist globally in the reducer? No
	  // we need Transport time to render views for playline drag and transport click to set - both of these need to sync with playview
	  // for everything p5, simply passing Transport.seconds to sketch.draw() is fine, as it runs every animation cycle
	  // for the movement of the playline when playing, the web animation handles it, and that's fine as long as animation controls
		// are handled

	const onStop = (data: DraggableData): void => {
		let newPosition = (data.x) / PIX_TO_TIME;
		if (newPosition < 0.1) {
			newPosition = 0;
		}
		ToneTransport.seconds = newPosition;
		updateTransportPosition(newPosition);
	};

	const updateTransportPosition = (time: number): void => {
		timeRef.current = time;
		dispatch({type: ActionType.updateTransportPosition, payload: time});
	};

	const _checkPastTransport = (time: number): boolean => {
		return time * PIX_TO_TIME > state.transportLength;
	}
	  
	useEffect(() => {
		if (_checkPastTransport(state.time)) {
			return;
		}
        
		const playAnimation: Keyframe[] = [
			{ transform: `translateX(${state.time * PIX_TO_TIME}px)` },
			{ transform: `translateX(${state.transportLength}px)` },
		];

		let _duration = (state.transportLength - (state.time * PIX_TO_TIME)) * 10;
		const playAnimationTiming: KeyframeEffectOptions = {
			duration: _duration >= 0 ? _duration : 0,
			fill: "forwards",
			iterations: 1
		};

		let playline = document.getElementById("playline") as HTMLElement;
		let playKeyframes = new KeyframeEffect(
			playline,
			playAnimation,
			playAnimationTiming
		);
		
		let animationObject: Animation = new Animation(playKeyframes, document.timeline);
		animationObject.oncancel = (event) => {
			playline.style.transform = `translate(${timeRef.current * PIX_TO_TIME}px, 0px)`;
		}
		setAnimation(animationObject);
	}, [state.time]);

	useEffect(() => {
		if (!animation || _checkPastTransport(ToneTransport.seconds)) {
			return;
	   	}
		if (state.playing) {
			animation.play();
		} else {
			animation.cancel();
			animation.commitStyles();
            updateTransportPosition(ToneTransport.seconds);
		}
	}, [state.time, state.playing]);

	return (
		<styles.PlaylineView key={"playline_elem"}>
			<Draggable bounds={{left: 0, top: 0, bottom: 0}}
			onStop={(e, data) => onStop(data)}
			position={{x: state.time * PIX_TO_TIME, y: 0}}>
				<styles.StyledPlayline id="playline" height={height}>
				</styles.StyledPlayline>
		  </Draggable>
		</styles.PlaylineView>
    );
};