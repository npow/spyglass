# Spyglass

**See every vessel on the seven seas, from your browser.**

Spyglass is a real-time ship tracker that plots maritime traffic on a dark, interactive world map. Point, click, and know what's sailing where -- no captain's license required.

## What it does

- **Watch ships move in real-time.** Vessels appear as color-coded dots on a dark world map. Cargo ships glow green, tankers blue, passenger liners orange, and so on. They update their positions as new AIS signals come in.

- **Click any vessel to inspect it.** A detail panel slides open with everything the ship is broadcasting: name, flag, MMSI, speed, heading, destination, ETA, draught, and dimensions. It's the manifest at a glance.

- **Works immediately in demo mode.** On first launch, Spyglass charts ~300 simulated vessels along real shipping lanes (English Channel, Strait of Malacca, Suez, Panama, and more). No account needed to explore.

- **Plug in a free API key for live data.** Hit "Switch to Live Data", paste your [AISStream.io](https://aisstream.io) API key, and watch real ships appear from the worldwide AIS network. The key is stored locally and remembered across sessions.

- **Clusters keep things tidy.** When zoomed out, nearby ships collapse into numbered clusters. Click a cluster to zoom in and see individual vessels.

## Getting underway

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). That's it -- you're on the bridge.

## Live data

The demo mode runs without any setup. For real AIS data:

1. Sign up at [aisstream.io](https://aisstream.io) (free tier)
2. Copy your API key
3. Click **Switch to Live Data** in the app and paste it in

The app subscribes to the full global bounding box. Ships accumulate as their transponder signals arrive via WebSocket.

## Ship type legend

| Color | Type |
|-------|------|
| Green | Cargo |
| Blue | Tanker |
| Orange | Passenger |
| Yellow | Fishing |
| Red | Military |
| Purple | Tug / Pilot |
| Cyan | Sailing / Pleasure |
| Pink | High Speed Craft |
| Gray | Other |

## Built with

- [React](https://react.dev) + TypeScript + [Vite](https://vite.dev)
- [MapLibre GL JS](https://maplibre.org) via [react-map-gl](https://visgl.github.io/react-map-gl/)
- [CARTO](https://carto.com) dark basemap tiles
- [AISStream.io](https://aisstream.io) WebSocket API for live AIS data

## Fair winds

Built for anyone who's ever stared at the ocean and wondered what all those ships are up to.
