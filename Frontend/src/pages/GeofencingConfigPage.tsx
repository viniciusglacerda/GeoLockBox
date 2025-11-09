import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Truck, MapPin, Ruler, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";

// --- Mock Data ---
const mockDevices = [
  { id: "BOX-001", name: "Box 001" },
  { id: "BOX-002", name: "Box 002" },
];

const mockDrivers = [
  { id: "DRV-001", name: "João Silva" },
  { id: "DRV-002", name: "Maria Santos" },
];

const mockDeliveries = [
  { id: "DEL-001", destination: "Av. Paulista, 1000", coords: [-23.5614, -46.6559] },
  { id: "DEL-002", destination: "Rua da Consolação, 800", coords: [-23.5565, -46.6627] },
];

// --- Custom Marker Icon ---
const truckIcon = new L.DivIcon({
  html: `
    <div style="width:30px;height:30px;border-radius:50%;background:#2563eb;display:flex;align-items:center;justify-content:center;box-shadow:0 0 4px rgba(0,0,0,0.3);">
      <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
        <path d="M3 13V6a1 1 0 011-1h10v8H3zm11 0V5h4l3 3v5h-7zM6 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z"/>
      </svg>
    </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// --- Map Helpers ---
const LocationSelector = ({ onSelect }: { onSelect: (lat: number, lon: number) => void }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const RecenterMap = ({ location }: { location: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView(location, 14);
    }
  }, [location]);
  return null;
};

// --- Main Component ---
const GeofencingConfigPage: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [selectedDelivery, setSelectedDelivery] = useState<string>("");
  const [radius, setRadius] = useState<number>(100);
  const [location, setLocation] = useState<[number, number] | null>([-23.5614, -46.6559]);

  // Atualiza o mapa quando muda a entrega
  useEffect(() => {
    if (selectedDelivery) {
      const delivery = mockDeliveries.find((d) => d.id === selectedDelivery);
      if (delivery) setLocation(delivery.coords as [number, number]);
    }
  }, [selectedDelivery]);

  // Centraliza mapa quando muda dispositivo ou entregador (mock visual)
  useEffect(() => {
    if (selectedDevice || selectedDriver) {
      // Só um pequeno efeito visual de mudança
      if (location) {
        setLocation([location[0] + Math.random() * 0.001, location[1] + Math.random() * 0.001]);
      }
    }
  }, [selectedDevice, selectedDriver]);

  const handleSaveConfig = () => {
    console.log({
      device: selectedDevice,
      driver: selectedDriver,
      delivery: selectedDelivery,
      radius,
      location,
    });
    alert("Configuração salva com sucesso!");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="text-blue-600" /> Configuração de Geofencing
        </h1>

        {/* Vínculo de Entregas */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="text-blue-600" /> Vínculo de Entregas e Dispositivos
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <Select onValueChange={setSelectedDevice}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dispositivo" />
              </SelectTrigger>
              <SelectContent>
                {mockDevices.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedDriver}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o entregador" />
              </SelectTrigger>
              <SelectContent>
                {mockDrivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedDelivery}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a entrega" />
              </SelectTrigger>
              <SelectContent>
                {mockDeliveries.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.destination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Área de Geofencing */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ruler className="text-blue-600" /> Área de Geofencing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-40"
                placeholder="Raio (m)"
              />
              <span className="text-sm text-gray-600">
                Clique no mapa ou altere a entrega para mover o centro.
              </span>
            </div>

            <div className="h-80 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
              <MapContainer
                center={location || [-23.5614, -46.6559]}
                zoom={14}
                className="w-full h-full"
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                />
                {location && (
                  <>
                    <Marker position={location} icon={truckIcon} />
                    <Circle
                      center={location}
                      radius={radius}
                      pathOptions={{ color: "#2563eb", fillOpacity: 0.1 }}
                    />
                  </>
                )}
                <LocationSelector onSelect={(lat, lon) => setLocation([lat, lon])} />
                <RecenterMap location={location} />
              </MapContainer>
            </div>

            <Button
              onClick={handleSaveConfig}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4" /> Salvar Configuração
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default GeofencingConfigPage;
