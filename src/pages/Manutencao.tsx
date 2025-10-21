import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Wrench, Clock, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

type Severity = "critical" | "high" | "medium" | "low";

interface Fault {
  id: string;
  equipment: string;
  description: string;
  severity: Severity;
  status: "open" | "in_progress" | "resolved";
  timestamp: Date;
  assignedTo?: string;
}

const severityConfig = {
  critical: { label: "Crítico", color: "destructive" as const, icon: AlertTriangle },
  high: { label: "Alto", color: "warning" as const, icon: AlertTriangle },
  medium: { label: "Médio", color: "default" as const, icon: Wrench },
  low: { label: "Baixo", color: "secondary" as const, icon: CheckCircle2 },
};

const statusConfig = {
  open: { label: "Aberto", color: "destructive" as const },
  in_progress: { label: "Em Progresso", color: "warning" as const },
  resolved: { label: "Resolvido", color: "success" as const },
};

const generateMockFaults = (): Fault[] => [
  {
    id: "F001",
    equipment: "Trator John Deere 8R",
    description: "Falha no sistema hidráulico - vazamento detectado",
    severity: "critical",
    status: "in_progress",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    assignedTo: "João Silva",
  },
  {
    id: "F002",
    equipment: "Colheitadeira Case IH",
    description: "Sensor de umidade apresentando leituras inconsistentes",
    severity: "high",
    status: "open",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: "F003",
    equipment: "Pulverizador Jacto",
    description: "Manutenção preventiva - substituição de filtros",
    severity: "medium",
    status: "open",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    assignedTo: "Maria Santos",
  },
  {
    id: "F004",
    equipment: "Plantadeira Case",
    description: "Calibração necessária nos dosadores de sementes",
    severity: "medium",
    status: "in_progress",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    assignedTo: "Pedro Costa",
  },
  {
    id: "F005",
    equipment: "Trator New Holland",
    description: "Troca de óleo e filtros (manutenção programada)",
    severity: "low",
    status: "open",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    id: "F006",
    equipment: "Distribuidor de Fertilizantes",
    description: "Sistema de telemetria offline",
    severity: "high",
    status: "open",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "F007",
    equipment: "Colheitadeira John Deere S790",
    description: "Falha crítica no motor - superaquecimento",
    severity: "critical",
    status: "open",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "F008",
    equipment: "Trator Massey Ferguson",
    description: "Ajuste de tensão nas correias",
    severity: "low",
    status: "resolved",
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
    assignedTo: "Carlos Oliveira",
  },
];

const Manutencao = () => {
  const [faults, setFaults] = useState<Fault[]>(generateMockFaults());
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | "all">("all");

  useEffect(() => {
    const interval = setInterval(() => {
      setFaults(generateMockFaults());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredFaults = selectedSeverity === "all" 
    ? faults 
    : faults.filter(f => f.severity === selectedSeverity);

  const severityCounts = {
    critical: faults.filter(f => f.severity === "critical" && f.status !== "resolved").length,
    high: faults.filter(f => f.severity === "high" && f.status !== "resolved").length,
    medium: faults.filter(f => f.severity === "medium" && f.status !== "resolved").length,
    low: faults.filter(f => f.severity === "low" && f.status !== "resolved").length,
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diff < 60) return `${diff}min atrás`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
    return `${Math.floor(diff / 1440)}d atrás`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manutenção & Faults</h1>
          <p className="text-muted-foreground">
            Painel de monitoramento de falhas e manutenção por severidade
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {(Object.entries(severityConfig) as [Severity, typeof severityConfig[Severity]][]).map(([severity, config]) => {
            const Icon = config.icon;
            return (
              <Card key={severity} className="cursor-pointer transition-all hover:shadow-lg" onClick={() => setSelectedSeverity(severity)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{severityCounts[severity]}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Faults ativos
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Faults Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Faults e Manutenções</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os faults e tarefas de manutenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedSeverity} onValueChange={(v) => setSelectedSeverity(v as Severity | "all")}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todos ({faults.length})</TabsTrigger>
                <TabsTrigger value="critical">
                  Crítico ({severityCounts.critical})
                </TabsTrigger>
                <TabsTrigger value="high">
                  Alto ({severityCounts.high})
                </TabsTrigger>
                <TabsTrigger value="medium">
                  Médio ({severityCounts.medium})
                </TabsTrigger>
                <TabsTrigger value="low">
                  Baixo ({severityCounts.low})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedSeverity} className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Severidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Tempo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFaults.map((fault) => (
                        <TableRow key={fault.id}>
                          <TableCell className="font-medium">{fault.id}</TableCell>
                          <TableCell>{fault.equipment}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {fault.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant={severityConfig[fault.severity].color}>
                              {severityConfig[fault.severity].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig[fault.status].color}>
                              {statusConfig[fault.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {fault.assignedTo || (
                              <span className="text-muted-foreground">Não atribuído</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(fault.timestamp)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Manutencao;
