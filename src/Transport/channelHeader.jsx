import { useState, useRef } from "react";

import * as styles from './channelHeaderStyles';

export default function ChannelHeader({channelName}) {

    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState(channelName);
    const tempName = useRef('');

    const handleEdit = (event) => {
        tempName.current = event.target.value;
    }

    const handleEnter = (event) => {
        if (event.key === 'Enter') {
            setName(tempName.current);
            setEditingName(false);
        } else if (event.key === 'Escape') {
            setEditingName(false);
        }
    }

    const handleDoubleClick = () => {
        setEditingName(true);
    }

    return [
        <styles.ChannelHeader>
            {editingName ? (
                <styles.ChannelNameInput type="text" 
                    onChange={handleEdit}
                    onKeyDown={handleEnter}
                    placeholder={name}>
                </styles.ChannelNameInput>
            ) : (
                <styles.ChannelName onDoubleClick={handleDoubleClick}>{name}</styles.ChannelName>
            )}
        </styles.ChannelHeader>
    ]
}