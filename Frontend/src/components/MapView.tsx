import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Device } from "@/services/apiService";

// Corrige ícones default do Leaflet
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

interface MapViewProps {
  devices: Device[];
}

// Gera ícone colorido por status
const createDeviceIcon = (status: string) => {
  let color = "gray";
  if (status === "active") color = "green";
  else if (status === "unlocked") color = "orange";
  else if (status === "alert") color = "red";

  return L.divIcon({
    html: `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:30px;
        height:30px;
        background-color:${color};
        border-radius:50%;
        box-shadow:0 0 6px rgba(0,0,0,0.4);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5
            c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5
            14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
        </svg>
      </div>
    `,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

const MapView = ({ devices }: MapViewProps) => {
  // Aceita devices que tenham OU geofence.center OU latitude/longitude
  const validDevices = devices.filter(
    (d) =>
      Array.isArray(d.geofence?.center) ||
      (typeof d.latitude === "number" && typeof d.longitude === "number")
  );

  // Center do mapa:  
  // - Se existir pelo menos 1 device válido → usa o 1º  
  // - Se não → fallback para Brasília
  const defaultCenter: [number, number] = [-15.78, -47.93];

  const mapCenter =
    validDevices.length > 0
      ? (validDevices[0].geofence?.center ??
          [validDevices[0].latitude!, validDevices[0].longitude!]) as [
          number,
          number
        ]
      : defaultCenter;

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={mapCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap & CARTO'
        />

        {validDevices.map((device) => {
          // Prioridade: geofence.center → latitude/longitude
          const center: [number, number] = device.geofence?.center
            ? [device.geofence.center[0], device.geofence.center[1]]
            : [device.latitude!, device.longitude!];

          return (
            <Marker
              key={device.id}
              position={center}
              icon={createDeviceIcon(device.status || "")}
            >
              <Popup>
                <strong>ID:</strong> {device.id} <br />
                <strong>Status:</strong> {device.status} <br />
                <strong>Bateria:</strong> {device.battery_level ?? "--"}% <br />
                <strong>Localização:</strong> {center.join(", ")}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
