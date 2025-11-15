import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import MapView from "@/components/MapView";
import { Package, Activity, Unlock, AlertTriangle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockService, Device } from "@/services/mockService";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Busca os dispositivos da API mock ---
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await mockService.getDevices();
        setDevices(response);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar dispositivos.");
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  // --- Estatísticas simples (mockadas com base nos devices) ---
  const totalDevices = devices.length;
  const activeDevices = devices.filter((d) => d.status === "active").length;
  const unlockedDevices = devices.filter((d) => d.status === "unlocked").length;
  const geofenceAlerts = devices.filter(
    (d) => d.geofence && d.status === "alert"
  ).length;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral do sistema de monitoramento
            </p>
          </div>

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total de Dispositivos" value={totalDevices} icon={Package} />
            <StatCard
              title="Dispositivos Ativos"
              value={activeDevices}
              icon={Activity}
              variant="success"
            />
            <StatCard
              title="Travas Abertas"
              value={unlockedDevices}
              icon={Unlock}
              variant="warning"
            />
            <StatCard
              title="Alertas de Geofencing"
              value={geofenceAlerts}
              icon={AlertTriangle}
              variant="destructive"
            />
          </div>

          {/* Mapa */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Mapa de Dispositivos
            </h2>
            <MapView devices={devices} />
          </div>

          {/* Tabela de dispositivos */}
          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Dispositivos Recentes
            </h2>

            {loading ? (
              <p className="text-muted-foreground text-sm">Carregando dispositivos...</p>
            ) : devices.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum dispositivo encontrado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Bateria</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{device.id}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            device.status === "active"
                              ? "bg-green-100 text-green-700"
                              : device.status === "unlocked"
                              ? "bg-yellow-100 text-yellow-700"
                              : device.status === "alert"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {device.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {device.geofence
                          ? `${device.geofence.center[0].toFixed(3)}, ${device.geofence.center[1].toFixed(3)}`
                          : "Sem localização"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {device.battery_level ?? "--"}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/device/${device.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
