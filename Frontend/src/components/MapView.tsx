import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

interface Device {
  id: string;
  lat: number;
  lng: number;
  status: "active" | "inactive";
}

const devices: Device[] = [
  { id: "BOX-001", lat: -23.5505, lng: -46.6333, status: "active" },
  { id: "BOX-002", lat: -23.5605, lng: -46.6433, status: "active" },
  { id: "BOX-003", lat: -23.5705, lng: -46.6533, status: "inactive" },
];

const createDeviceIcon = (status: "active" | "inactive") => {
  const color = status === "active" ? "green" : "gray";

  return L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;background-color:${color};border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/></svg>
           </div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

const MapView = () => {
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-md">
      <MapContainer center={[-23.5505, -46.6333]} zoom={13} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {devices.map((device) => (
          <Marker
            key={device.id}
            position={[device.lat, device.lng]}
            icon={createDeviceIcon(device.status)}
          >
            <Popup>
              <strong>{device.id}</strong>
              <br />
              Status: {device.status === "active" ? "Ativo" : "Inativo"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
