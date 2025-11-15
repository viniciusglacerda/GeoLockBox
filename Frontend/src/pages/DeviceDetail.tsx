import { useEffect, useState } from "react";
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
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";

import { mockService, Device, Delivery, DeviceLog } from "@/services/mockService";

const DeviceDetail = () => {
  const { id } = useParams<{ id: string }>();

  const [device, setDevice] = useState<Device | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [eventLogs, setEventLogs] = useState<DeviceLog[]>([]);
  const [loading, setLoading] = useState(true);

  const isLocked = device?.status === "locked";

  const addLog = (event: string, result: string) => {
    const date = new Date().toLocaleString();
    setEventLogs((prev) => [{ event, date, result }, ...prev]);
  };

  // --- Buscar device + delivery ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const dev = await mockService.getDevice(id);
        setDevice(dev);

        if (dev.delivery_id) {
          const del = await mockService.getDelivery(dev.delivery_id);
          setDelivery(del);
        }
      } catch (err) {
        toast.error("Erro ao buscar informações do dispositivo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // --- Handlers de lock/unlock/refresh ---
  const handleLock = async () => {
    if (!device) return;
    try {
      await mockService.sendTelemetry(device.id, {
        latitude: device.latitude,
        longitude: device.longitude,
      });

      setDevice({ ...device, status: "locked" });
      toast.success("Trava bloqueada com sucesso!");
      addLog("Trava bloqueada", "Sucesso");
    } catch {
      toast.error("Falha ao bloquear trava.");
      addLog("Trava bloqueada", "Erro");
    }
  };

  const handleUnlock = async () => {
    if (!device) return;
    try {
      await mockService.sendTelemetry(device.id, {
        latitude: device.latitude,
        longitude: device.longitude,
      });

      setDevice({ ...device, status: "unlocked" });
      toast.success("Trava desbloqueada com sucesso!");
      addLog("Trava desbloqueada", "Sucesso");
    } catch {
      toast.error("Falha ao desbloquear trava.");
      addLog("Trava desbloqueada", "Erro");
    }
  };

  const handleRefresh = async () => {
    if (!device) return;

    try {
      const updated = await mockService.getDevice(device.id);
      setDevice(updated);

      if (updated.delivery_id) {
        const del = await mockService.getDelivery(updated.delivery_id);
        setDelivery(del);
      }

      toast.success("Dispositivo atualizado!");
      addLog("Atualização de localização", "Sucesso");
    } catch {
      toast.error("Falha ao atualizar dispositivo.");
      addLog("Atualização de localização", "Erro");
    }
  };

  // Ícone personalizado no mapa
  const lucideIcon = new L.DivIcon({
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

  const FitMapView = () => {
    const map = useMap();
    if (device) map.setView([device.latitude, device.longitude], 16);
    return null;
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
          {/* Header */}
          <div className="bg-primary rounded-t-lg p-6 shadow-md">
            <h1 className="text-3xl font-bold text-primary-foreground">
              Caixa #{device.id}
            </h1>
          </div>

          {/* Conteúdo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

            {/* Informações principais */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Informações Principais</h2>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span>Status da Trava</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isLocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                    }`}
                  >
                    {isLocked ? "Bloqueado" : "Desbloqueado"}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span>Latitude</span>
                  <span className="font-mono">{device.latitude}</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span>Longitude</span>
                  <span className="font-mono">{device.longitude}</span>
                </div>

                <div className="flex justify-between py-2">
                  <span>Bateria</span>
                  <span>{device.battery_level}%</span>
                </div>

                <div className="flex justify-between py-2">
                  <span>Entrega vinculada</span>
                  <span>{delivery ? `#${delivery.tracking_number}` : "Nenhuma"}</span>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Localização e Geofencing</h2>

              <MapContainer
                center={[device.latitude, device.longitude]}
                zoom={16}
                scrollWheelZoom={true}
                className="w-full h-64 rounded-lg"
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <FitMapView />

                <Marker position={[device.latitude, device.longitude]} icon={lucideIcon}>
                  <Popup>
                    {device.name} - {isLocked ? "Bloqueado" : "Desbloqueado"}
                  </Popup>
                </Marker>

                {/* Geofence vindo da Delivery */}
                {delivery && (
                  <Circle
                    center={[delivery.dest_lat ?? 0, delivery.dest_lon ?? 0]}
                    radius={delivery.geofence_radius}
                  />
                )}
              </MapContainer>

              <p className="text-sm text-muted-foreground text-center mt-2">
                Raio do geofence: {delivery?.geofence_radius ?? 0}m
              </p>
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

            <Button onClick={handleRefresh} className="bg-blue-500 hover:bg-blue-600 text-white">
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
                  {eventLogs.map((log, i) => (
                    <TableRow key={i}>
                      <TableCell>{log.event}</TableCell>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            log.result === "Sucesso"
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
