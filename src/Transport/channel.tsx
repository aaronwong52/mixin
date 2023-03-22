import { useState, useEffect, useRef, useContext, Dispatch } from "react";
import { RefObject, ChangeEvent, MouseEvent, KeyboardEvent } from "react";

import { State } from "../Reducer/ReducerTypes";
import { StateContext, StateDispatchContext } from "../utils/StateContext";
import * as Tone from 'tone';
import { CompleteRecording } from "./recording";

import * as styles from './Styles/ChannelStyles';
import useKeyPress from "../utils/useKeyPress";
import { Action, ActionType } from "../Reducer/ActionTypes";
import { existsRecording } from "../Reducer/AppReducer";

export interface Channel {
    id: string;
    name: string;
    channel: Tone.Channel;
    recordings: CompleteRecording[];
    index: number;
}

export interface ChannelProps {
    key: string;
    channelData: Channel;
}

export default function Channel({channelData}: ChannelProps) {

	const [editingName, setEditingName] = useState<boolean>(false);
	const clickTimer = useRef<number>();
	
	const tempName = useRef('');
	const keyPress = useKeyPress();

	const inputWrapperRef = useRef<HTMLInputElement>(null);
	useOutsideInput(inputWrapperRef);

	const state = useContext(StateContext) as unknown as State;
	const dispatch = useContext(StateDispatchContext) as unknown as Dispatch<Action>;


	function useOutsideInput(ref: RefObject<HTMLInputElement>) {
		useEffect(() => {
			function handleClickOutside(event: globalThis.MouseEvent) {
		  		if (ref.current && !ref.current.contains(event.target as Node)) {
					// clicked outside
					setEditingName(false);
		  		}
			}
			document.addEventListener("mousedown", (e) => handleClickOutside(e));
			return () => document.removeEventListener("mousedown", (e) => handleClickOutside(e));
	  	}, [ref]);
	}

	const handleEdit = (event: ChangeEvent<HTMLInputElement>): void => {
		event.stopPropagation();
		tempName.current = event.target.value;
	};

	const handleEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
		event.stopPropagation();
		if (event.key === 'Enter' && tempName.current != '') {
			dispatch({
				type: ActionType.editChannelName, 
				payload: {id: channelData.id, name: tempName.current}
			});
			setEditingName(false);
		} else if (event.key === 'Escape') {
			setEditingName(false);
		}
	};

	const handleDoubleClick = (): void => {
		setEditingName(true);
		let input = document.getElementById('channelNameInput');
		if (input) {
			input.click();
		}
	};

	const onClickHandler = (event: MouseEvent<HTMLDivElement>): void => {
		clearTimeout(clickTimer.current);

		if (event.detail === 1) {
			clickTimer.current = setTimeout(handleSelect, 50);
		} else if (event.detail === 2 && event.target) {
			if ((event.target as Element).id == 'channelName') {
				handleDoubleClick();
			}
		}
	};

	const handleSelect = () => {
	  	dispatch({type: ActionType.selectChannel, payload: channelData.id});
	};

	const deleteSelectedRecording = () => {
        if (existsRecording(state.selectedRecording)) {
            dispatch({type: ActionType.deleteSelectedRecording, payload: state.selectedRecording});
        }
	};

	const deleteSelectedChannel = () => {
	  	dispatch({type: ActionType.deleteSelectedChannel, payload: state.selectedChannel});
	}

	useEffect(() => {
		switch(keyPress) {
			case 'Escape':

			case 'Backspace':
		  		if (Object.keys(state.selectedRecording).length != 0) {
					deleteSelectedRecording();
		  		} else if (state.selectedChannel && state.channels.length > 1) {
					deleteSelectedChannel();
		  		}
			default: return;
	  	}
	}, [keyPress]);

	return (
		<styles.ChannelHeader key={channelData.toString()}
			onClick={(e) => onClickHandler(e)} selected={channelData.id == state.selectedChannel}>
				{editingName 
			  	? <styles.ChannelNameInput type="text" id="channelNameInput"
					ref={inputWrapperRef}
					onChange={(e) => handleEdit(e)}
					onKeyDown={(e) => handleEnter(e)}
					placeholder={channelData.name}
					autoFocus={true}>
			  	</styles.ChannelNameInput>
			  	: <styles.ChannelName id="channelName">{channelData.name}</styles.ChannelName>
			}
		</styles.ChannelHeader>
    );
}