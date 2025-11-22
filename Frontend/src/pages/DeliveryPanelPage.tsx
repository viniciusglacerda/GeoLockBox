import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Circle, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Truck, MapPin, Ruler, Unlock, X, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiService, Delivery, Device } from "@/services/apiService";

const DeliveryPanelPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [devices, setDevices] = useState<Record<string, Device>>({});
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allDeliveries = await apiService.getDeliveries();
        const userDeliveries = allDeliveries.filter(d => d.driver_id === userId);

        setDeliveries(userDeliveries);

        const allDevices = await apiService.getDevices();

        const deviceMap: Record<string, Device> = {};
        allDevices.forEach(dev => (deviceMap[dev.id] = dev));
        setDevices(deviceMap);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    };

    fetchData();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const getStatusColor = (status: Delivery["status"]) => {
    switch (status) {
      case "in_transit": return "text-yellow-700 bg-yellow-100";
      case "arrived": return "text-blue-700 bg-blue-100";
      case "unlocked": return "text-green-700 bg-green-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };

  const deviceIcon = new L.DivIcon({
    html: `
      <div style="
        width:32px;height:32px;border-radius:50%;
        background:#3b82f6;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 6px rgba(0,0,0,0.4);">
        <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
          <path d="m7.5 4.27 4.5-2.25 4.5 2.25"></path>
          <path d="M3 8l9 4 9-4"></path>
          <path d="M3 8v8l9 4 9-4V8"></path>
          <path d="M12 12v8"></path>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const destinationIcon = new L.DivIcon({
    html: `
      <div style="
        width:32px;height:32px;border-radius:50%;
        background:#22c55e;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 6px rgba(0,0,0,0.4);">
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Truck className="text-blue-600" /> Painel do Entregador
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" /> Sair
        </Button>
      </div>

      <div className="space-y-4">
        {deliveries.map(delivery => (
          <div
            key={delivery.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex justify-between items-center hover:shadow-md transition cursor-pointer"
            onClick={() => setSelectedDelivery(delivery)}
          >
            <div>
              <h2 className="font-semibold text-gray-800">{delivery.device_id}</h2>
              <p className="text-sm text-gray-500">
                {delivery.address_street}, {delivery.address_number}, {delivery.address_city} - {delivery.address_state}
              </p>
            </div>

            <div className="flex flex-col items-end">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                {delivery.status === "unlocked"
                  ? "Destravado"
                  : delivery.status === "arrived"
                    ? "Chegou"
                    : "Em trânsito"}
              </span>

              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Ruler size={14} /> {delivery.geofence_radius ?? 0}m
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
        {selectedDelivery && (
          <DialogContent className="max-w-2xl bg-white text-gray-800 shadow-xl rounded-xl border border-gray-200 p-0 overflow-hidden">
            <DialogHeader className="flex justify-between items-center border-b px-4 py-3 bg-gray-50">
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Truck className="text-blue-600" /> {selectedDelivery.device_id}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDelivery(null)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            <div className="px-4 py-3 text-sm text-gray-700 space-y-1 border-b">
              <p>
                <MapPin className="inline w-4 h-4 mr-1" />
                {selectedDelivery.address_street}, {selectedDelivery.address_number},{" "}
                {selectedDelivery.address_city} - {selectedDelivery.address_state}
              </p>

              <p>
                Bateria:{" "}
                {devices[selectedDelivery.device_id || 0]?.battery_level ?? "—"}%
              </p>

              <p>
                <Ruler className="inline w-4 h-4 mr-1" /> Raio:{" "}
                {selectedDelivery.geofence_radius ?? "—"}m
              </p>
            </div>

            <div className="h-80 rounded-b-xl overflow-hidden">
              <MapContainer
                center={[
                  devices[selectedDelivery.device_id || 0]?.latitude ??
                  selectedDelivery.dest_lat ??
                  0,
                  devices[selectedDelivery.device_id || 0]?.longitude ??
                  selectedDelivery.dest_lon ??
                  0,
                ]}
                zoom={15}
                className="w-full h-full"
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                />

                {devices[selectedDelivery.device_id || 0] && (
                  <Marker
                    position={[
                      devices[selectedDelivery.device_id || 0].latitude!,
                      devices[selectedDelivery.device_id || 0].longitude!,
                    ]}
                    icon={deviceIcon}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <strong>Dispositivo: {selectedDelivery.device_id}</strong>
                        <div>Bateria: {devices[selectedDelivery.device_id || 0].battery_level ?? "—"}%</div>
                        <div>Velocidade: {devices[selectedDelivery.device_id || 0].speed ?? "—"} km/h</div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {selectedDelivery.dest_lat && selectedDelivery.dest_lon && (
                  <>
                    <Marker
                      position={[selectedDelivery.dest_lat, selectedDelivery.dest_lon]}
                      icon={destinationIcon}
                    >
                      <Popup>
                        <div className="space-y-1">
                          <strong>Destino da entrega</strong>
                          <div>
                            {selectedDelivery.address_street}, {selectedDelivery.address_number}<br />
                            {selectedDelivery.address_city} - {selectedDelivery.address_state}
                          </div>
                          <div>Raio: {selectedDelivery.geofence_radius}m</div>
                        </div>
                      </Popup>
                    </Marker>

                    <Circle
                      center={[selectedDelivery.dest_lat, selectedDelivery.dest_lon]}
                      radius={selectedDelivery.geofence_radius ?? 0}
                      pathOptions={{
                        color: "#22c55e",
                        fillOpacity: 0.15,
                      }}
                    />

                    {devices[selectedDelivery.device_id  || 0] && (
                      <Polyline
                        positions={[
                          [
                            devices[selectedDelivery.device_id || 0].latitude!,
                            devices[selectedDelivery.device_id || 0].longitude!,
                          ],
                          [selectedDelivery.dest_lat, selectedDelivery.dest_lon],
                        ]}
                        pathOptions={{ color: "#3b82f6", opacity: 0.6, weight: 3 }}
                      />
                    )}
                  </>
                )}

              </MapContainer>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default DeliveryPanelPage;
