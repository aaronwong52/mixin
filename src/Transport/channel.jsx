import { useState, useEffect, useRef, useContext } from "react";

import { StateContext, StateDispatchContext } from "../utils/StateContext";

import * as styles from './Styles/ChannelStyles';
import useKeyPress from "../utils/useKeyPress";

export default function Channel({channelName, channelData}) {

	const [editingName, setEditingName] = useState(false);
	const clickTimer = useRef();
	
	const tempName = useRef('');
	const keyPress = useKeyPress();

	const inputWrapperRef = useRef(null);
	useOutsideInput(inputWrapperRef);

	const state = useContext(StateContext);
	const dispatch = useContext(StateDispatchContext);

	function useOutsideInput(ref) {
		useEffect(() => {
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

	const handleEdit = (event) => {
		event.stopPropagation();
		tempName.current = event.target.value;
	};

	const handleEnter = (event) => {
		event.stopPropagation();
		if (event.key === 'Enter' && tempName.current != '') {
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

	const onClickHandler = (event) => {
		clearTimeout(clickTimer.current);

		if (event.detail === 1) {
			clickTimer.current = setTimeout(handleSelect, 50);
		} else if (event.detail === 2) {
			if (event.target.id == 'channelName') {
				handleDoubleClick();
			}
		}
	};

	const handleSelect = () => {
	  	dispatch({type: 'selectChannel', payload: channelData.id});
	};

	// deletes selected recording
	const deleteSelectedRecording = () => {
	  	dispatch({type: 'deleteSelectedRecording', payload: state.selectedRecording});
	};

	const deleteSelectedChannel = () => {
	  	dispatch({type: 'deleteSelectedChannel', payload: state.selectedChannel});
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

	return [
		<styles.ChannelHeader key={channelData.toString()}
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