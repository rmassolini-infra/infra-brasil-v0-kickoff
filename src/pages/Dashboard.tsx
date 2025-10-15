import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import AssetCard from "@/components/AssetCard";
import { FileText } from "lucide-react";

const Dashboard = () => {
  const assets = [
    {
      name: "Retroescavadeira 001",
      status: "active" as const,
      hours: 340,
      efficiency: 96,
      consumption: "11 L/h",
    },
    {
      name: "Trator 002",
      status: "stopped" as const,
      hours: 120,
      efficiency: 80,
      consumption: "19,6 L/h",
    },
    {
      name: "Trator 003",
      status: "maintenance" as const,
      hours: 90,
      efficiency: 88,
      consumption: "15,2 L/h",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard de Ativos</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real dos seus equipamentos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {assets.map((asset, index) => (
            <AssetCard key={index} {...asset} />
          ))}
        </div>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Relatório ESG</h2>
              <p className="text-muted-foreground">
                Visualize indicadores de sustentabilidade e eficiência energética
              </p>
            </div>
            <Button className="gap-2">
              <FileText className="w-4 h-4" />
              Ver relatório ESG
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground mb-2">Uso Energético</p>
              <p className="text-3xl font-bold text-primary">75%</p>
              <p className="text-sm text-muted-foreground mt-1">Eficiência média</p>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground mb-2">Emissões CO₂</p>
              <p className="text-3xl font-bold text-success">-18%</p>
              <p className="text-sm text-muted-foreground mt-1">vs mês anterior</p>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground mb-2">Uptime</p>
              <p className="text-3xl font-bold">92%</p>
              <p className="text-sm text-muted-foreground mt-1">Disponibilidade</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
