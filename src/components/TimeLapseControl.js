import { useState } from 'react'
import { Icon } from '@iconify/react'

const TimeLapseControl = ({
    currentTimestamp,
    minTimestamp,
    maxTimestamp,
    isPlaying,
    playbackSpeed,
    onTogglePlay,
    onStep,
    onSeek,
    onSpeedChange
}) => {
    const [isVisible, setIsVisible] = useState(true)

    if (!minTimestamp || !maxTimestamp) return null

    const currentDateObj = new Date(currentTimestamp)
    const minDateObj = new Date(minTimestamp)
    const maxDateObj = new Date(maxTimestamp)

    const formattedCurrentDate = currentDateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })

    const formattedMinDate = minDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    const formattedMaxDate = maxDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

    if (!isVisible) {
        return (
            <button
                className="timelapse-reopen-btn"
                onClick={() => setIsVisible(true)}
                title="Show Timeline Controls"
            >
                <Icon icon="mdi:calendar-clock" />
                <span>Timeline: {formattedCurrentDate}</span>
            </button>
        )
    }

    return (
        <div className="timelapse-bar">
            <div className="timelapse-top">
                <div className="timelapse-controls">
                    <button className="control-btn play-btn" onClick={onTogglePlay} aria-label={isPlaying ? "Pause playback" : "Play timeline"}>
                        <Icon icon={isPlaying ? "mdi:pause" : "mdi:play"} />
                    </button>
                    <button className="control-btn" onClick={() => onStep(-1)} aria-label="Previous day">
                        <Icon icon="mdi:skip-previous" />
                    </button>
                    <button className="control-btn" onClick={() => onStep(1)} aria-label="Next day">
                        <Icon icon="mdi:skip-next" />
                    </button>
                </div>

                <div className="date-badge">
                    <Icon icon="mdi:calendar-clock" className="date-badge-icon" />
                    <span>Timeline: {formattedCurrentDate}</span>
                </div>

                <div className="speed-pills">
                    {[1, 2, 5].map((speed) => (
                        <button
                            key={speed}
                            className={`speed-pill ${playbackSpeed === speed ? 'active' : ''}`}
                            onClick={() => onSpeedChange(speed)}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>

                <button
                    className="timelapse-close-btn"
                    onClick={() => setIsVisible(false)}
                    aria-label="Close timeline control tab"
                    title="Close Timeline Controls"
                >
                    <Icon icon="mdi:close" />
                </button>
            </div>

            <div className="timelapse-slider-container">
                <span className="slider-label">{formattedMinDate}</span>
                <input
                    type="range"
                    min={minTimestamp}
                    max={maxTimestamp}
                    step={86400000} // 1 day in ms
                    value={currentTimestamp}
                    onChange={(e) => onSeek(Number(e.target.value))}
                    className="timelapse-slider"
                />
                <span className="slider-label">Today ({formattedMaxDate})</span>
            </div>
        </div>
    )
}

export default TimeLapseControl
