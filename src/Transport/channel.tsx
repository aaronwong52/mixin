import { useState, useEffect, useRef, useContext } from "react";

import { StateContext, StateDispatchContext } from "../utils/StateContext";

import * as styles from './Styles/ChannelStyles';
import useKeyPress from "../utils/useKeyPress";

{ /* @ts-ignore */}
export default function Channel({channelName, channelData}) {

	const [editingName, setEditingName] = useState(false);
	const clickTimer = useRef();
	
	const tempName = useRef('');
	const keyPress = useKeyPress();

	const inputWrapperRef = useRef(null);
	useOutsideInput(inputWrapperRef);

	const state = useContext(StateContext);
	const dispatch = useContext(StateDispatchContext);

    { /* @ts-ignore */}
	function useOutsideInput(ref) {
		useEffect(() => {
            { /* @ts-ignore */}
			function handleClickOutside(event) {
		  		if (ref.current && !ref.current.contains(event.target)) {
					// clicked outside
					setEditingName(false);
		  		}
			}
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
	  	}, [ref]);
	}

    { /* @ts-ignore */}
	const handleEdit = (event) => {
		event.stopPropagation();
		tempName.current = event.target.value;
	};

    { /* @ts-ignore */}
	const handleEnter = (event) => {
		event.stopPropagation();
		if (event.key === 'Enter' && tempName.current != '') {
            { /* @ts-ignore */}
			dispatch({
				type: 'editChannelName', 
				payload: {channelId: channelData.id, name: tempName.current}
			});
			setEditingName(false);
		} else if (event.key === 'Escape') {
			setEditingName(false);
		}
	};

	const handleDoubleClick = () => {
		setEditingName(true);
		let input = document.getElementById('channelNameInput');
		if (input) {
			input.click();
		}
	};

    { /* @ts-ignore */}
	const onClickHandler = (event) => {
		clearTimeout(clickTimer.current);

		if (event.detail === 1) {
            { /* @ts-ignore */}
			clickTimer.current = setTimeout(handleSelect, 50);
		} else if (event.detail === 2) {
			if (event.target.id == 'channelName') {
				handleDoubleClick();
			}
		}
	};

	const handleSelect = () => {
        { /* @ts-ignore */}
	  	dispatch({type: 'selectChannel', payload: channelData.id});
	};

	// deletes selected recording
	const deleteSelectedRecording = () => {
        { /* @ts-ignore */}
	  	dispatch({type: 'deleteSelectedRecording', payload: state.selectedRecording});
	};

	const deleteSelectedChannel = () => {
        { /* @ts-ignore */}
	  	dispatch({type: 'deleteSelectedChannel', payload: state.selectedChannel});
	}

	useEffect(() => {
		switch(keyPress) {
			case 'Escape':

			case 'Backspace':
                { /* @ts-ignore */}
		  		if (Object.keys(state.selectedRecording).length != 0) {
					deleteSelectedRecording();
                    { /* @ts-ignore */}
		  		} else if (state.selectedChannel && state.channels.length > 1) {
					deleteSelectedChannel();
		  		}
			default: return;
	  	}
	}, [keyPress]);

	return [
		<styles.ChannelHeader key={channelData.toString()}
            /* @ts-ignore */
			onClick={onClickHandler} selected={channelData.id == state.selectedChannel}>
				{editingName 
			  	? <styles.ChannelNameInput type="text" id="channelNameInput"
					ref={inputWrapperRef}
					onChange={handleEdit}
					onKeyDown={handleEnter}
					placeholder={channelName}
					autoFocus={true}>
			  	</styles.ChannelNameInput>
			  	: <styles.ChannelName id="channelName">{channelName}</styles.ChannelName>
			}
		</styles.ChannelHeader>
	];
}