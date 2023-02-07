import * as styles from './ControlStyles';

export default function Controls() {
    return [
        <styles.ControlView>
          <styles.PlayButton id="play_btn" onClick={onPlay} playState={playing}></styles.PlayButton>
          <styles.MuteButton onClick={mute} mute={muted}></styles.MuteButton>
          <styles.RestartButton onClick={restart}></styles.RestartButton>
          <styles.ClockArea>
            <TransportClock></TransportClock>
          </styles.ClockArea>
      </styles.ControlView>
    ];
}