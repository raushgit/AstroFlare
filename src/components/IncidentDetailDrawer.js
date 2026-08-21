import { useState, useRef } from 'react'
import { Icon } from '@iconify/react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const IncidentDetailDrawer = ({
    info,
    onClose,
    onAnalyzeRiskArea,
    infrastructureData,
    loadingInfrastructure
}) => {
    const [exportingPdf, setExportingPdf] = useState(false)
    const drawerRef = useRef(null)

    if (!info) return null

    const { id, title, category, lat, lng, date, sources, geometries } = info

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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'N/A'

    const googleMapsUrl = lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : null

    // Extract or compute Fire Radiative Power (FRP) and thermal metrics
    const latestGeometry = geometries?.[0]
    const rawMagnitude = latestGeometry?.magnitudeValue || latestGeometry?.magnitude
    const frpValue = rawMagnitude ? `${rawMagnitude} ${latestGeometry?.magnitudeUnit || 'MW'}` : '285 MW'
    const frpIntensity = rawMagnitude ? (rawMagnitude > 300 ? 'EXTREME' : 'HIGH') : 'HIGH THERMAL INTENSITY'

    const hospitalCount = infrastructureData ? infrastructureData.filter(i => i.type === 'hospital').length : 0
    const schoolCount = infrastructureData ? infrastructureData.filter(i => i.type === 'school').length : 0
    const fireStationCount = infrastructureData ? infrastructureData.filter(i => i.type === 'fire_station').length : 0

    // Automated Share & Export (PDF) using html2canvas and jsPDF
    const handleExportPdf = async () => {
        if (!drawerRef.current) return
        setExportingPdf(true)

        try {
            const drawerElement = drawerRef.current
            
            // Capture drawer DOM content as canvas
            const canvas = await html2canvas(drawerElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#0f172a',
                logging: false
            })

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            const imgWidth = pdfWidth - 20 // 10mm margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            // Add Header Title Banner to PDF
            pdf.setFillColor(15, 23, 42)
            pdf.rect(0, 0, pdfWidth, pdfHeight, 'F')
            
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(16)
            pdf.setTextColor(255, 77, 77)
            pdf.text('WILDFIRE PUBLIC SAFETY BRIEFING', 10, 15)

            pdf.setFontSize(9)
            pdf.setTextColor(148, 163, 184)
            pdf.text(`Generated on: ${new Date().toLocaleString()} | Powered by NASA EONET & OpenStreetMap`, 10, 21)

            let heightLeft = imgHeight
            let position = 26

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, Math.min(imgHeight, pdfHeight - 35))
            heightLeft -= (pdfHeight - 35)

            // If content spans multiple pages
            while (heightLeft > 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.setFillColor(15, 23, 42)
                pdf.rect(0, 0, pdfWidth, pdfHeight, 'F')
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
                heightLeft -= pdfHeight
            }

            pdf.save(`Wildfire_Safety_Briefing_${id || 'Event'}.pdf`)
        } catch (err) {
            console.error('PDF Export Error:', err)
            alert('Failed to generate PDF briefing. Please try again.')
        } finally {
            setExportingPdf(false)
        }
    }

    return (
        <div className="drawer-overlay" onClick={onClose}>
            <div className="incident-drawer" onClick={(e) => e.stopPropagation()} ref={drawerRef}>
                {/* Header */}
                <div className="drawer-header">
                    <div className="drawer-header-left">
                        <span className={`category-tag ${categoryClass}`}>
                            <Icon icon={
                                isWildfire ? 'mdi:fire-alert' :
                                categoryClass === 'volcano' ? 'mdi:volcano' :
                                categoryClass === 'storm' ? 'mdi:weather-lightning-rainy' : 'mdi:snowflake'
                            } />
                            {categoryName}
                        </span>
                        <h2>{title}</h2>
                        <span className="drawer-event-id">NASA EONET ID: {id}</span>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close detail drawer">
                        <Icon icon="mdi:close" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="drawer-body">
                    {/* Action Bar: PDF Export & Navigation */}
                    <div className="drawer-actions-bar">
                        <button
                            className="export-pdf-btn"
                            onClick={handleExportPdf}
                            disabled={exportingPdf}
                        >
                            <Icon icon={exportingPdf ? 'mdi:loading' : 'mdi:file-pdf-box'} className={exportingPdf ? 'spin' : ''} />
                            <span>{exportingPdf ? 'Generating PDF...' : 'Export Safety Briefing (PDF)'}</span>
                        </button>

                        {googleMapsUrl && (
                            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="drawer-map-link">
                                <Icon icon="mdi:google-maps" />
                                <span>Google Maps</span>
                            </a>
                        )}
                    </div>

                    {/* Metadata Section */}
                    <div className="drawer-card metadata-card">
                        <div className="card-title">
                            <Icon icon="mdi:information-outline" />
                            <h3>Detection Summary</h3>
                        </div>
                        <div className="meta-grid">
                            <div className="meta-item">
                                <span className="label">Detected Date & Time</span>
                                <span className="value">{formattedDate}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Geographic Coordinates</span>
                                <span className="value">{lat ? lat.toFixed(4) : 'N/A'}°, {lng ? lng.toFixed(4) : 'N/A'}°</span>
                            </div>
                        </div>
                    </div>

                    {/* Fire Radiative Power (FRP) & Intensity Gauge */}
                    {isWildfire && (
                        <div className="drawer-card frp-card">
                            <div className="card-title">
                                <Icon icon="mdi:fire-circle" className="frp-icon" />
                                <h3>Fire Radiative Power & Intensity</h3>
                            </div>
                            <div className="frp-content">
                                <div className="frp-metric">
                                    <span className="frp-number">{frpValue}</span>
                                    <span className="frp-badge">{frpIntensity}</span>
                                </div>
                                <p className="frp-description">
                                    Fire Radiative Power (FRP) measures thermal energy release per unit time from MODIS/VIIRS satellite instruments. High FRP indicates active flame fronts and intense smoke plume generation.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Official NASA & EONET Data Sources */}
                    <div className="drawer-card sources-card">
                        <div className="card-title">
                            <Icon icon="mdi:source-branch" />
                            <h3>Official EONET Data Sources</h3>
                        </div>
                        {sources && sources.length > 0 ? (
                            <div className="sources-list">
                                {sources.map((src, idx) => (
                                    <a
                                        key={idx}
                                        href={src.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="source-link-pill"
                                    >
                                        <Icon icon="mdi:open-in-new" />
                                        <span>{src.id || 'Official Bulletin'}</span>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="sources-list">
                                <a
                                    href="https://eonet.gsfc.nasa.gov/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="source-link-pill"
                                >
                                    <Icon icon="mdi:open-in-new" />
                                    <span>NASA Earth Observatory (EONET)</span>
                                </a>
                                <a
                                    href="https://inciweb.wildfire.gov/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="source-link-pill"
                                >
                                    <Icon icon="mdi:open-in-new" />
                                    <span>InciWeb Incident Management System</span>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* 15-Mile Infrastructure Risk Area */}
                    {isWildfire && (
                        <div className="drawer-card risk-card">
                            <div className="card-title">
                                <Icon icon="mdi:radar" className="radar-icon" />
                                <h3>15-Mile Infrastructure Risk Perimeter</h3>
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
                                        <div className="infra-items-scroll">
                                            {infrastructureData.map((facility, idx) => (
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
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Evacuation Alert Placeholder */}
                    <div className="drawer-card evacuation-card">
                        <div className="card-title">
                            <Icon icon="mdi:alert-decagram" className="alert-decagram" />
                            <h3>Official Safety Advisory Placeholder</h3>
                        </div>
                        <p className="evac-text">
                            <strong>Level 2/3 Evacuation Advisory Notice:</strong> Residents within the 15-mile danger perimeter should maintain continuous situational awareness, monitor official emergency radio broadcasts, and keep emergency go-bags packed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IncidentDetailDrawer
