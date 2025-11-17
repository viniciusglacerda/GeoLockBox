import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, RefreshCw, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";

import { apiService, Device, Delivery, Log } from "@/services/apiService";

const DeviceDetail = () => {
  const { id } = useParams<{ id: string }>();

  const [device, setDevice] = useState<Device | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [eventLogs, setEventLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const isLocked = device?.status === "locked";

  // --- Ícone do mapa ---
  const lucideIcon = useMemo(() => {
    return new L.DivIcon({
      html: ReactDOMServer.renderToString(
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: isLocked ? "#F87171" : "#34D399" }}
        >
          <MapPin className="w-6 h-6" style={{ color: "white" }} />
        </div>
      ),
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  }, [isLocked]);

  // --- Centralizar mapa quando device muda ---
  const FitMapView = () => {
    const map = useMap();
    useEffect(() => {
      if (device?.latitude && device?.longitude) {
        map.setView([device.latitude, device.longitude], 16);
      }
    }, [device, map]);
    return null;
  };

  // --- Adicionar log ---
  const addLog = async (event: string, result: string) => {
    try {
      if (!device) return;
      const newLog = await apiService.createLog({
        id: device.id,
        event,
        result,
      });
      setEventLogs((prev) => [newLog, ...prev]);
    } catch {
      toast.error("Falha ao registrar log.");
    }
  };

  // --- Buscar device + delivery + logs ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const dev = await apiService.getDevice(id);
        setDevice(dev);

        // --- Buscar entrega vinculada pelo device_id ---
        const deliveries = await apiService.getDeliveries();
        const linkedDelivery = deliveries.find((d) => d.device_id === dev.id);
        setDelivery(linkedDelivery || null);

        // --- Buscar logs do device ---
        const logs = await apiService.getLogs();
        const deviceLogs = logs.filter((l) => l.id === dev.id || l.id === dev.id);
        setEventLogs(deviceLogs.reverse());
      } catch (err) {
        console.error(err);
        toast.error("Erro ao buscar informações do dispositivo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // --- Handlers ---
  const handleLock = async () => {
    if (!device) return;
    try {
      await apiService.patchDevice(device.id, { status: "locked" });
      setDevice({ ...device, status: "locked" });
      toast.success("Trava bloqueada com sucesso!");
    } catch {
      toast.error("Falha ao bloquear trava.");
    }
  };

  const handleUnlock = async () => {
    if (!device) return;
    try {
      await apiService.patchDevice(device.id, { status: "unlocked" });
      setDevice({ ...device, status: "unlocked" });
      toast.success("Trava desbloqueada com sucesso!");
    } catch {
      toast.error("Falha ao desbloquear trava.");
    }
  };

  const handleRefresh = async () => {
    if (!device) return;
    try {
      const updated = await apiService.getDevice(device.id);
      setDevice(updated);

      // Atualizar entrega vinculada
      const deliveries = await apiService.getDeliveries();
      const linkedDelivery = deliveries.find((d) => d.device_id === updated.id);
      setDelivery(linkedDelivery || null);

      toast.success("Dispositivo atualizado!");
    } catch {
      toast.error("Falha ao atualizar dispositivo.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );

  if (!device)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Dispositivo não encontrado.</p>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary rounded-t-lg p-6 shadow-md">
            <h1 className="text-3xl font-bold text-primary-foreground">
              Caixa #{device.id}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Informações do device */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Informações do Dispositivo</h2>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span>Status da Trava</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${isLocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      }`}
                  >
                    {isLocked ? "Bloqueado" : "Desbloqueado"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Latitude</span>
                  <span className="font-mono">{device.latitude ?? "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Longitude</span>
                  <span className="font-mono">{device.longitude ?? "—"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Bateria</span>
                  <span>{device.battery_level ?? "—"}%</span>
                </div>
              </div>
            </div>

            {/* Informações da entrega + mapa */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Entrega Vinculada</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between py-1 border-b">
                  <span>Número do Pedido</span>
                  <span>{delivery ? `#${delivery.order_number}` : "Nenhuma"}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Destino Latitude</span>
                  <span className="font-mono">{delivery?.dest_lat ?? "—"}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Destino Longitude</span>
                  <span className="font-mono">{delivery?.dest_lon ?? "—"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Raio do Geofence</span>
                  <span>{delivery?.geofence_radius ?? "—"} m</span>
                </div>
              </div>

              {/* Mapa */}
              <MapContainer
                center={[device.latitude || 0, device.longitude || 0]}
                zoom={16}
                scrollWheelZoom={true}
                style={{ width: "100%", height: "300px" }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OpenStreetMap & CARTO'
                />
                <FitMapView />

                {/* Marcador do device */}
                <Marker position={[device.latitude || 0, device.longitude || 0]} icon={lucideIcon}>
                  <Popup>
                    {device.name} - {isLocked ? "Bloqueado" : "Desbloqueado"}
                  </Popup>
                </Marker>

                {/* Geofence da entrega */}
                {delivery?.dest_lat && delivery?.dest_lon && delivery.geofence_radius && (
                  <Circle
                    center={[delivery.dest_lat, delivery.dest_lon]}
                    radius={delivery.geofence_radius}
                    pathOptions={{ color: "blue", fillOpacity: 0.1 }}
                  />
                )}

                {delivery?.dest_lat && delivery?.dest_lon && (
                  <Polyline
                    positions={[
                      [device.latitude || 0, device.longitude || 0],
                      [delivery.dest_lat, delivery.dest_lon],
                    ]}
                    pathOptions={{ color: "purple", weight: 3, dashArray: "5, 10" }}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          {/* Ações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Button
              onClick={handleLock}
              disabled={isLocked}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Lock className="w-5 h-5 mr-2" />
              Bloquear
            </Button>
            <Button
              onClick={handleUnlock}
              disabled={!isLocked}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Unlock className="w-5 h-5 mr-2" />
              Desbloquear
            </Button>
            <Button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Logs */}
          <div className="bg-card rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Logs Recentes</h2>
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.event}</TableCell>
                      <TableCell>{log.created_at ?? "—"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${log.result === "Sucesso"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                            }`}
                        >
                          {log.result}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeviceDetail;
