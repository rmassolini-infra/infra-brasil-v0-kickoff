import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Gauge, Droplet, Clock, Activity, Zap } from "lucide-react";
import komatsuImg from "@/assets/komatsu-pc200.png";
import caterpillarImg from "@/assets/caterpillar-320d.png";
import volvoImg from "@/assets/volvo-ec210.png";

interface TelemetryData {
  asset_id: string;
  oem: string;
  model: string;
  timestamp_utc: string;
  location: {
    lat: number;
    lon: number;
    accuracy_m: number;
  };
  engine_hours: number;
  fuel_level_pct: number;
  speed_kmh: number;
  heading_deg: number;
  odometer_km: number;
  event_type: "telemetry" | "ignition" | "idle" | "move";
  source: string;
  ingested_at: string;
}

const mockTelemetryData: TelemetryData[] = [
  {
    asset_id: "KMT-PC200-8-12345",
    oem: "Komatsu",
    model: "PC200-8",
    timestamp_utc: new Date().toISOString(),
    location: { lat: -23.2185, lon: -45.9002, accuracy_m: 8 },
    engine_hours: 4123.6,
    fuel_level_pct: 57.2,
    speed_kmh: 3.4,
    heading_deg: 145,
    odometer_km: 12450,
    event_type: "telemetry",
    source: "AEMP2.0",
    ingested_at: new Date().toISOString(),
  },
  {
    asset_id: "CAT-320D-99887",
    oem: "Caterpillar",
    model: "320D",
    timestamp_utc: new Date().toISOString(),
    location: { lat: -22.9068, lon: -43.1729, accuracy_m: 12 },
    engine_hours: 2845.3,
    fuel_level_pct: 82.5,
    speed_kmh: 0,
    heading_deg: 0,
    odometer_km: 8920,
    event_type: "idle",
    source: "AEMP2.0",
    ingested_at: new Date().toISOString(),
  },
  {
    asset_id: "VOL-EC210-77665",
    oem: "Volvo",
    model: "EC210",
    timestamp_utc: new Date().toISOString(),
    location: { lat: -15.7942, lon: -47.8822, accuracy_m: 6 },
    engine_hours: 5678.9,
    fuel_level_pct: 34.8,
    speed_kmh: 15.2,
    heading_deg: 270,
    odometer_km: 18650,
    event_type: "move",
    source: "AEMP2.0",
    ingested_at: new Date().toISOString(),
  },
];

export default function Telemetria() {
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>(mockTelemetryData);
  const [selectedAsset, setSelectedAsset] = useState<TelemetryData | null>(telemetryData[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryData((prev) =>
        prev.map((asset) => ({
          ...asset,
          timestamp_utc: new Date().toISOString(),
          engine_hours: asset.engine_hours + Math.random() * 0.1,
          fuel_level_pct: Math.max(0, asset.fuel_level_pct - Math.random() * 0.5),
          speed_kmh: Math.max(0, asset.speed_kmh + (Math.random() - 0.5) * 2),
          location: {
            ...asset.location,
            lat: asset.location.lat + (Math.random() - 0.5) * 0.001,
            lon: asset.location.lon + (Math.random() - 0.5) * 0.001,
          },
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedAsset) {
      const updated = telemetryData.find((d) => d.asset_id === selectedAsset.asset_id);
      if (updated) setSelectedAsset(updated);
    }
  }, [telemetryData, selectedAsset]);

  const getEventTypeBadge = (eventType: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "success" | "warning", label: string }> = {
      telemetry: { variant: "default", label: "Telemetria" },
      move: { variant: "success", label: "Em Movimento" },
      idle: { variant: "warning", label: "Em Marcha Lenta" },
      ignition: { variant: "secondary", label: "Ignição" },
    };
    const config = variants[eventType] || variants.telemetry;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getMachineImage = (model: string) => {
    if (model.includes("PC200")) return komatsuImg;
    if (model.includes("320D")) return caterpillarImg;
    if (model.includes("EC210")) return volvoImg;
    return komatsuImg;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Telemetria em Tempo Real</h1>
          <p className="text-muted-foreground">
            Monitoramento ISO 15143-3 (AEMP 2.0) • Atualização a cada 3s
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {telemetryData.map((asset) => (
            <Card
              key={asset.asset_id}
              className={`glass-card p-6 cursor-pointer transition-all ${
                selectedAsset?.asset_id === asset.asset_id
                  ? "ring-2 ring-primary glow-blue"
                  : "hover:ring-1 hover:ring-primary/50"
              }`}
              onClick={() => setSelectedAsset(asset)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{asset.model}</h3>
                  <p className="text-sm text-muted-foreground">{asset.oem}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{asset.asset_id}</p>
                </div>
                {getEventTypeBadge(asset.event_type)}
              </div>

              <div className="mb-4 flex items-center justify-center bg-secondary/20 rounded-lg p-4">
                <img 
                  src={getMachineImage(asset.model)} 
                  alt={`${asset.oem} ${asset.model}`}
                  className="w-full h-32 object-contain"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-info" />
                  <span className="text-sm">{asset.engine_hours.toFixed(1)}h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-chart-3" />
                  <span className="text-sm">{asset.fuel_level_pct.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  <span className="text-sm">{asset.speed_kmh.toFixed(1)} km/h</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {selectedAsset && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Dados Detalhados
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Horas de Motor</p>
                    <p className="text-2xl font-bold text-info">{selectedAsset.engine_hours.toFixed(2)}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Combustível</p>
                    <p className="text-2xl font-bold text-chart-3">{selectedAsset.fuel_level_pct.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Velocidade</p>
                    <p className="text-2xl font-bold text-primary">{selectedAsset.speed_kmh.toFixed(1)} km/h</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Odômetro</p>
                    <p className="text-2xl font-bold">{selectedAsset.odometer_km.toLocaleString()} km</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Direção</p>
                  <p className="text-lg font-semibold">{selectedAsset.heading_deg}°</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Localização GPS</p>
                  </div>
                  <div className="font-mono text-sm space-y-1">
                    <p>Lat: {selectedAsset.location.lat.toFixed(6)}</p>
                    <p>Lon: {selectedAsset.location.lon.toFixed(6)}</p>
                    <p className="text-xs text-muted-foreground">
                      Precisão: {selectedAsset.location.accuracy_m}m
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Schema AEMP 2.0
              </h2>
              
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <pre className="text-xs font-mono overflow-x-auto">
                  {JSON.stringify(selectedAsset, null, 2)}
                </pre>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span>Live</span>
                </div>
                <div>Fonte: {selectedAsset.source}</div>
                <div>Ingerido: {new Date(selectedAsset.ingested_at).toLocaleTimeString()}</div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
