import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import * as turf from '@turf/turf'
import IncidentDetailDrawer from './IncidentDetailDrawer'

const NATURAL_EVENT_WILDFIRE = 8
const NATURAL_EVENT_VOLCANO = 12
const NATURAL_EVENT_STORM = 10
const NATURAL_EVENT_ICE = 15

// SVG Icons for Leaflet custom HTML DivIcons
const ICONS_SVG = {
    wildfire: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 23c-4.97 0-9-3.58-9-8c0-4.19 3.06-8.29 6.84-11.47c.39-.33.96-.13 1.07.36c.64 2.82 2.37 4.54 4.09 5.86c.6.46.74 1.3.31 1.93l-.44.66c-.23.35-.14.82.21 1.05c.35.23.82.14 1.05-.21l.44-.66c1.1-1.65.74-3.87-.8-5.06c-1.39-1.07-2.8-2.45-3.37-4.66C12.22 2.08 13.06 1 14.37 1c.54 0 1.07.18 1.5.52C18.94 4.03 21 8.27 21 12c0 6.08-4.03 11-9 11z"/></svg>`,
    volcano: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M18 19H6l1.85-6.17l2.58.86a1 1 0 0 0 1.14-.45l1.64-2.73L15.4 14.3a1 1 0 0 0 1.28.24L18 19M7.41 11.23L4.26 21.73A1 1 0 0 0 5.22 23h13.56a1 1 0 0 0 .96-1.27l-3.15-10.5l-2.07-1.38l-2.22 3.7l-2.74-.91l.85-1.41M13 1h-2v3h2V1m-4.5 1.5l-1.41 1.41L9.2 6.03L10.61 4.62L8.5 2.5m7 0l-2.11 2.12l1.41 1.41l2.12-2.12L15.5 2.5Z"/></svg>`,
    storm: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6 14a4 4 0 0 1-4-4a4 4 0 0 1 3.25-3.92A5.5 5.5 0 0 1 15.5 5A4.5 4.5 0 0 1 20 9.5a3.5 3.5 0 0 1-3.5 3.5H6m8.5 2l-3.5 6h2.5l-1 4l4.5-6h-2.5l1-4Z"/></svg>`,
    ice: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M13 11h4.59l-1.3-1.29l1.42-1.42L21.41 12l-3.7 3.71l-1.42-1.42l1.3-1.29H13v4.59l1.29-1.3l1.42 1.42L12 21.41l-3.71-3.7l1.42-1.42l1.29 1.3V13H6.41l1.3 1.29l-1.42 1.42L2.59 12l3.7-3.71l1.42 1.42l-1.3 1.29H11V6.41l-1.29 1.3L8.29 6.29L12 2.59l3.71 3.7l-1.42 1.42l-1.29-1.3V11Z"/></svg>`
}

