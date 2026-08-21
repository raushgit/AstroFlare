# AstroFlare

**AstroFlare** is an interactive, open-source planetary hazard and wildfire tracker built with **React**, **Leaflet**, and the **NASA EONET** (Earth Observatory Natural Event Tracker) API. It ingests real-time satellite telemetry to visualize active wildfires, severe storms, volcanoes, and sea ice anomalies on a high-performance glassmorphic map dashboard.

---

## Key Features

- **Live NASA EONET Telemetry Feeds:** Real-time ingestion and categorization of global natural hazard data.
- **Dynamic Marker Clustering:** Powered by `Leaflet.markercluster` with dark glassmorphic badges to eliminate marker overlap and visualize hotspot density.
- **Temporal Playback Scrubber:** Interactive time-lapse slider with Play/Pause, step controls, 1x/2x/5x speed options, and a collapsible floating pill toggle.
- **Environmental Overlays:** Integrated toggleable map layers for OpenWeatherMap wind vectors, WAQI (World Air Quality Index / PM2.5) heatmaps, and NASA GIBS true-color MODIS satellite imagery.
- **Public Safety Proximity Alerts:**
  - *"Am I in Danger?"* alert modal utilizing HTML5 Geolocation, Nominatim zip/city geocoding, and Turf.js spatial distance calculations (< 25 miles high-priority danger warning).
  - 15-Mile Infrastructure Risk Analysis querying nearby critical facilities (Hospitals, Schools, Fire Stations) via the Overpass OpenStreetMap API.
- **Automated PDF Safety Briefing Export:** One-click client-side PDF document generator built with `jspdf` and `html2canvas`.
- **Fire Radiative Power (FRP) & Intensity Metrics:** Displays satellite thermal energy output (MW), intensity badges, and official EONET bulletin links (InciWeb, NASA Earth Observatory).

---

## Tech Stack

- **Frontend Core:** [React 17](https://react.dev/) / `react-scripts`
- **Mapping & Visuals:** [Leaflet.js](https://leafletjs.com/) & `leaflet.markercluster`
- **Geospatial Engine:** [Turf.js](https://turfjs.org/) (`@turf/turf`)
- **PDF & Canvas Export:** [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)
- **Iconography:** Iconify (`@iconify/react` & `@iconify/icons-mdi`)
- **Data APIs & Services:**
  - [NASA EONET API](https://eonet.gsfc.nasa.gov/docs/v3)
  - [NASA GIBS](https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs) (Global Imagery Browse Services)
  - [OpenStreetMap / Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API)
  - [OpenWeatherMap Tile API](https://openweathermap.org/api)
  - [World Air Quality Index (WAQI) Tile API](https://waqi.info/)

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16.0.0 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/raushgit/AstroFlare.git
   cd AstroFlare
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Environment variables in `.env`:*
   ```env
   # NASA EONET API Endpoint
   REACT_APP_NASA_EONET_API_URL=https://eonet.gsfc.nasa.gov/api/v2.1/events?limit=500

   # OpenWeatherMap API Key (for Wind Vector tiles)
   REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here

   # World Air Quality Index Token (for PM2.5 / AQI tiles)
   REACT_APP_WAQI_API_TOKEN=your_waqi_token_here

   # Google Maps JavaScript API Key (Optional)
   REACT_APP_GOOGLE_MAPS_API_KEY=
   ```

4. **Start the Development Server:**
   ```bash
   npm start
   ```
   Open your browser and navigate to `http://localhost:3000`.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## Project Structure

```text
AstroFlare/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Header.js                # Top bar navigation & Proximity Alert action button
│   │   ├── Map.js                   # Leaflet map instance, tile layers, 15-mi buffer polygon & cluster markers
│   │   ├── IncidentDetailDrawer.js  # Slide-in incident drawer, FRP metrics, source links & PDF exporter
│   │   ├── ProximityAlertModal.js   # "Am I in Danger?" modal with HTML5 Geolocation & Turf.js calculations
│   │   ├── LayerControl.js          # Environmental layer toggles & opacity sliders (Satellite, Wind, AQI)
│   │   ├── TimeLapseControl.js      # Temporal scrubber timeline with play/pause & minimize toggle
│   │   ├── LocationInfoBox.js       # Compact event detail card fallback
│   │   ├── LocationMarker.js        # Custom SVG marker definitions
│   │   └── Loader.js                # NASA satellite feed connection screen
│   ├── App.js                       # Root application component & Overpass API integration state
│   ├── index.js                     # React DOM entrypoint
│   └── index.css                    # Design tokens, glassmorphism UI & responsive animations
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore configuration
├── package.json                     # Dependency manifests & npm scripts
└── README.md                        # Documentation
```

---

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out the [Issues page](https://github.com/raushgit/AstroFlare/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Acknowledgements

- NASA Earth Science Data and Information System ([ESDIS](https://www.earthdata.nasa.gov/)) for EONET & GIBS services.
- OpenStreetMap contributors & Leaflet community.
- World Air Quality Index (WAQI) & OpenWeatherMap APIs.