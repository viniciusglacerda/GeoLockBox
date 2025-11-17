import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Truck, MapPin, Ruler, Unlock, X, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiService, Delivery, Telemetry, Device } from "@/services/apiService";

const DeliveryPanelPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [telemetries, setTelemetries] = useState<Record<string, Telemetry>>({});
  const [devices, setDevices] = useState<Record<string, Device>>({});
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allDeliveries = await apiService.getDeliveries();

        const userDeliveries = allDeliveries.filter(d => d.driver_id === userId);
        setDeliveries(userDeliveries);

        const devicesData = await apiService.getDevices();
        const devicesMap: Record<string, Device> = {};
        devicesData.forEach(d => (devicesMap[d.id] = d));
        setDevices(devicesMap);

        const telemetryPromises = userDeliveries
          .filter(d => d.device_id)
          .map(d => apiService.getTelemetry(d.device_id!));
        const telemetryResults = await Promise.all(telemetryPromises);
        const telemetryMap: Record<string, Telemetry> = {};
        telemetryResults.forEach((tArray, i) => {
          const deviceId = userDeliveries[i].device_id;
          if (deviceId && tArray.length > 0) {
            const latest = tArray.sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )[0];
            telemetryMap[deviceId] = latest;
          }
        });
        setTelemetries(telemetryMap);
      } catch (err) {
        console.error("Erro ao buscar entregas ou dispositivos:", err);
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

  const truckIcon = (status?: string) =>
    new L.DivIcon({
      html: `<div style="
          width:30px;height:30px;border-radius:50%;
          background:${status === "unlocked" ? "#22c55e" : status === "arrived" ? "#3b82f6" : "#facc15"};
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 0 4px rgba(0,0,0,0.3);">
        <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
          <path d="M3 13V6a1 1 0 011-1h10v8H3zm11 0V5h4l3 3v5h-7zM6 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z"/>
        </svg>
      </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
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
              <div className="flex items-center text-gray-600 text-sm gap-1">
                <MapPin size={16} />
                {`${delivery.address_street}, ${delivery.address_number}, ${delivery.address_city} - ${delivery.address_state}`}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                {delivery.status === "unlocked" ? "Destravado" : delivery.status === "arrived" ? "Chegou" : "Em trânsito"}
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
              <Button variant="ghost" size="icon" onClick={() => setSelectedDelivery(null)} className="hover:bg-gray-100">
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            <div className="px-4 py-3 text-sm text-gray-700 space-y-1 border-b">
              <p><MapPin className="inline w-4 h-4 mr-1" /> {selectedDelivery.address_street}, {selectedDelivery.address_number}, {selectedDelivery.address_city} - {selectedDelivery.address_state}</p>
              <p><Ruler className="inline w-4 h-4 mr-1" /> Raio de geofence: {selectedDelivery.geofence_radius ?? "—"} m</p>
            </div>

            <div className="h-80 rounded-b-xl overflow-hidden">
              <MapContainer
                center={[
                  telemetries[selectedDelivery.device_id || 0]?.latitude ?? selectedDelivery.dest_lat ?? 0,
                  telemetries[selectedDelivery.device_id || 0]?.longitude ?? selectedDelivery.dest_lon ?? 0,
                ]}
                zoom={15}
                className="w-full h-full z-50"
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                />

                {telemetries[selectedDelivery.device_id || 0] && (
                  <Marker
                    position={[
                      telemetries[selectedDelivery.device_id || 0].latitude,
                      telemetries[selectedDelivery.device_id || 0].longitude,
                    ]}
                    icon={truckIcon(selectedDelivery.status)}
                  >
                    <Popup>
                      <div>
                        <strong>Dispositivo: {selectedDelivery.device_id}</strong>
                        <div>Bateria: {telemetries[selectedDelivery.device_id || 0].battery_level ?? "—"}%</div>
                        <div>Última atualização: {telemetries[selectedDelivery.device_id || 0].timestamp}</div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {selectedDelivery.dest_lat && selectedDelivery.dest_lon && (
                  <>
                    <Marker
                      position={[selectedDelivery.dest_lat, selectedDelivery.dest_lon]}
                      icon={truckIcon(selectedDelivery.status)}
                    >
                      <Popup>Destino da entrega</Popup>
                    </Marker>

                    <Circle
                      center={[selectedDelivery.dest_lat, selectedDelivery.dest_lon]}
                      radius={selectedDelivery.geofence_radius ?? 0}
                      pathOptions={{
                        color:
                          selectedDelivery.status === "unlocked"
                            ? "#22c55e"
                            : selectedDelivery.status === "arrived"
                              ? "#3b82f6"
                              : "#facc15",
                        fillOpacity: 0.15,
                      }}
                    />
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
