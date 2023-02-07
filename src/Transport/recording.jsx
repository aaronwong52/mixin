import * as styles from './recordingStyles';

function Recording() {
    return [
        <styles.RecordingView key={Math.random()} className="recording_clip">
        </styles.RecordingView>
    ]
}

export default Recording;
