import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { caterpillarService } from "@/services/caterpillarService";
import { toast } from "sonner";

export default function Diagnostics() {
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const result = await caterpillarService.runDiagnostics(6);
      setDiagnostics(result);
      
      if (result.status === 'ok') {
        toast.success(`Diagnóstico concluído: ${result.assets.count} ativos encontrados`);
      } else {
        toast.warning("Diagnóstico concluído com avisos");
      }
    } catch (error) {
      console.error('Diagnostic error:', error);
      toast.error("Erro ao executar diagnóstico");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'no_assets':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Diagnóstico da API Caterpillar</h1>
          <p className="text-muted-foreground">
            Valide a conexão e os entitlements da API VisionLink/ISO 15143-3
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Executar Diagnóstico</CardTitle>
            <CardDescription>
              Testa múltiplos endpoints e verifica a disponibilidade de ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runDiagnostics} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executando...
                </>
              ) : (
                "Executar Diagnóstico"
              )}
            </Button>
          </CardContent>
        </Card>

        {diagnostics && (
          <div className="space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getStatusIcon(diagnostics.status)}
                  <div>
                    <CardTitle>Status Geral</CardTitle>
                    <CardDescription>
                      {new Date(diagnostics.timestamp).toLocaleString('pt-BR')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-2xl font-bold capitalize">{diagnostics.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ativos Encontrados</p>
                    <p className="text-2xl font-bold">{diagnostics.assets.count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Janela de Tempo</p>
                    <p className="text-2xl font-bold">{diagnostics.hours_window}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endpoints Tested */}
            <Card>
              <CardHeader>
                <CardTitle>Endpoints Testados</CardTitle>
                <CardDescription>
                  {diagnostics.assets.path 
                    ? `Endpoint ativo: ${diagnostics.assets.path}`
                    : "Nenhum endpoint retornou dados"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {diagnostics.endpoints_tested.map((endpoint: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <code className="text-sm">{endpoint.path}</code>
                      <div className="flex items-center gap-2">
                        {endpoint.items_found > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {endpoint.items_found} items
                          </span>
                        )}
                        {getStatusBadge(endpoint.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sample Asset */}
            {diagnostics.assets.sample && (
              <Card>
                <CardHeader>
                  <CardTitle>Exemplo de Ativo</CardTitle>
                  <CardDescription>
                    Primeiro ativo retornado pela API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(diagnostics.assets.sample, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {diagnostics.recommendations.length > 0 && (
              <Card className="border-yellow-500">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <CardTitle>Recomendações</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {diagnostics.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-yellow-500">•</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Raw JSON */}
            <Card>
              <CardHeader>
                <CardTitle>Resultado Completo (JSON)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(diagnostics, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
