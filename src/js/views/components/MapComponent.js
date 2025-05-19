import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

class MapComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.defaultOptions = {
      center: [-6.200000, 106.816666], // Jakarta
      zoom: 13,
      ...options
    };
    this.map = null;
    this.markers = [];
  }

  init() {
    this.map = L.map(this.containerId).setView(
      this.defaultOptions.center,
      this.defaultOptions.zoom
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Fix for marker icons
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });

    return this.map;
  }

  addMarker(lat, lon, popupContent = '') {
    const marker = L.marker([lat, lon]).addTo(this.map);
    
    if (popupContent) {
      marker.bindPopup(popupContent);
    }

    this.markers.push(marker);
    return marker;
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  setView(lat, lon, zoom = this.defaultOptions.zoom) {
    this.map.setView([lat, lon], zoom);
  }

  enableClickToGetLocation(callback) {
    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      callback(lat, lng);
    });
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lon: longitude });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async centerOnCurrentLocation() {
    try {
      const { lat, lon } = await this.getCurrentLocation();
      this.setView(lat, lon);
      return { lat, lon };
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  }
}

export default MapComponent;