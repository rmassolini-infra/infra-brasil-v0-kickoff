import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { 
  Loader2,
  Truck,
  Fuel,
  Clock,
  RefreshCw,
  MapPin,
  Gauge,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { caterpillarService, FleetSnapshot } from "@/services/caterpillarService";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [fleetData, setFleetData] = useState<FleetSnapshot | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  const loadFleetData = async () => {
    setLoading(true);
    try {
      const data = await caterpillarService.getFleetSnapshot(1);
      setFleetData(data);
      setLastUpdate(new Date());
    } catch (err) {
      toast({
        title: "Erro ao carregar dados",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleetData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadFleetData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate fleet statistics
  const assets = fleetData?.assets || [];
  const totalEquipment = assets.length;
  const totalHours = assets.reduce((sum, asset) => 
    sum + (asset.operating_hours || 0), 0);
  const avgFuel = totalEquipment > 0 
    ? assets.reduce((sum, asset) => sum + (asset.fuel_percent || 0), 0) / totalEquipment 
    : 0;
  const avgSpeed = totalEquipment > 0
    ? assets.reduce((sum, asset) => sum + (asset.engine_speed || 0), 0) / totalEquipment
    : 0;
  const equipmentWithLocation = assets.filter(
    asset => asset.latitude && asset.longitude
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dashboard Caterpillar
            </h1>
            <p className="text-muted-foreground">
              Monitoramento em tempo real da frota • API ISO 15143-3
            </p>
            {lastUpdate && (
              <p className="text-xs text-muted-foreground mt-1">
                Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </p>
            )}
          </div>
          
          <Button
            onClick={loadFleetData}
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </>
            )}
          </Button>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total de Equipamentos</p>
                <p className="text-3xl font-bold">{totalEquipment}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Equipamentos ativos na frota
            </p>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-info/10">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Horas Totais</p>
                <p className="text-3xl font-bold">{totalHours.toFixed(0)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Horas operadas acumuladas
            </p>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${avgFuel < 30 ? 'bg-warning/10' : 'bg-success/10'}`}>
                <Fuel className={`h-5 w-5 ${avgFuel < 30 ? 'text-warning' : 'text-success'}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Combustível Médio</p>
                <p className="text-3xl font-bold">{avgFuel.toFixed(1)}%</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Nível médio da frota
            </p>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Gauge className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Velocidade Média</p>
                <p className="text-3xl font-bold">{avgSpeed.toFixed(0)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              km/h em operação
            </p>
          </Card>
        </div>

        {/* Status de Localização */}
        <Card className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Status de Localização</h2>
            </div>
            <Badge variant={equipmentWithLocation === totalEquipment ? "success" : "warning"}>
              {equipmentWithLocation}/{totalEquipment} com GPS
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {equipmentWithLocation} equipamentos com dados de GPS disponíveis
          </p>
        </Card>

        {/* Lista de Equipamentos */}
        <Card className="glass-card p-6">
          <h2 className="text-2xl font-semibold mb-6">Equipamentos da Frota</h2>
          
          {loading && assets.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : assets.length > 0 ? (
            <div className="space-y-4">
              {assets.map((asset, index) => (
                <Card key={index} className="p-4 hover:ring-2 hover:ring-primary/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {asset.make} {asset.model || "N/A"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        S/N: {asset.serial_number || "N/A"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        ID: {asset.oem_asset_id || "N/A"}
                      </Badge>
                      {(asset.fuel_percent || 0) < 30 && (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Combustível Baixo
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Horas de Operação</p>
                      <p className="text-lg font-semibold">{(asset.operating_hours || 0).toFixed(1)}h</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Combustível</p>
                      <p className={`text-lg font-semibold ${(asset.fuel_percent || 0) < 30 ? 'text-warning' : ''}`}>
                        {(asset.fuel_percent || 0).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Velocidade</p>
                      <p className="text-lg font-semibold">{(asset.engine_speed || 0).toFixed(0)} km/h</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Localização</p>
                      <p className="text-sm font-mono">
                        {asset.latitude && asset.longitude ? 
                          `${asset.latitude.toFixed(4)}, ${asset.longitude.toFixed(4)}` 
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum equipamento encontrado na frota
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                A API está conectada, mas não há equipamentos cadastrados ainda.
              </p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