const Map = ({
    eventData,
    center,
    zoom,
    selectedCategory,
    searchQuery,
    currentTimestamp,
    layers,
    locationInfo,
    setLocationInfo,
    onAnalyzeRiskArea,
    infrastructureData,
    loadingInfrastructure,
    mapFocusTarget
}) => {
    const mapContainerRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const clusterGroupRef = useRef(null)
    const bufferLayerRef = useRef(null)
    const infraGroupRef = useRef(null)

    // Layer refs for dynamic toggle/opacity updates
    const satelliteLayerRef = useRef(null)
    const windLayerRef = useRef(null)
    const aqiLayerRef = useRef(null)

    // Initialize Leaflet Map and Marker Cluster Group
    useEffect(() => {
        if (!mapContainerRef.current) return

        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [center.lat, center.lng],
                zoom: zoom,
                zoomControl: true,
                attributionControl: true
            })

            // CartoDB Dark Matter Base Tiles (100% Free)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(map)

            // Dynamic Glassmorphic Marker Cluster Group
            const clusterGroup = L.markerClusterGroup({
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                spiderfyOnMaxZoom: true,
                iconCreateFunction: (cluster) => {
                    const count = cluster.getChildCount()
                    let badgeClass = ''
                    if (count > 50) badgeClass = 'large'
                    else if (count > 15) badgeClass = 'medium'

                    return L.divIcon({
                        html: `<div class="custom-cluster-badge ${badgeClass}"><span>${count}</span></div>`,
                        className: 'custom-cluster-marker',
                        iconSize: [44, 44],
                        iconAnchor: [22, 22]
                    })
                }
            })

            map.addLayer(clusterGroup)
            clusterGroupRef.current = clusterGroup
            mapInstanceRef.current = map
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Fly / Pan map if mapFocusTarget updates
    useEffect(() => {
        if (mapInstanceRef.current && mapFocusTarget) {
            mapInstanceRef.current.flyTo(
                [mapFocusTarget.lat, mapFocusTarget.lng],
                mapFocusTarget.zoom || 9,
                { duration: 1.5 }
            )
        }
    }, [mapFocusTarget])

    // Render 15-Mile Turf Buffer Polygon around selected Fire Event
    useEffect(() => {
        if (!mapInstanceRef.current) return
        const map = mapInstanceRef.current

        if (bufferLayerRef.current) {
            map.removeLayer(bufferLayerRef.current)
            bufferLayerRef.current = null
        }

        if (locationInfo && locationInfo.lat && locationInfo.lng) {
            const isFire =
                locationInfo.category === NATURAL_EVENT_WILDFIRE ||
                locationInfo.category === 'wildfires' ||
                (locationInfo.title && locationInfo.title.toLowerCase().includes('fire'))

            if (isFire) {
                try {
                    const point = turf.point([locationInfo.lng, locationInfo.lat])
                    const bufferPolygon = turf.buffer(point, 15, { units: 'miles' })

                    bufferLayerRef.current = L.geoJSON(bufferPolygon, {
                        style: {
                            color: '#ff4d4d',
                            weight: 2,
                            dashArray: '6, 6',
                            fillColor: '#ff4d4d',
                            fillOpacity: 0.18
                        }
                    }).addTo(map)
                } catch (e) {
                    console.error('Turf buffer generation error:', e)
                }
            }
        }
    }, [locationInfo])

    // Render Overpass API Critical Infrastructure Markers on Map
    useEffect(() => {
        if (!mapInstanceRef.current) return
        const map = mapInstanceRef.current

        if (infraGroupRef.current) {
            infraGroupRef.current.clearLayers()
        } else {
            infraGroupRef.current = L.featureGroup().addTo(map)
        }

        if (infrastructureData && infrastructureData.length > 0) {
            infrastructureData.forEach((infra) => {
                let iconSvg = ''
                if (infra.type === 'hospital') {
                    iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>`
                } else if (infra.type === 'school') {
                    iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 3L1 9l11 6l9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`
                } else {
                    iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 23c-4.97 0-9-3.58-9-8c0-4.19 3.06-8.29 6.84-11.47c.39-.33.96-.13 1.07.36c.64 2.82 2.37 4.54 4.09 5.86c.6.46.74 1.3.31 1.93l-.44.66c-.23.35-.14.82.21 1.05c.35.23.82.14 1.05-.21l.44-.66c1.1-1.65.74-3.87-.8-5.06c-1.39-1.07-2.8-2.45-3.37-4.66C12.22 2.08 13.06 1 14.37 1c.54 0 1.07.18 1.5.52C18.94 4.03 21 8.27 21 12c0 6.08-4.03 11-9 11z"/></svg>`
                }

                const customInfraIcon = L.divIcon({
                    className: 'custom-leaflet-infra-marker',
                    html: `<div class="infra-marker-icon ${infra.type}">${iconSvg}</div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                })

                const marker = L.marker([infra.lat, infra.lng], { icon: customInfraIcon })
                marker.bindPopup(`
                    <div class="infra-popup-content">
                        <h4>${infra.name}</h4>
                        <p><strong>Type:</strong> ${infra.type.replace('_', ' ').toUpperCase()}</p>
                        <p><strong>Distance to Wildfire:</strong> ${infra.distanceMiles} miles</p>
                        <p><strong>Coordinates:</strong> ${infra.lat.toFixed(4)}°, ${infra.lng.toFixed(4)}°</p>
                    </div>
                `)
                infraGroupRef.current.addLayer(marker)
            })
        }
    }, [infrastructureData])

    // Manage Environmental Overlay Tile Layers (Satellite, Wind, AQI)
    useEffect(() => {
        if (!mapInstanceRef.current) return
        const map = mapInstanceRef.current

        // 1. NASA GIBS Satellite Layer (MODIS Terra TrueColor synced with current timeline date)
        const activeDate = currentTimestamp ? new Date(currentTimestamp) : new Date()
        const dateStr = activeDate.toISOString().split('T')[0]

        if (layers?.satellite?.active) {
            const gibsUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${dateStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`
            if (!satelliteLayerRef.current) {
                satelliteLayerRef.current = L.tileLayer(gibsUrl, {
                    attribution: 'Imagery &copy; <a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a>',
                    maxZoom: 9,
                    opacity: layers.satellite.opacity
                }).addTo(map)
            } else {
                satelliteLayerRef.current.setUrl(gibsUrl)
                satelliteLayerRef.current.setOpacity(layers.satellite.opacity)
            }
        } else if (satelliteLayerRef.current) {
            map.removeLayer(satelliteLayerRef.current)
            satelliteLayerRef.current = null
        }

        // 2. Wind Vectors Layer
        if (layers?.wind?.active) {
            const openWeatherKey = process.env.REACT_APP_OPENWEATHER_API_KEY || 'b1b15e88fa797225412429c1c50c122a1'
            const windUrl = `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${openWeatherKey}`
            if (!windLayerRef.current) {
                windLayerRef.current = L.tileLayer(windUrl, {
                    attribution: 'Wind &copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
                    maxZoom: 19,
                    opacity: layers.wind.opacity
                }).addTo(map)
            } else {
                windLayerRef.current.setOpacity(layers.wind.opacity)
            }
        } else if (windLayerRef.current) {
            map.removeLayer(windLayerRef.current)
            windLayerRef.current = null
        }

        // 3. Air Quality Index (AQI / PM2.5) Layer
        if (layers?.aqi?.active) {
            const waqiToken = process.env.REACT_APP_WAQI_API_TOKEN || 'demo'
            const aqiUrl = `https://tiles.waqi.info/tiles/useactual/{z}/{x}/{y}.png?token=${waqiToken}`
            if (!aqiLayerRef.current) {
                aqiLayerRef.current = L.tileLayer(aqiUrl, {
                    attribution: 'AQI &copy; <a href="https://waqi.info/">WAQI</a>',
                    maxZoom: 19,
                    opacity: layers.aqi.opacity
                }).addTo(map)
            } else {
                aqiLayerRef.current.setOpacity(layers.aqi.opacity)
            }
        } else if (aqiLayerRef.current) {
            map.removeLayer(aqiLayerRef.current)
            aqiLayerRef.current = null
        }
    }, [layers, currentTimestamp])

    // Update Clustered Map Markers on eventData / filter / timeline changes
    useEffect(() => {
        if (!mapInstanceRef.current || !clusterGroupRef.current) return

        const clusterGroup = clusterGroupRef.current
        clusterGroup.clearLayers()

        const filteredEvents = eventData.filter((ev) => {
            if (!ev.geometries || ev.geometries.length === 0) return false

            const categoryId = ev.categories[0]?.id
            const titleMatches = searchQuery ? ev.title.toLowerCase().includes(searchQuery.toLowerCase()) : true

            if (!titleMatches) return false

            // Category filter
            let categoryMatch = false
            if (selectedCategory === 'all') categoryMatch = true
            else if (selectedCategory === 'wildfire' && (categoryId === NATURAL_EVENT_WILDFIRE || categoryId === 'wildfires')) categoryMatch = true
            else if (selectedCategory === 'volcano' && (categoryId === NATURAL_EVENT_VOLCANO || categoryId === 'volcanoes')) categoryMatch = true
            else if (selectedCategory === 'storm' && (categoryId === NATURAL_EVENT_STORM || categoryId === 'severeStorms')) categoryMatch = true
            else if (selectedCategory === 'ice' && (categoryId === NATURAL_EVENT_ICE || categoryId === 'seaLakeIce')) categoryMatch = true

            if (!categoryMatch) return false

            // Time-Lapse Lifespan Filter
            if (currentTimestamp && ev.geometries[0]?.date) {
                const eventStartDate = new Date(ev.geometries[0].date).getTime()
                const eventClosedDate = ev.closed ? new Date(ev.closed).getTime() : null

                if (eventStartDate > currentTimestamp) return false
                if (eventClosedDate && currentTimestamp > eventClosedDate) return false
            }

            return true
        })

        const newMarkers = []

        filteredEvents.forEach((ev) => {
            const geometry = ev.geometries[0]
            if (!geometry || !geometry.coordinates || geometry.coordinates.length < 2) return

            const lng = geometry.coordinates[0]
            const lat = geometry.coordinates[1]
            const categoryId = ev.categories[0]?.id

            let categoryClass = 'wildfire'
            let iconSvg = ICONS_SVG.wildfire

            if (categoryId === NATURAL_EVENT_WILDFIRE || categoryId === 'wildfires') {
                categoryClass = 'wildfire'
                iconSvg = ICONS_SVG.wildfire
            } else if (categoryId === NATURAL_EVENT_VOLCANO || categoryId === 'volcanoes') {
                categoryClass = 'volcano'
                iconSvg = ICONS_SVG.volcano
            } else if (categoryId === NATURAL_EVENT_STORM || categoryId === 'severeStorms') {
                categoryClass = 'storm'
                iconSvg = ICONS_SVG.storm
            } else if (categoryId === NATURAL_EVENT_ICE || categoryId === 'seaLakeIce') {
                categoryClass = 'ice'
                iconSvg = ICONS_SVG.ice
            }

            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: `
                    <div class="location-marker ${categoryClass}" title="${ev.title.replace(/"/g, '&quot;')}">
                        <div class="marker-pulse"></div>
                        <div class="location-icon-wrapper">
                            ${iconSvg}
                        </div>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            })

            const marker = L.marker([lat, lng], { icon: customIcon })
            marker.on('click', () => {
                setLocationInfo({
                    id: ev.id,
                    title: ev.title,
                    category: categoryId,
                    lat: lat,
                    lng: lng,
                    date: geometry.date,
                    sources: ev.sources,
                    geometries: ev.geometries
                })
            })

            newMarkers.push(marker)
        })

        clusterGroup.addLayers(newMarkers)
    }, [eventData, selectedCategory, searchQuery, currentTimestamp, setLocationInfo])

    return (
        <div className="map-container">
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
            {locationInfo && (
                <IncidentDetailDrawer
                    info={locationInfo}
                    onClose={() => setLocationInfo(null)}
                    onAnalyzeRiskArea={onAnalyzeRiskArea}
                    infrastructureData={infrastructureData}
                    loadingInfrastructure={loadingInfrastructure}
                />
            )}
        </div>
    )
}

Map.defaultProps = {
    center: {
        lat: 38.0,
        lng: -96.0
    },
    zoom: 4,
    selectedCategory: 'all',
    searchQuery: '',
    currentTimestamp: null,
    layers: {
        satellite: { active: false, opacity: 0.75 },
        wind: { active: false, opacity: 0.7 },
        aqi: { active: false, opacity: 0.65 }
    }
}

export default Map
