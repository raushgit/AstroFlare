import { Icon } from '@iconify/react'

const Header = ({ selectedCategory, onSelectCategory, searchQuery, onSearchChange, counts, onOpenProximityModal }) => {
    return (
        <header className="header">
            <div className="header-top">
                <div className="header-brand">
                    <Icon icon="mdi:fire-alert" className="header-icon" />
                    <div className="header-title-container">
                        <h1>Wildfire & Natural Event Tracker</h1>
                        <span className="header-subtitle">
                            <span className="live-badge">
                                <span className="live-dot"></span> LIVE
                            </span>
                            Powered by NASA EONET
                        </span>
                    </div>
                </div>

                <div className="header-actions">
                    <button className="proximity-alert-btn" onClick={onOpenProximityModal}>
                        <Icon icon="mdi:shield-alert" className="shield-icon" />
                        <span>Am I in Danger?</span>
                    </button>
                </div>
            </div>

            <div className="header-controls">
                <div className="search-box">
                    <Icon icon="mdi:magnify" className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search events by title..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="category-filters">
                    <button
                        className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => onSelectCategory('all')}
                    >
                        <Icon icon="mdi:earth" />
                        <span>All</span>
                        <span className="pill-count">{counts?.all || 0}</span>
                    </button>

                    <button
                        className={`filter-pill wildfire ${selectedCategory === 'wildfire' ? 'active' : ''}`}
                        onClick={() => onSelectCategory('wildfire')}
                    >
                        <Icon icon="mdi:fire-alert" />
                        <span>Wildfires</span>
                        <span className="pill-count">{counts?.wildfire || 0}</span>
                    </button>

                    <button
                        className={`filter-pill volcano ${selectedCategory === 'volcano' ? 'active' : ''}`}
                        onClick={() => onSelectCategory('volcano')}
                    >
                        <Icon icon="mdi:volcano" />
                        <span>Volcanoes</span>
                        <span className="pill-count">{counts?.volcano || 0}</span>
                    </button>

                    <button
                        className={`filter-pill storm ${selectedCategory === 'storm' ? 'active' : ''}`}
                        onClick={() => onSelectCategory('storm')}
                    >
                        <Icon icon="mdi:weather-lightning-rainy" />
                        <span>Storms</span>
                        <span className="pill-count">{counts?.storm || 0}</span>
                    </button>

                    <button
                        className={`filter-pill ice ${selectedCategory === 'ice' ? 'active' : ''}`}
                        onClick={() => onSelectCategory('ice')}
                    >
                        <Icon icon="mdi:snowflake" />
                        <span>Sea Ice</span>
                        <span className="pill-count">{counts?.ice || 0}</span>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
