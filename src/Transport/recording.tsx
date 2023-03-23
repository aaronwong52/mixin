import { useRef, useEffect, useContext, Dispatch, RefObject } from "react";
import { Player, ToneAudioBuffer } from "tone";

import { StateDispatchContext } from "../utils/StateContext";
import { SnapContext } from "./SnapContext";
import { CHANNEL_SIZE, PIX_TO_TIME } from "../utils/constants";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

import * as styles from './Styles/ChannelStyles';
import { Action, ActionType } from "../Reducer/ActionTypes";

export interface RecordingType {
    id: string;
    channel: string;
    position: number;
    duration: number;
    start: number;
    data: string | ToneAudioBuffer | AudioBuffer;
    player: Player;
    solo: boolean;
}

export interface IncompleteRecording {
    id: string;
    channel: string;
    position: number;
    duration: number;
    start: number;
    data: string | ToneAudioBuffer | AudioBuffer;
    player?: Player;
    solo: boolean;
}

export type EmptyRecording = {
    id: string;
}

interface RecordingProps {
    r: RecordingType,
    onDrag: (e: DraggableEvent) => void,
    onStop: (data: DraggableData, r: RecordingType) => void,
    selected: RecordingType | EmptyRecording,
    channelIndex: number
}

export default function Recording({r, onDrag, onStop, selected, channelIndex}: RecordingProps) {

	const dispatch = useContext(StateDispatchContext) as unknown as Dispatch<Action>;
	const snapState = useContext(SnapContext);

	const recordingsWrapperRef = useRef<HTMLDivElement>(null);
	useOutsideRecordings(recordingsWrapperRef);

	function useOutsideRecordings(ref: RefObject<HTMLDivElement>) {
		useEffect(() => {
			function handleClickOutside(event: globalThis.MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				if ((event.target as HTMLElement).id != "recordings_view") {
					return;
				}
				// clicked outside
				dispatch({type: ActionType.deselectRecordings});
			}
			}
			document.addEventListener("mousedown", (e) => handleClickOutside(e));
			return () => document.removeEventListener("mousedown", (e) => handleClickOutside(e));
		}, [ref]);
	}

	useEffect(() => {
		let recording = document.getElementById("recording_clip_" + r.id) as HTMLElement;
		let clipWidth = r.duration - r.start;
		recording.style.width = (clipWidth * PIX_TO_TIME) + "px";
	}, [r]);

	return (
		<Draggable key={"drag_rec_clip_" + r.id}
			onDrag={(e) => onDrag(e)}
			onStop={(e, data) => onStop(data, r)}
			bounds={"parent"}
			position={{x: r.start * PIX_TO_TIME, y: channelIndex * CHANNEL_SIZE}}
			grid={snapState ? [PIX_TO_TIME / 4, CHANNEL_SIZE] : [-1, CHANNEL_SIZE]}
			scale={1}>
			<styles.RecordingView
				ref={recordingsWrapperRef}
				selected = {r.id == selected.id} 
				id = {"recording_clip_" + r.id}>
			</styles.RecordingView>
		</Draggable>
    );
}