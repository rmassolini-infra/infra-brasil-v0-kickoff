import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import AdapterStatusCard from "@/components/AdapterStatusCard";
import { 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Server,
  Clock
} from "lucide-react";

interface SystemMetrics {
  totalMessages: number;
  avgLatency: number;
  systemUptime: number;
  activeAdapters: number;
  errorRate: number;
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalMessages: 1847,
    avgLatency: 234,
    systemUptime: 99.8,
    activeAdapters: 4,
    errorRate: 0.2,
  });

  const [adapters, setAdapters] = useState([
    {
      oem: "Komatsu",
      adapter: "Komtrax v2.1",
      status: "healthy" as const,
      messagesPerMin: 45.3,
      latencyMs: 187,
      successRate: 99.2,
      lastSync: "há 2s",
    },
    {
      oem: "Caterpillar",
      adapter: "VisionLink API",
      status: "healthy" as const,
      messagesPerMin: 38.7,
      latencyMs: 243,
      successRate: 98.8,
      lastSync: "há 3s",
    },
    {
      oem: "Volvo",
      adapter: "CareTrack v3.0",
      status: "warning" as const,
      messagesPerMin: 22.1,
      latencyMs: 4823,
      successRate: 94.3,
      lastSync: "há 8s",
    },
    {
      oem: "John Deere",
      adapter: "JDLink",
      status: "healthy" as const,
      messagesPerMin: 31.4,
      latencyMs: 312,
      successRate: 99.5,
      lastSync: "há 1s",
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAdapters((prev) =>
        prev.map((adapter) => ({
          ...adapter,
          messagesPerMin: Math.max(0, adapter.messagesPerMin + (Math.random() - 0.5) * 5),
          latencyMs: Math.max(50, adapter.latencyMs + (Math.random() - 0.5) * 100),
          successRate: Math.min(100, Math.max(90, adapter.successRate + (Math.random() - 0.5) * 0.5)),
        }))
      );

      setMetrics((prev) => ({
        ...prev,
        totalMessages: prev.totalMessages + Math.floor(Math.random() * 20),
        avgLatency: Math.max(100, prev.avgLatency + (Math.random() - 0.5) * 50),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const healthyAdapters = adapters.filter((a) => a.status === "healthy").length;
  const warningAdapters = adapters.filter((a) => a.status === "warning").length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Técnico</h1>
          <p className="text-muted-foreground">
            Monitoramento de Adapters OEM • ISO 15143-3 (AEMP 2.0)
          </p>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Mensagens</p>
                <p className="text-2xl font-bold">{metrics.totalMessages.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-success" />
              <span>+12% vs hora anterior</span>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-info/10">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Latência Média</p>
                <p className="text-2xl font-bold">{metrics.avgLatency.toFixed(0)}ms</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="h-3 w-3" />
              <span>Dentro do SLA</span>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <Server className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{metrics.systemUptime}%</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>30 dias rolling</span>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Adapters Ativos</p>
                <p className="text-2xl font-bold">{healthyAdapters}/{metrics.activeAdapters}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Operacionais</span>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${metrics.errorRate > 1 ? 'bg-destructive/10' : 'bg-warning/10'}`}>
                <AlertTriangle className={`h-5 w-5 ${metrics.errorRate > 1 ? 'text-destructive' : 'text-warning'}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Taxa de Erro</p>
                <p className="text-2xl font-bold">{metrics.errorRate}%</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Últimas 24h</span>
            </div>
          </Card>
        </div>

        {/* Alerts */}
        {warningAdapters > 0 && (
          <Card className="glass-card p-4 mb-8 border-warning/50 bg-warning/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-semibold text-warning">Atenção</p>
                <p className="text-sm text-muted-foreground">
                  {warningAdapters} adapter(s) com latência elevada ou taxa de sucesso abaixo de 95%
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* OEM Adapters Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Status dos Adapters OEM</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adapters.map((adapter, index) => (
              <AdapterStatusCard key={index} {...adapter} />
            ))}
          </div>
        </div>

        {/* Data Quality Metrics */}
        <Card className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Qualidade de Dados (DQ Rules)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completude</span>
                <Badge variant="success">98.7%</Badge>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-success" style={{ width: "98.7%" }} />
              </div>
              <p className="text-xs text-muted-foreground">Campos obrigatórios presentes</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Validade</span>
                <Badge variant="success">99.4%</Badge>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-success" style={{ width: "99.4%" }} />
              </div>
              <p className="text-xs text-muted-foreground">Valores dentro dos limites</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Frescor</span>
                <Badge variant="success">97.2%</Badge>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-success" style={{ width: "97.2%" }} />
              </div>
              <p className="text-xs text-muted-foreground">Dados &lt; 5min</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deduplicação</span>
                <Badge variant="success">99.8%</Badge>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-success" style={{ width: "99.8%" }} />
              </div>
              <p className="text-xs text-muted-foreground">Registros únicos</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-1">Schema Registry</p>
                <p className="text-xs text-muted-foreground">
                  AEMP 2.0 v1.0 • JSON Schema validado • 0 breaking changes
                </p>
              </div>
              <Badge variant="success">Compliant</Badge>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
