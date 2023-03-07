import { useState } from 'react';

import * as styles from './Styles/SettingsStyles';
import Export from '../Settings/Export';

export default function Settings({displayState, channels}) {

    const [optionSelected, setOptionSelected] = useState(false);
    const [exporting, setExporting] = useState(false);

    const setOption = (option) => {
        setOptionSelected(true);
        switch(option) {
            case 'export': setExporting(true);
        }
    };

    const unsetOption = () => {
        setOptionSelected(false);
    }

    return (
        <styles.SettingsView displayState={displayState}>
            {optionSelected
                ? <styles.OptionView>
                    <styles.OptionHeader>
                        <styles.OptionBack onClick={unsetOption}></styles.OptionBack>
                        <styles.OptionTitle>Export</styles.OptionTitle>
                    </styles.OptionHeader>
                    <Export displayState={exporting} channels={channels}></Export>
                </styles.OptionView>
                : <styles.SettingsOptions>
                    <styles.SettingsOption>Project</styles.SettingsOption>
                    <styles.SettingsOption>Microphone</styles.SettingsOption>
                    <styles.SettingsOption>Recordings</styles.SettingsOption>
                    <styles.SettingsOption onClick={() => setOption('export')}>Export</styles.SettingsOption>
                </styles.SettingsOptions>
            }
        </styles.SettingsView>
    );
}