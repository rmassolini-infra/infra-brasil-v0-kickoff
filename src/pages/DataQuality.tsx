import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Clock, TrendingUp, AlertTriangle } from "lucide-react";

interface DQRule {
  id: string;
  name: string;
  description: string;
  status: "passing" | "failing" | "warning";
  passRate: number;
  violationCount: number;
  lastCheck: string;
  category: string;
}

interface MetricData {
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  successRate: number;
  totalMessages: number;
  failedMessages: number;
}

const DataQuality = () => {
  const [dqRules, setDqRules] = useState<DQRule[]>([
    {
      id: "dq-001",
      name: "Timestamp Validity",
      description: "Verifica se timestamps estão dentro do range aceitável",
      status: "passing",
      passRate: 99.8,
      violationCount: 23,
      lastCheck: new Date().toISOString(),
      category: "Temporal"
    },
    {
      id: "dq-002",
      name: "GPS Coordinate Range",
      description: "Valida se coordenadas GPS estão dentro dos limites do Brasil",
      status: "passing",
      passRate: 98.5,
      violationCount: 156,
      lastCheck: new Date().toISOString(),
      category: "Spatial"
    },
    {
      id: "dq-003",
      name: "Engine Hours Consistency",
      description: "Verifica se engine hours são monotonicamente crescentes",
      status: "warning",
      passRate: 94.2,
      violationCount: 892,
      lastCheck: new Date().toISOString(),
      category: "Business Logic"
    },
    {
      id: "dq-004",
      name: "Fuel Level Range",
      description: "Valida se nível de combustível está entre 0-100%",
      status: "passing",
      passRate: 99.9,
      violationCount: 12,
      lastCheck: new Date().toISOString(),
      category: "Range"
    },
    {
      id: "dq-005",
      name: "Speed Reasonability",
      description: "Verifica se velocidade está dentro de limites realistas",
      status: "failing",
      passRate: 87.3,
      violationCount: 2341,
      lastCheck: new Date().toISOString(),
      category: "Business Logic"
    },
    {
      id: "dq-006",
      name: "Required Fields Present",
      description: "Valida presença de campos obrigatórios AEMP",
      status: "passing",
      passRate: 99.2,
      violationCount: 78,
      lastCheck: new Date().toISOString(),
      category: "Schema"
    }
  ]);

  const [metrics, setMetrics] = useState<MetricData>({
    avgLatency: 145,
    p95Latency: 320,
    p99Latency: 580,
    successRate: 96.8,
    totalMessages: 1284567,
    failedMessages: 41106
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        avgLatency: prev.avgLatency + (Math.random() - 0.5) * 20,
        p95Latency: prev.p95Latency + (Math.random() - 0.5) * 40,
        p99Latency: prev.p99Latency + (Math.random() - 0.5) * 60,
        successRate: Math.min(100, Math.max(85, prev.successRate + (Math.random() - 0.5) * 0.5)),
        totalMessages: prev.totalMessages + Math.floor(Math.random() * 100),
        failedMessages: prev.failedMessages + Math.floor(Math.random() * 5)
      }));

      setDqRules(prev => prev.map(rule => ({
        ...rule,
        passRate: Math.min(100, Math.max(80, rule.passRate + (Math.random() - 0.5) * 0.3)),
        violationCount: rule.violationCount + Math.floor(Math.random() * 3),
        lastCheck: new Date().toISOString()
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passing":
        return <Badge variant="success" className="gap-1"><CheckCircle className="w-3 h-3" />Passing</Badge>;
      case "warning":
        return <Badge variant="warning" className="gap-1"><AlertTriangle className="w-3 h-3" />Warning</Badge>;
      case "failing":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" />Failing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (passRate: number) => {
    if (passRate >= 98) return "text-success";
    if (passRate >= 95) return "text-warning";
    return "text-destructive";
  };

  const failingRules = dqRules.filter(r => r.status === "failing").length;
  const warningRules = dqRules.filter(r => r.status === "warning").length;
  const passingRules = dqRules.filter(r => r.status === "passing").length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Monitor de Qualidade de Dados</h1>
            <p className="text-muted-foreground">
              Monitoramento em tempo real de regras DQ, latência e taxa de sucesso
            </p>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Latência Média</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgLatency.toFixed(0)}ms</div>
              <p className="text-xs text-muted-foreground mt-1">
                P95: {metrics.p95Latency.toFixed(0)}ms | P99: {metrics.p99Latency.toFixed(0)}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
              <Progress value={metrics.successRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.failedMessages.toLocaleString()} falhas de {metrics.totalMessages.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">DQ Rules Status</CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{passingRules}/{dqRules.length}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="success">{passingRules} OK</Badge>
                <Badge variant="warning">{warningRules} Warn</Badge>
                <Badge variant="destructive">{failingRules} Fail</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Violações</CardTitle>
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dqRules.reduce((sum, r) => sum + r.violationCount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Últimas 24 horas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {failingRules > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Alertas Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dqRules.filter(r => r.status === "failing").map(rule => (
                  <div key={rule.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div>
                      <p className="font-semibold">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">{rule.passRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">{rule.violationCount} violações</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* DQ Rules Table */}
        <Card>
          <CardHeader>
            <CardTitle>Regras de Qualidade de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dqRules.map(rule => (
                <div key={rule.id} className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{rule.name}</h3>
                        {getStatusBadge(rule.status)}
                        <Badge variant="outline">{rule.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`text-2xl font-bold ${getStatusColor(rule.passRate)}`}>
                        {rule.passRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">pass rate</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={rule.passRate} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{rule.violationCount.toLocaleString()} violações</span>
                      <span>Última verificação: {new Date(rule.lastCheck).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Latency Details */}
        <Card>
          <CardHeader>
            <CardTitle>Análise de Latência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Média (avg)</p>
                  <p className="text-2xl font-bold">{metrics.avgLatency.toFixed(0)}ms</p>
                  <Progress value={Math.min(100, (metrics.avgLatency / 500) * 100)} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">P95 (95th percentile)</p>
                  <p className="text-2xl font-bold">{metrics.p95Latency.toFixed(0)}ms</p>
                  <Progress value={Math.min(100, (metrics.p95Latency / 500) * 100)} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">P99 (99th percentile)</p>
                  <p className="text-2xl font-bold">{metrics.p99Latency.toFixed(0)}ms</p>
                  <Progress value={Math.min(100, (metrics.p99Latency / 500) * 100)} />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>SLA Target: &lt; 500ms para P95 | Status: </span>
                  {metrics.p95Latency < 500 ? (
                    <Badge variant="success">Dentro do SLA</Badge>
                  ) : (
                    <Badge variant="destructive">Fora do SLA</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DataQuality;
