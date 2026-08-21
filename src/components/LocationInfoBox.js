import { Icon } from '@iconify/react'

const LocationInfoBox = ({ info, onClose, onAnalyzeRiskArea, infrastructureData, loadingInfrastructure }) => {
    if (!info) return null

    const { id, title, category, lat, lng, date } = info

    let categoryClass = 'wildfire'
    let categoryName = 'Wildfire'
    let isWildfire = true

    if (category === 12 || category === 'volcanoes') {
        categoryClass = 'volcano'
        categoryName = 'Volcano'
        isWildfire = false
    } else if (category === 10 || category === 'severeStorms') {
        categoryClass = 'storm'
        categoryName = 'Severe Storm'
        isWildfire = false
    } else if (category === 15 || category === 'seaLakeIce') {
        categoryClass = 'ice'
        categoryName = 'Sea & Lake Ice'
        isWildfire = false
    }

    const formattedDate = date ? new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : 'N/A'

    const googleMapsUrl = lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : null

    const hospitalCount = infrastructureData ? infrastructureData.filter(i => i.type === 'hospital').length : 0
    const schoolCount = infrastructureData ? infrastructureData.filter(i => i.type === 'school').length : 0
    const fireStationCount = infrastructureData ? infrastructureData.filter(i => i.type === 'fire_station').length : 0

    return (
        <div className="location-info">
            <div className="location-info-header">
                <div className="location-info-title">
                    <span className={`category-tag ${categoryClass}`}>{categoryName}</span>
                    <h2>{title}</h2>
                </div>
                {onClose && (
                    <button className="close-btn" onClick={onClose} aria-label="Close detail panel">
                        <Icon icon="mdi:close" />
                    </button>
                )}
            </div>

            <div className="location-info-body">
                <div className="info-row">
                    <span>NASA Event ID:</span>
                    <span>{id}</span>
                </div>
                <div className="info-row">
                    <span>Detected Date:</span>
                    <span>{formattedDate}</span>
                </div>
                {lat && lng && (
                    <div className="info-row">
                        <span>Coordinates:</span>
                        <span>{lat.toFixed(4)}°, {lng.toFixed(4)}°</span>
                    </div>
                )}
                {googleMapsUrl && (
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="google-maps-btn">
                        <span>View Location on Google Maps</span>
                        <Icon icon="mdi:open-in-new" />
                    </a>
                )}

                {isWildfire && (
                    <div className="risk-analysis-section">
                        <div className="section-divider"></div>
                        <div className="risk-analysis-header">
                            <Icon icon="mdi:radar" className="radar-icon" />
                            <h3>15-Mile Infrastructure Risk Area</h3>
                        </div>

                        <button
                            className="analyze-risk-btn"
                            onClick={() => onAnalyzeRiskArea && onAnalyzeRiskArea(info)}
                            disabled={loadingInfrastructure}
                        >
                            <Icon icon={loadingInfrastructure ? "mdi:loading" : "mdi:office-building-marker"} className={loadingInfrastructure ? "spin" : ""} />
                            <span>{loadingInfrastructure ? 'Querying Overpass OpenStreetMap...' : 'Analyze Risk Area (15 mi Radius)'}</span>
                        </button>

                        {infrastructureData && (
                            <div className="infrastructure-results">
                                <div className="infra-summary-grid">
                                    <div className="infra-stat hospital">
                                        <Icon icon="mdi:hospital-building" />
                                        <span className="count">{hospitalCount}</span>
                                        <span className="label">Hospitals</span>
                                    </div>
                                    <div className="infra-stat school">
                                        <Icon icon="mdi:school" />
                                        <span className="count">{schoolCount}</span>
                                        <span className="label">Schools</span>
                                    </div>
                                    <div className="infra-stat fire-station">
                                        <Icon icon="mdi:fire-truck" />
                                        <span className="count">{fireStationCount}</span>
                                        <span className="label">Fire Stations</span>
                                    </div>
                                </div>

                                <div className="infra-list-container">
                                    <h4>Facilities Plotted on Map ({infrastructureData.length})</h4>
                                    {infrastructureData.length === 0 ? (
                                        <p className="no-infra-text">No major infrastructure facilities found within 15 miles via Overpass API.</p>
                                    ) : (
                                        <div className="infra-items-scroll">
                                            {infrastructureData.slice(0, 8).map((facility, idx) => (
                                                <div key={idx} className="infra-item-card">
                                                    <Icon icon={
                                                        facility.type === 'hospital' ? 'mdi:hospital-building' :
                                                        facility.type === 'school' ? 'mdi:school' : 'mdi:fire-truck'
                                                    } className={`facility-icon ${facility.type}`} />
                                                    <div className="facility-details">
                                                        <span className="facility-name">{facility.name}</span>
                                                        <span className="facility-meta">{facility.type.replace('_', ' ').toUpperCase()} • {facility.distanceMiles} mi away</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {infrastructureData.length > 8 && (
                                                <div className="more-infra-count">+ {infrastructureData.length - 8} more facilities displayed on map</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="evacuation-notice-placeholder">
                                    <Icon icon="mdi:alert-decagram" />
                                    <div>
                                        <strong>EVACUATION ALERT (PLACEHOLDER)</strong>
                                        <p>Critical infrastructure within 15-mile perimeter. Automated evacuation route calculation ready upon local authority trigger.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LocationInfoBox
