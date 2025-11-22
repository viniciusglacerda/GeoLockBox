import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiService, Delivery, Device } from "@/services/apiService";

type TrackResponse = {
  delivery: Delivery;
  device?: Device;
};

const TrackPage: React.FC = () => {
  const [tracking, setTracking] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrackResponse | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setData(null);

    const deliveryId = tracking.trim();
    if (!deliveryId) {
      setError("Insira um número de entrega válido.");
      return;
    }

    setLoading(true);
    try {
      const deliveries = await apiService.getDeliveries();
      const delivery = deliveries.find(d => d.id === deliveryId);

      if (!delivery) {
        setError("Número de entrega não encontrado.");
        setLoading(false);
        return;
      }

      let device: Device | undefined;
      if (delivery.device_id) {
        device = await apiService.getDevice(delivery.device_id);
      }

      setData({ delivery, device });
    } catch (err) {
      setError("Erro ao buscar informações da entrega.");
    } finally {
      setLoading(false);
    }
  };

  const mapPinIcon = new L.DivIcon({
    html: `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:30px;
      height:30px;
      background-color:${"grey"};
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

  const packageIcon = new L.DivIcon({
    html: `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:30px;
      height:30px;
      background-color:${"grey"};
      border-radius:50%;
      box-shadow:0 0 6px rgba(0,0,0,0.4);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24">
        <path d="m7.5 4.27 4.5-2.25 4.5 2.25"></path>
        <path d="M3 8l9 4 9-4"></path>
        <path d="M3 8v8l9 4 9-4V8"></path>
        <path d="M12 12v8"></path>
      </svg>
    </div>
  `,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Rastreamento de Entrega</h1>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Número da entrega"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Buscando..." : "Localizar"}
        </button>
      </form>

      {error && <div className="text-red-600 font-medium mb-4">{error}</div>}

      {data && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Entrega: {data.delivery.order_number}
              </h2>
              <p className="text-sm text-gray-500">
                Status: <span className="font-medium">{data.delivery.status}</span>
              </p>
            </div>
          </div>

          <div className="h-[500px] rounded-xl overflow-hidden shadow">
            <MapContainer
              center={[
                data.device?.latitude ?? data.delivery.dest_lat ?? 0,
                data.device?.longitude ?? data.delivery.dest_lon ?? 0,
              ]}
              zoom={13}
              className="w-full h-full"
              scrollWheelZoom
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap & CARTO'
              />

              {data.device && data.device.latitude && data.device.longitude && (
                <Marker
                  position={[data.device.latitude, data.device.longitude]}
                  icon={packageIcon}
                >
                  <Popup>
                    <div>
                      <strong>Dispositivo: {data.delivery.device_id}</strong>
                      <div>Bateria: {data.device.battery_level ?? "—"}%</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {data.delivery.dest_lat && data.delivery.dest_lon && (
                <>
                  <Marker
                    position={[data.delivery.dest_lat, data.delivery.dest_lon]}
                    icon={mapPinIcon}
                  >
                    <Popup>Destino da entrega</Popup>
                  </Marker>

                  {data.device && (
                    <Polyline
                      positions={[
                        [data.device.latitude!, data.device.longitude!],
                        [data.delivery.dest_lat, data.delivery.dest_lon],
                      ]}
                      pathOptions={{ color: "#2563eb", weight: 4, dashArray: "6,4" }}
                    />
                  )}

                  {data.delivery.geofence_radius && (
                    <Circle
                      center={[data.delivery.dest_lat, data.delivery.dest_lon]}
                      radius={data.delivery.geofence_radius}
                      pathOptions={{ color: "#2563eb", fillOpacity: 0.1 }}
                    />
                  )}
                </>
              )}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPage;
