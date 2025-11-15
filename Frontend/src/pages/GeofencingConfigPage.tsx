// GeofencingConfigPage.tsx
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

import {
  Package,
  MapPin,
  Ruler,
  Save,
  Loader2,
  Map as MapIcon,
  Link as LinkIcon,
} from "lucide-react";

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
import { mockService, Device, Delivery, User } from "@/services/mockService";
import { toast } from "sonner";

// ---------------------------
// Custom Icons
// ---------------------------
const geolockboxIcon = new L.DivIcon({
  html: `
    <div style="width:28px;height:28px;border-radius:6px;background:#2563eb;display:flex;align-items:center;justify-content:center;box-shadow:0 0 4px rgba(0,0,0,0.3);">
      <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
        <path d="M17 8V7a5 5 0 00-10 0v1H5v14h14V8h-2zm-8-1a3 3 0 016 0v1H9V7zm3 10a2 2 0 110-4 2 2 0 010 4z"/>
      </svg>
    </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const destinationIcon = new L.DivIcon({
  html: `
    <div style="width:24px;height:24px;border-radius:50%;background:#16a34a;display:flex;align-items:center;justify-content:center;box-shadow:0 0 4px rgba(0,0,0,0.3);">
      <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
      </svg>
    </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// ---------------------------
// Map Helpers (tipados)
// ---------------------------
type LocationSelectorProps = {
  onSelect: (lat: number, lon: number) => void;
};

const LocationSelector: React.FC<LocationSelectorProps> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

type RecenterMapProps = {
  location: [number, number] | null;
};

const RecenterMap: React.FC<RecenterMapProps> = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) map.setView(location, 14);
  }, [location, map]);
  return null;
};

// ---------------------------
// Main Component
// ---------------------------
const GeofencingConfigPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedDelivery, setSelectedDelivery] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");

  const [radius, setRadius] = useState<number>(100);
  const [deliveryLocation, setDeliveryLocation] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);

  // ---------------------------
  // Load data
  // ---------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const [devs, dels, u] = await Promise.all([
          mockService.getDevices(),
          mockService.getDeliveries(),
          mockService.getUsers(),
        ]);

        // assegura tipos corretos (caso mock retorne any)
        setDevices(devs ?? []);
        setDeliveries(dels ?? []);
        setUsers(u ?? []);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar dados.");
      }
    };

    load();
  }, []);

  // ---------------------------
  // Apply delivery info when selected
  // ---------------------------
  useEffect(() => {
    if (!selectedDelivery) {
      setSelectedDevice("");
      setSelectedDriver("");
      setDeliveryLocation(null);
      setRadius(100);
      return;
    }

    const d = deliveries.find((x) => x.id === selectedDelivery);
    if (!d) return;

    setSelectedDevice(d.device_id ?? "");
    setSelectedDriver(d.driver_id ?? "");

    if (typeof d.dest_lat === "number" && typeof d.dest_lon === "number") {
      setDeliveryLocation([d.dest_lat, d.dest_lon]);
    } else {
      setDeliveryLocation(null);
    }

    setRadius(d.geofence_radius ?? 100);
  }, [selectedDelivery, deliveries]);

  // ---------------------------
  // Search address
  // ---------------------------
  const handleAddressSearch = async () => {
    if (!address.trim()) return;
    setSearching(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data: Array<{ lat: string; lon: string }> = await res.json();

      if (data.length > 0) {
        setDeliveryLocation([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        toast.success("Endereço localizado!");
      } else {
        toast.error("Endereço não encontrado.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar endereço.");
    } finally {
      setSearching(false);
    }
  };

  // ---------------------------
  // Save configs
  // ---------------------------
  const handleSaveConfig = async () => {
    if (!selectedDelivery) {
      toast.error("Selecione uma entrega.");
      return;
    }
    if (!deliveryLocation) {
      toast.error("Selecione o ponto no mapa.");
      return;
    }

    setLoading(true);

    try {
      await mockService.updateDeliveryGeofence(
        selectedDelivery,
        deliveryLocation,
        radius
      );

      await mockService.assign(selectedDevice, selectedDelivery, selectedDriver);

      toast.success("Configurações salvas!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const drivers = users.filter((u) => u.role === "driver");

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="text-blue-600" /> Configuração de Entrega
          </h1>
        </div>

        {/* --------------------------- */}
        {/* Delivery selector */}
        {/* --------------------------- */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-600" /> Selecionar Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedDelivery} onValueChange={(v: string) => setSelectedDelivery(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma entrega" />
              </SelectTrigger>
              <SelectContent>
                {deliveries.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    #{d.order_number} — {d.receiver_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* --------------------------- */}
        {/* Device + Driver */}
        {/* --------------------------- */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" /> Vincular Device + Entregador
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">GeoLockBox</label>
              <Select value={selectedDevice} onValueChange={(v: string) => setSelectedDevice(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dispositivo" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name ?? d.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Entregador</label>
              <Select value={selectedDriver} onValueChange={(v: string) => setSelectedDriver(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o entregador" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* --------------------------- */}
        {/* Geofence */}
        {/* --------------------------- */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-blue-600" /> Geofencing
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Address search */}
            <div className="flex gap-3 items-center">
              <Input
                placeholder="Endereço de destino"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddressSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <MapIcon className="w-4 h-4 mr-2" />
                )}
                Buscar
              </Button>
            </div>

            {/* Radius */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Raio (m)</label>
                <Input
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Map */}
            <div className="h-96 rounded-xl overflow-hidden border shadow">
              <MapContainer
                center={deliveryLocation ?? [-19.9668, -44.1984]}
                zoom={13}
                scrollWheelZoom
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {deliveryLocation && (
                  <>
                    <Marker position={deliveryLocation} icon={destinationIcon} />
                    <Circle
                      center={deliveryLocation}
                      radius={radius}
                      pathOptions={{ color: "#16a34a", fillOpacity: 0.2 }}
                    />
                  </>
                )}

                <LocationSelector
                  onSelect={(lat, lon) => setDeliveryLocation([lat, lon])}
                />

                <RecenterMap location={deliveryLocation} />
              </MapContainer>
            </div>

            <Button
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSaveConfig}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default GeofencingConfigPage;
