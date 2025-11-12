import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { caterpillarService } from "@/services/caterpillarService";
import Navigation from "@/components/Navigation";

const CaterpillarIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [fleetData, setFleetData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setFleetData(null);

    try {
      const data = await caterpillarService.getFleetSnapshot(1);
      setFleetData(data);
      
      toast({
        title: "Conexão bem-sucedida!",
        description: "Dados da frota carregados com sucesso.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      
      toast({
        title: "Erro na conexão",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const equipmentCount = fleetData?.assets?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Integração Caterpillar
          </h1>
          <p className="text-muted-foreground">
            Teste e monitore a conexão com a API ISO15143 (AEMP 2.0)
          </p>
        </div>

        {/* Status da Conexão */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Status da Conexão</h2>
              <p className="text-sm text-muted-foreground">
                API Base: https://api.cat.com/telematics/iso15143
              </p>
            </div>
            
            <Button
              onClick={testConnection}
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Testar Conexão
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Erro de Conexão</p>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {fleetData && (
            <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-success">✅ Autenticação OAuth Bem-sucedida</p>
                <p className="text-sm text-success/80 mt-1">
                  Conectado à API Caterpillar • {equipmentCount} equipamento{equipmentCount !== 1 ? 's' : ''} encontrado{equipmentCount !== 1 ? 's' : ''}
                </p>
                {equipmentCount === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 A autenticação está funcionando corretamente. Nenhum equipamento cadastrado na frota ainda.
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Dados da Frota */}
        {fleetData && (
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Dados da Frota</h2>
            
            {equipmentCount > 0 ? (
              <div className="space-y-4">
                {fleetData.assets.map((asset: any, index: number) => (
                  <Card key={index} className="p-4 hover:ring-1 hover:ring-primary/50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {asset.make} {asset.model || "N/A"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          S/N: {asset.serial_number || "N/A"}
                        </p>
                      </div>
                      <Badge variant="outline">
                        ID: {asset.oem_asset_id || "N/A"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Horas de Operação</p>
                        <p className="text-lg font-semibold">{(asset.operating_hours || 0).toFixed(1)}h</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Combustível</p>
                        <p className="text-lg font-semibold">{(asset.fuel_percent || 0).toFixed(1)}%</p>
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
              <p className="text-muted-foreground text-center py-8">
                Nenhum equipamento encontrado na frota
              </p>
            )}
          </Card>
        )}

        {/* JSON Raw Data */}
        {fleetData && (
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Dados Brutos (JSON)</h2>
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
              {JSON.stringify(fleetData, null, 2)}
            </pre>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CaterpillarIntegration;
