import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface AdapterStatusCardProps {
  oem: string;
  adapter: string;
  status: "healthy" | "warning" | "error" | "offline";
  messagesPerMin: number;
  latencyMs: number;
  successRate: number;
  lastSync: string;
}

const AdapterStatusCard = ({
  oem,
  adapter,
  status,
  messagesPerMin,
  latencyMs,
  successRate,
  lastSync,
}: AdapterStatusCardProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "healthy":
        return {
          icon: CheckCircle2,
          badge: "success" as const,
          label: "Operacional",
          color: "text-success",
        };
      case "warning":
        return {
          icon: AlertCircle,
          badge: "warning" as const,
          label: "Atenção",
          color: "text-warning",
        };
      case "error":
        return {
          icon: XCircle,
          badge: "destructive" as const,
          label: "Erro",
          color: "text-destructive",
        };
      case "offline":
        return {
          icon: XCircle,
          badge: "secondary" as const,
          label: "Offline",
          color: "text-muted-foreground",
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <Card className="glass-card p-6 hover:ring-1 hover:ring-primary/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{oem}</h3>
          <p className="text-sm text-muted-foreground">{adapter}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${config.color}`} />
          <Badge variant={config.badge as any}>{config.label}</Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Taxa de Ingestão</span>
          <span className="text-sm font-semibold">{messagesPerMin.toFixed(1)} msg/min</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Latência</span>
          <span className={`text-sm font-semibold ${latencyMs > 5000 ? 'text-warning' : 'text-success'}`}>
            {latencyMs.toFixed(0)}ms
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
          <span className={`text-sm font-semibold ${successRate < 95 ? 'text-warning' : 'text-success'}`}>
            {successRate.toFixed(1)}%
          </span>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Última sync: {lastSync}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdapterStatusCard;
