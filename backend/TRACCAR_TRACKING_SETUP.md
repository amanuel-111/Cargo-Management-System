# Traccar GPS Tracking Setup Guide

This guide explains how to set up, configure, and operate the Traccar GPS integration for the Cargo Management System.

## Overview
The Cargo Management System integrates with a self-hosted Traccar server to provide real-time GPS tracking for shipments. When a shipment is in transit, the system polls the Traccar API to fetch live locations, stores the route history in the local MySQL database, and broadcasts live updates to the frontend via Socket.io.

## Prerequisites
1. A running Traccar Server instance (e.g. `http://localhost:8082` or a public IP/Domain).
2. Traccar Admin credentials.
3. GPS Tracker hardware installed on fleet vehicles, connected to your Traccar server.

## 1. Backend Configuration

Add the following environment variables to your backend `.env` file:

```env
# Traccar GPS Tracking
TRACCAR_BASE_URL=http://localhost:8082
TRACCAR_USERNAME=admin
TRACCAR_PASSWORD=admin
TRACKING_POLL_INTERVAL_MS=15000
```

- `TRACCAR_BASE_URL`: The URL where your Traccar API is accessible.
- `TRACCAR_USERNAME`: The admin username for Traccar.
- `TRACCAR_PASSWORD`: The admin password for Traccar.
- `TRACKING_POLL_INTERVAL_MS`: How often to poll Traccar for active shipments (default: 15 seconds).

*Note: Restart the Node.js backend after updating the `.env` file.*

## 2. Setting Up Vehicles

To track a vehicle, it must have a valid `Traccar Device ID`.

1. Add your GPS device to the Traccar dashboard and note its **Device ID** (the internal Traccar database ID, or the unique identifier if configured).
2. In the Cargo Management System, log in as a **Fleet Manager** or **Admin**.
3. Go to **Manage Vehicles**.
4. Create a new vehicle or edit an existing one.
5. In the **Traccar Device ID (GPS)** field, enter the ID from Traccar.
6. Click **Save Changes**.

## 3. Tracking Shipments

GPS tracking is tied to the lifecycle of a shipment:

1. **Assignment**: A shipment must be assigned to a driver and a vehicle (which has a Traccar Device ID configured).
2. **Start Tracking**: In the **Tracking Center**, locate the "Active Shipments GPS Controls" section. Click **Start** for the shipment you want to track.
3. **Live Updates**:
   - The backend `traccarPoller` will begin polling Traccar every 15 seconds for this vehicle.
   - GPS coordinates are saved to the `location_updates` table.
   - Location updates are broadcast over Socket.io (`shipmentLocationUpdated`).
4. **Stop Tracking**: Once the shipment is delivered, click **Stop** in the Tracking Center to stop polling.

## 4. Customer Tracking Interface

Customers can track their shipments in real-time through the frontend application:
- **Protected View**: Customers can view their active shipments from their Dashboard and access the live Leaflet map with their route history.
- **Public View**: Customers can use the `GET /api/tracking/:trackingNumber` endpoint to view live tracking information securely via tracking number.

### Security Note
Customers can never see another customer's shipment details or GPS locations. The API enforces ownership checks for protected routes and only returns safe, non-sensitive data for public tracking requests.
