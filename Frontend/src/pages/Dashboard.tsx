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

const devices = [
  { id: "BOX-001", status: "Ativo", location: "São Paulo, SP", lastUpdate: "2 min atrás" },
  { id: "BOX-002", status: "Ativo", location: "Rio de Janeiro, RJ", lastUpdate: "5 min atrás" },
  { id: "BOX-003", status: "Inativo", location: "Belo Horizonte, MG", lastUpdate: "1 hora atrás" },
  { id: "BOX-004", status: "Ativo", location: "Brasília, DF", lastUpdate: "3 min atrás" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do sistema de monitoramento</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total de Dispositivos"
              value={24}
              icon={Package}
              variant="default"
            />
            <StatCard
              title="Dispositivos Ativos"
              value={18}
              icon={Activity}
              variant="success"
            />
            <StatCard
              title="Travas Abertas"
              value={3}
              icon={Unlock}
              variant="warning"
            />
            <StatCard
              title="Alertas de Geofencing"
              value={2}
              icon={AlertTriangle}
              variant="destructive"
            />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Mapa de Dispositivos</h2>
            <MapView />
          </div>

          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Dispositivos Recentes</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{device.id}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        device.status === "Ativo"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {device.status}
                      </span>
                    </TableCell>
                    <TableCell>{device.location}</TableCell>
                    <TableCell className="text-muted-foreground">{device.lastUpdate}</TableCell>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
