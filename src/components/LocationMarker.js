import { Icon } from '@iconify/react'

const LocationMarker = ({ categoryId, onClick, title }) => {
    let iconName = 'mdi:fire-alert'
    let categoryClass = 'wildfire'

    if (categoryId === 8 || categoryId === 'wildfires') {
        iconName = 'mdi:fire-alert'
        categoryClass = 'wildfire'
    } else if (categoryId === 12 || categoryId === 'volcanoes') {
        iconName = 'mdi:volcano'
        categoryClass = 'volcano'
    } else if (categoryId === 10 || categoryId === 'severeStorms') {
        iconName = 'mdi:weather-lightning-rainy'
        categoryClass = 'storm'
    } else if (categoryId === 15 || categoryId === 'seaLakeIce') {
        iconName = 'mdi:snowflake'
        categoryClass = 'ice'
    }

    return (
        <div className={`location-marker ${categoryClass}`} onClick={onClick} title={title}>
            <div className="marker-pulse"></div>
            <div className="location-icon-wrapper">
                <Icon icon={iconName} className="marker-icon" />
            </div>
        </div>
    )
}

export default LocationMarker
