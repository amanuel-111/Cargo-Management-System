const axios = require('axios');

class TraccarService {
  constructor() {
    this.baseUrl = process.env.TRACCAR_BASE_URL || 'http://localhost:8082';
    this.username = process.env.TRACCAR_USERNAME || 'admin';
    this.password = process.env.TRACCAR_PASSWORD || 'admin';
    this.authHeader = 'Basic ' + Buffer.from(`${this.username}:${this.password}`).toString('base64');

    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': this.authHeader,
        'Accept': 'application/json'
      },
      timeout: 5000
    });
  }

  async getDevices() {
    try {
      const response = await this.api.get('/api/devices');
      return response.data;
    } catch (error) {
      console.error('Traccar getDevices error:', error.message);
      throw error;
    }
  }

  async getDevice(deviceId) {
    try {
      const response = await this.api.get(`/api/devices?id=${deviceId}`);
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error(`Traccar getDevice(${deviceId}) error:`, error.message);
      throw error;
    }
  }

  async getLatestPosition(deviceId) {
    try {
      const response = await this.api.get(`/api/positions?deviceId=${deviceId}`);
      if (response.data && response.data.length > 0) {
        // The positions API usually returns an array. We sort by deviceTime desc just to be sure
        const sorted = response.data.sort((a, b) => new Date(b.deviceTime) - new Date(a.deviceTime));
        return this.normalizePosition(sorted[0]);
      }
      return null;
    } catch (error) {
      console.error(`Traccar getLatestPosition(${deviceId}) error:`, error.message);
      throw error;
    }
  }

  async getPositionHistory(deviceId, from, to) {
    try {
      const fromStr = new Date(from).toISOString();
      const toStr = new Date(to).toISOString();
      const response = await this.api.get(`/api/positions?deviceId=${deviceId}&from=${fromStr}&to=${toStr}`);
      return response.data.map(p => this.normalizePosition(p));
    } catch (error) {
      console.error(`Traccar getPositionHistory(${deviceId}) error:`, error.message);
      throw error;
    }
  }

  normalizePosition(traccarPosition) {
    return {
      traccarPositionId: traccarPosition.id,
      deviceId: traccarPosition.deviceId,
      latitude: traccarPosition.latitude,
      longitude: traccarPosition.longitude,
      speed: traccarPosition.speed * 1.852, // Convert knots to km/h
      heading: traccarPosition.course,
      altitude: traccarPosition.altitude,
      accuracy: traccarPosition.accuracy || 0,
      recordedAt: new Date(traccarPosition.deviceTime), // Using deviceTime as the actual GPS recorded time
    };
  }
}

module.exports = new TraccarService();
