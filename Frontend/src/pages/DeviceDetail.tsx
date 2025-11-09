import { useState } from "react";
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
import "leaflet/dist/leaflet.css";
import ReactDOMServer from "react-dom/server";

const DeviceDetail = () => {
  const { id } = useParams();
  const [isLocked, setIsLocked] = useState(true);

  // Estado de logs
  const [eventLogs, setEventLogs] = useState([
    { event: "Trava bloqueada", date: "2024-01-20 14:30", result: "Sucesso" },
    { event: "Atualização de localização", date: "2024-01-20 14:25", result: "Sucesso" },
    { event: "Trava desbloqueada", date: "2024-01-20 14:00", result: "Sucesso" },
    { event: "Alerta de geofencing", date: "2024-01-20 13:45", result: "Alerta" },
  ]);

  const deviceInfo = {
    id: id || "BOX-001",
    status: isLocked ? "Bloqueado" : "Desbloqueado",
    location: "São Paulo, SP",
    latitude: -23.5505,
    longitude: -46.6333,
    lastUpdate: "2 min atrás",
    geofenceRadius: 50,
  };

  const addLog = (event: string, result: string) => {
    const date = new Date().toLocaleString();
    setEventLogs((prev) => [{ event, date, result }, ...prev]);
  };

  const handleLock = () => {
    setIsLocked(true);
    toast.success("Trava bloqueada com sucesso!");
    addLog("Trava bloqueada", "Sucesso");
  };

  const handleUnlock = () => {
    setIsLocked(false);
    toast.success("Trava desbloqueada com sucesso!");
    addLog("Trava desbloqueada", "Sucesso");
  };

  const handleRefresh = () => {
    toast.success("Dispositivo atualizado!");
    addLog("Atualização de localização", "Sucesso");
  };

  // Ícone do Leaflet com React
  const lucideIcon = new L.DivIcon({
    html: ReactDOMServer.renderToString(
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg`}
        style={{ backgroundColor: isLocked ? "#F87171" : "#34D399" }}
      >
        <MapPin className="w-6 h-6" style={{ color: "white" }} />
      </div>
    ),
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const FitMapView = () => {
    const map = useMap();
    map.setView([deviceInfo.latitude, deviceInfo.longitude], 16);
    return null;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-primary rounded-t-lg p-6 shadow-md">
            <h1 className="text-3xl font-bold text-primary-foreground">
              Caixa #{deviceInfo.id}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Informações principais */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Informações Principais
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Status da Trava</span>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isLocked
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                      }`}
                  >
                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    {deviceInfo.status}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Localização</span>
                  <span className="text-foreground font-medium">{deviceInfo.location}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Latitude</span>
                  <span className="text-foreground font-mono">{deviceInfo.latitude}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Longitude</span>
                  <span className="text-foreground font-mono">{deviceInfo.longitude}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground">Última Atualização</span>
                  <span className="text-foreground">{deviceInfo.lastUpdate}</span>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Localização e Geofencing
              </h2>
              <MapContainer
                center={[deviceInfo.latitude, deviceInfo.longitude]}
                zoom={16}
                scrollWheelZoom={true}
                className="w-full h-64 rounded-lg"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                />
                <FitMapView />
                <Marker position={[deviceInfo.latitude, deviceInfo.longitude]} icon={lucideIcon}>
                  <Popup>
                    {deviceInfo.id} - {deviceInfo.status}
                  </Popup>
                </Marker>
                <Circle
                  center={[deviceInfo.latitude, deviceInfo.longitude]}
                  radius={deviceInfo.geofenceRadius}
                  pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.1 }}
                />
              </MapContainer>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Círculo de geofencing ativo ({deviceInfo.geofenceRadius}m)
              </p>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Button
              onClick={handleLock}
              className={`w-full text-white font-medium py-3 rounded-lg shadow-md ${isLocked ? "bg-red-500 hover:bg-red-600" : "opacity-50 cursor-not-allowed"
                }`}
              disabled={isLocked}
            >
              <Lock className="w-5 h-5 mr-2" />
              Bloquear
            </Button>

            <Button
              onClick={handleUnlock}
              className={`w-full text-white font-medium py-3 rounded-lg shadow-md ${!isLocked ? "bg-green-500 hover:bg-green-600" : "opacity-50 cursor-not-allowed"
                }`}
              disabled={!isLocked}
            >
              <Unlock className="w-5 h-5 mr-2" />
              Desbloquear
            </Button>

            <Button
              onClick={handleRefresh}
              className="w-full text-white font-medium py-3 rounded-lg shadow-md bg-blue-500 hover:bg-blue-600"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Logs de eventos */}
          <div className="bg-card rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Logs de Eventos Recentes
            </h2>
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Data e Hora</TableHead>
                    <TableHead>Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{log.event}</TableCell>
                      <TableCell className="text-muted-foreground">{log.date}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.result === "Sucesso"
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
