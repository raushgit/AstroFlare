import { useState } from 'react'
import { Icon } from '@iconify/react'

const LayerControl = ({
    layers,
    onToggleLayer,
    onOpacityChange
}) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="layer-control-container">
            <button
                className={`layer-control-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Environmental Layers Menu"
                title="Environmental Overlays"
            >
                <Icon icon="mdi:layers-triple" />
                <span>Layers</span>
            </button>

            {isOpen && (
                <div className="layer-control-panel">
                    <div className="layer-control-header">
                        <h3>Environmental Overlays</h3>
                        <button className="close-btn-sm" onClick={() => setIsOpen(false)}>
                            <Icon icon="mdi:close" />
                        </button>
                    </div>

                    <div className="layer-list">
                        {/* NASA GIBS Satellite Layer */}
                        <div className="layer-item">
                            <div className="layer-item-top">
                                <label className="layer-label">
                                    <input
                                        type="checkbox"
                                        checked={layers.satellite.active}
                                        onChange={() => onToggleLayer('satellite')}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <Icon icon="mdi:satellite-variant" className="layer-icon satellite" />
                                    <span>NASA Satellite (MODIS)</span>
                                </label>
                            </div>
                            {layers.satellite.active && (
                                <div className="opacity-control">
                                    <span>Opacity: {Math.round(layers.satellite.opacity * 100)}%</span>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.05"
                                        value={layers.satellite.opacity}
                                        onChange={(e) => onOpacityChange('satellite', parseFloat(e.target.value))}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Wind Vectors Layer */}
                        <div className="layer-item">
                            <div className="layer-item-top">
                                <label className="layer-label">
                                    <input
                                        type="checkbox"
                                        checked={layers.wind.active}
                                        onChange={() => onToggleLayer('wind')}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <Icon icon="mdi:weather-windy" className="layer-icon wind" />
                                    <span>Wind Vectors</span>
                                </label>
                            </div>
                            {layers.wind.active && (
                                <div className="opacity-control">
                                    <span>Opacity: {Math.round(layers.wind.opacity * 100)}%</span>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.05"
                                        value={layers.wind.opacity}
                                        onChange={(e) => onOpacityChange('wind', parseFloat(e.target.value))}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Air Quality (AQI / PM2.5) Layer */}
                        <div className="layer-item">
                            <div className="layer-item-top">
                                <label className="layer-label">
                                    <input
                                        type="checkbox"
                                        checked={layers.aqi.active}
                                        onChange={() => onToggleLayer('aqi')}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <Icon icon="mdi:air-filter" className="layer-icon aqi" />
                                    <span>Air Quality Index (AQI)</span>
                                </label>
                            </div>
                            {layers.aqi.active && (
                                <div className="opacity-control">
                                    <span>Opacity: {Math.round(layers.aqi.opacity * 100)}%</span>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.05"
                                        value={layers.aqi.opacity}
                                        onChange={(e) => onOpacityChange('aqi', parseFloat(e.target.value))}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LayerControl
