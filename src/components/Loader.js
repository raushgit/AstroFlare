import { Icon } from '@iconify/react'

const Loader = ({ message }) => {
    return (
        <div className="loader">
            <div className="loader-radar">
                <div className="radar-sweep"></div>
                <Icon icon="mdi:fire-alert" className="radar-center-icon" />
            </div>
            <h2>{message || 'Fetching NASA Satellite Data...'}</h2>
            <span className="loader-subtitle">Connecting to EONET Global Disaster Monitoring System</span>
        </div>
    )
}

export default Loader
