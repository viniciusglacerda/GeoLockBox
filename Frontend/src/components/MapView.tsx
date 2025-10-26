import { MapPin } from "lucide-react";

interface Device {
  id: string;
  lat: number;
  lng: number;
  status: "active" | "inactive";
}

const devices: Device[] = [
  { id: "BOX-001", lat: -23.5505, lng: -46.6333, status: "active" },
  { id: "BOX-002", lat: -23.5605, lng: -46.6433, status: "active" },
  { id: "BOX-003", lat: -23.5705, lng: -46.6533, status: "inactive" },
];

const MapView = () => {
  return (
    <div className="relative w-full h-[500px] bg-secondary rounded-lg overflow-hidden shadow-md">
      {/* Mock map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
      
      {/* Grid pattern for map effect */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Device markers */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {devices.map((device, index) => (
            <div
              key={device.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{
                left: `${30 + index * 20}%`,
                top: `${40 + index * 10}%`,
              }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                device.status === "active" ? "bg-success" : "bg-muted"
              }`}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-card px-3 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <p className="text-xs font-medium text-foreground">{device.id}</p>
                <p className="text-xs text-muted-foreground">{device.status === "active" ? "Ativo" : "Inativo"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map controls overlay */}
      <div className="absolute bottom-4 right-4 bg-card rounded-lg shadow-lg p-2">
        <p className="text-xs text-muted-foreground">Visualização do Mapa</p>
      </div>
    </div>
  );
};

export default MapView;
