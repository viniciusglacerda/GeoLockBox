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

const DeviceDetail = () => {
  const { id } = useParams();
  const [isLocked, setIsLocked] = useState(true);

  const deviceInfo = {
    id: id || "BOX-001",
    status: isLocked ? "Bloqueado" : "Desbloqueado",
    location: "São Paulo, SP",
    latitude: -23.5505,
    longitude: -46.6333,
    lastUpdate: "2 min atrás",
  };

  const eventLogs = [
    { event: "Trava bloqueada", date: "2024-01-20 14:30", result: "Sucesso" },
    { event: "Atualização de localização", date: "2024-01-20 14:25", result: "Sucesso" },
    { event: "Trava desbloqueada", date: "2024-01-20 14:00", result: "Sucesso" },
    { event: "Alerta de geofencing", date: "2024-01-20 13:45", result: "Alerta" },
  ];

  const handleLock = () => {
    setIsLocked(true);
    toast.success("Trava bloqueada com sucesso!");
  };

  const handleUnlock = () => {
    setIsLocked(false);
    toast.success("Trava desbloqueada com sucesso!");
  };

  const handleRefresh = () => {
    toast.success("Dispositivo atualizado!");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary rounded-t-lg p-6 shadow-md">
            <h1 className="text-3xl font-bold text-primary-foreground">Caixa #{deviceInfo.id}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Informações Principais</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Status da Trava</span>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    isLocked
                      ? "bg-destructive/10 text-destructive"
                      : "bg-success/10 text-success"
                  }`}>
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

            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Localização e Geofencing</h2>
              <div className="relative w-full h-64 bg-secondary rounded-lg overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
                  backgroundSize: '30px 30px'
                }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute w-32 h-32 border-2 border-primary/30 rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
                    <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">Círculo de geofencing ativo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Button
              onClick={handleLock}
              variant="destructive"
              size="lg"
              className="w-full"
              disabled={isLocked}
            >
              <Lock className="w-5 h-5 mr-2" />
              Bloquear
            </Button>
            <Button
              onClick={handleUnlock}
              className="w-full bg-success hover:bg-success/90"
              size="lg"
              disabled={!isLocked}
            >
              <Unlock className="w-5 h-5 mr-2" />
              Desbloquear
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Atualizar
            </Button>
          </div>

          <div className="bg-card rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Logs de Eventos Recentes</h2>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.result === "Sucesso"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}>
                        {log.result}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeviceDetail;
