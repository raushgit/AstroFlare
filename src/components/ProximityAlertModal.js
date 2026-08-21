import { useState } from 'react'
import { Icon } from '@iconify/react'
import * as turf from '@turf/turf'

const ProximityAlertModal = ({ isOpen, onClose, events, onSelectLocation }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [userLocation, setUserLocation] = useState(null) // { lat, lng, address }
    const [result, setResult] = useState(null) // { nearestFire, distanceMiles, isHighPriority }

    if (!isOpen) return null

    // Calculate nearest wildfire using Turf.js
    const calculateNearestWildfire = (userLat, userLng, locationName = '') => {
        if (!events || events.length === 0) {
            setError('No natural event data available to evaluate proximity.')
            return
        }

        // Filter for wildfires (Category 8 or title containing wildfire)
        const wildfireEvents = events.filter((ev) => {
            const catId = ev.categories[0]?.id
            return (
                catId === 8 ||
                catId === 'wildfires' ||
                (ev.title && ev.title.toLowerCase().includes('fire'))
            )
        })

        const candidateEvents = wildfireEvents.length > 0 ? wildfireEvents : events

        const userPoint = turf.point([userLng, userLat])
        let minDistance = Infinity
        let closestEvent = null

        candidateEvents.forEach((ev) => {
            const coords = ev.geometries?.[0]?.coordinates
            if (coords && coords.length >= 2) {
                const fireLng = coords[0]
                const fireLat = coords[1]
                const firePoint = turf.point([fireLng, fireLat])
                const dist = turf.distance(userPoint, firePoint, { units: 'miles' })

                if (dist < minDistance) {
                    minDistance = dist
                    closestEvent = {
                        ...ev,
                        lat: fireLat,
                        lng: fireLng
                    }
                }
            }
        })

        if (closestEvent) {
            const distanceMiles = Math.round(minDistance * 10) / 10
            const isHighPriority = distanceMiles < 25
            setUserLocation({ lat: userLat, lng: userLng, address: locationName })
            setResult({
                nearestFire: closestEvent,
                distanceMiles,
                isHighPriority
            })
            setError(null)
        } else {
            setError('Could not locate active wildfire coordinates in current feed.')
        }
    }

    // HTML5 Geolocation Handler
    const handleUseMyLocation = () => {
        setLoading(true)
        setError(null)

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.')
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                calculateNearestWildfire(latitude, longitude, 'Your Current Geolocation')
                setLoading(false)
            },
            (err) => {
                console.error('Geolocation Error:', err)
                setError('Unable to retrieve location. Please check browser permissions or search by city/zip.')
                setLoading(false)
            },
            { timeout: 10000 }
        )
    }

    // Nominatim Geocoding Handler (City / Zip search)
    const handleSearchSubmit = async (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setLoading(true)
        setError(null)

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=1`
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'WildfireTrackerProximityAlert/1.0'
                }
            })

            if (!res.ok) throw new Error('Geocoding service unavailable.')

            const data = await res.json()
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat)
                const lng = parseFloat(data[0].lon)
                const displayName = data[0].display_name
                calculateNearestWildfire(lat, lng, displayName)
            } else {
                setError(`No geographic location found matching "${searchQuery}". Try a Zip Code, City, or State.`)
            }
        } catch (err) {
            console.error('Geocoder Error:', err)
            setError('Geocoding service failed. Please try again or use your GPS position.')
        } finally {
            setLoading(false)
        }
    }

    const handleFocusOnMap = (lat, lng) => {
        if (onSelectLocation) {
            onSelectLocation(lat, lng)
        }
        onClose()
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="proximity-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Icon icon="mdi:shield-alert" className="modal-title-icon" />
                        <h2>"Am I in Danger?" Proximity Alert</h2>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close modal">
                        <Icon icon="mdi:close" />
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-description">
                        Check your proximity to active NASA EONET wildfire detections. Enter your city, zip code, or use your GPS location.
                    </p>

                    <div className="location-inputs">
                        <button
                            className="gps-btn"
                            onClick={handleUseMyLocation}
                            disabled={loading}
                        >
                            <Icon icon="mdi:crosshairs-gps" />
                            <span>{loading ? 'Locating...' : 'Use My Current Location'}</span>
                        </button>

                        <div className="divider-line"><span>OR</span></div>

                        <form onSubmit={handleSearchSubmit} className="zip-search-form">
                            <div className="input-group">
                                <Icon icon="mdi:map-search" className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Enter City, Zip Code, or Address..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button type="submit" className="search-submit-btn" disabled={loading || !searchQuery.trim()}>
                                {loading ? 'Searching...' : 'Check Danger'}
                            </button>
                        </form>
                    </div>

                    {error && (
                        <div className="modal-error-banner">
                            <Icon icon="mdi:alert-circle" />
                            <span>{error}</span>
                        </div>
                    )}

                    {result && (
                        <div className={`proximity-result-card ${result.isHighPriority ? 'high-danger' : 'safe'}`}>
                            <div className="result-header">
                                <div className="status-badge">
                                    <Icon icon={result.isHighPriority ? 'mdi:fire-alert' : 'mdi:shield-check'} />
                                    <span>
                                        {result.isHighPriority ? 'HIGH PRIORITY WARNING' : 'SAFE PROXIMITY ZONE'}
                                    </span>
                                </div>
                                <span className="distance-tag">
                                    {result.distanceMiles} Miles Away
                                </span>
                            </div>

                            <div className="result-body">
                                <h3>Nearest Active Wildfire</h3>
                                <p className="fire-title">{result.nearestFire.title}</p>

                                <div className="result-meta">
                                    <span>
                                        <strong>Assessed Location:</strong> {userLocation?.address || `${userLocation?.lat.toFixed(3)}°, ${userLocation?.lng.toFixed(3)}°`}
                                    </span>
                                    <span>
                                        <strong>Fire Coordinates:</strong> {result.nearestFire.lat.toFixed(3)}°, {result.nearestFire.lng.toFixed(3)}°
                                    </span>
                                </div>

                                {result.isHighPriority ? (
                                    <div className="evacuation-warning-box">
                                        <div className="warning-box-title">
                                            <Icon icon="mdi:bullhorn" />
                                            <strong>LEVEL 3 EVACUATION ADVISORY (PLACEHOLDER)</strong>
                                        </div>
                                        <p>
                                            Active wildfire detected within <strong>25 miles</strong> of your location. Prepare your emergency go-bag, review evacuation routes, and follow local emergency management updates.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="safe-notice-box">
                                        <Icon icon="mdi:information-outline" />
                                        <p>
                                            No active NASA EONET wildfire detected within 25 miles of this location. Stay vigilant and monitor air quality updates.
                                        </p>
                                    </div>
                                )}

                                <div className="result-actions">
                                    <button
                                        className="focus-fire-btn"
                                        onClick={() => handleFocusOnMap(result.nearestFire.lat, result.nearestFire.lng)}
                                    >
                                        <Icon icon="mdi:map-marker-radius" />
                                        <span>View Nearest Wildfire on Map</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProximityAlertModal
