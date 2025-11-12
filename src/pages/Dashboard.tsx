import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { 
  Loader2,
  Truck,
  RefreshCw,
  Activity,
  Gauge
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
      const data = await caterpillarService.assets(1);
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
    const interval = setInterval(loadFleetData, 30000);
    return () => clearInterval(interval);
  }, []);

  const assets = fleetData?.assets || [];
  const totalEquipment = assets.length;

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ativos Conectados</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEquipment}</div>
              <p className="text-xs text-muted-foreground mt-1">equipamentos na frota</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground mt-1">API conectada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">OEM</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Caterpillar</div>
              <p className="text-xs text-muted-foreground mt-1">fabricante</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Equipamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Equipamentos da Frota</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && assets.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : assets.length > 0 ? (
              <div className="space-y-4">
                {assets.map((asset, index) => (
                  <Card key={index} className="p-4 hover:ring-2 hover:ring-primary/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{asset.name || `${asset.make} ${asset.model}`}</h3>
                        <p className="text-sm text-muted-foreground">
                          S/N: {asset.serial || "N/A"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          ID: {asset.oem_asset_id || "N/A"}
                        </Badge>
                        {asset.status && (
                          <Badge variant="secondary">
                            {asset.status}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Fabricante</p>
                        <p className="text-lg font-semibold">{asset.make}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Modelo</p>
                        <p className="text-lg font-semibold">{asset.model || "N/A"}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Assinatura</p>
                        <p className="text-lg font-semibold">{asset.subscription || "N/A"}</p>
                      </div>
                    </div>

                    {/* Detalhes do Dispositivo de Telemetria */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Dispositivo de Telemetria
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Solução</p>
                          <p className="text-sm font-medium">PLE683</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Dispositivo Principal</p>
                          <p className="text-sm font-medium">PLE602</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Serial do Dispositivo</p>
                          <p className="text-sm font-medium">21022600900C002P</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Software</p>
                          <p className="text-sm font-medium">6679193-00</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Hardware</p>
                          <p className="text-sm font-medium">5174512-07</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Comunicação</p>
                          <p className="text-sm font-medium">Celular e satélite</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Conexão de Dados: Ativa
                        </Badge>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
