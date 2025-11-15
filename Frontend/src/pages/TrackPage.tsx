import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type TrackResponse = {
  tracking_number: string;
  status: string;
  device: {
    id: string;
    latitude: number;
    longitude: number;
    last_update: string;
    battery?: number;
  };
  delivery: {
    dest_lat: number;
    dest_lon: number;
    geofence_radius?: number;
    eta_minutes?: number | null;
  } | null;
};

const MOCK_TRACKING = "DEMO123";

const mockData: TrackResponse = {
  tracking_number: MOCK_TRACKING,
  status: "in_transit",
  device: {
    id: "BOX-MOCK-001",
    latitude: -23.55052,
    longitude: -46.63331,
    last_update: new Date().toLocaleString(),
    battery: 88,
  },
  delivery: {
    dest_lat: -23.5480,
    dest_lon: -46.6400,
    geofence_radius: 50,
    eta_minutes: 12,
  },
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

    const t = tracking.trim();
    if (!t) {
      setError("Insira um número de rastreio válido.");
      return;
    }

    // Mock path: se for o tracking de exemplo, usa mock local
    if (t === MOCK_TRACKING) {
      setData(mockData);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/public/track/${encodeURIComponent(t)}`);
      if (res.status === 404) {
        setError("Número de rastreio não encontrado.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        setError(`Erro: ${res.status} ${txt}`);
        setLoading(false);
        return;
      }
      const json: TrackResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError("Erro na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // helper: criar ícone do dispositivo (pequeno círculo com svg)
  const deviceIcon = (locked: boolean) =>
    new L.DivIcon({
      html: `<div style="width:36px;height:36px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:${locked ? '#F87171' : '#34D399'};">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/></svg>
            </div>`,
      className: "",
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

  // botão para carregar demo
  const handleShowExample = () => {
    setTracking(MOCK_TRACKING);
    setData(mockData);
    setError(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rastreamento de Entrega</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Insira o número de rastreio"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Buscando..." : "Localizar"}
        </button>

        botão de exemplo - apenas para demo/local
        <button
          type="button"
          onClick={handleShowExample}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
        >
          Mostrar exemplo
        </button>
      </form>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {data && (
        <div className="space-y-4">
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Rastreamento</div>
                <div className="font-medium">{data.tracking_number}</div>
                <div className="text-sm text-gray-600">Status: {data.status}</div>
              </div>
              <div className="text-right text-sm text-gray-600">
                Última atualização: {data.device.last_update}
                <br />
                Bateria: {data.device.battery ?? "—"}%
                <br />
                ETA: {data.delivery?.eta_minutes ? `${data.delivery.eta_minutes} min` : "—"}
              </div>
            </div>
          </div>

          <div className="h-96 rounded overflow-hidden shadow">
            <MapContainer
              center={[data.device.latitude, data.device.longitude]}
              zoom={13}
              className="w-full h-full"
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              />
              <Marker
                position={[data.device.latitude, data.device.longitude]}
                icon={deviceIcon(data.status !== "in_transit" /* example logic */)}
              >
                <Popup>
                  <div>
                    <strong>{data.device.id}</strong>
                    <div>Última: {data.device.last_update}</div>
                  </div>
                </Popup>
              </Marker>

              {data.delivery && (
                <>
                  <Marker position={[data.delivery.dest_lat, data.delivery.dest_lon]}>
                    <Popup>Destino da entrega</Popup>
                  </Marker>

                  <Polyline
                    positions={[
                      [data.device.latitude, data.device.longitude],
                      [data.delivery.dest_lat, data.delivery.dest_lon],
                    ]}
                    pathOptions={{ color: "#2563eb", weight: 3 }}
                  />

                  {data.delivery.geofence_radius && (
                    <Circle
                      center={[data.delivery.dest_lat, data.delivery.dest_lon]}
                      radius={data.delivery.geofence_radius}
                      pathOptions={{ color: "#2563eb", fillOpacity: 0.08 }}
                    />
                  )}
                </>
              )}
            </MapContainer>
          </div>
        </div>
      )}

      {/* {!data && (
        <div className="mt-4 text-sm text-gray-500">
          Dica: clique <strong>Mostrar exemplo</strong> para visualizar um rastreamento de demonstração.
        </div>
      )} */}
    </div>
  );
};

export default TrackPage;
