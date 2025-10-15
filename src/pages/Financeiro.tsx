import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { Download, TrendingUp, DollarSign, PieChart } from "lucide-react";

const Financeiro = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Módulo Financeiro</h1>
          <p className="text-muted-foreground">
            Gestão de indicadores financeiros e relatórios oficiais
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Receita Operacional</p>
            <p className="text-3xl font-bold">R$ 2,4M</p>
            <p className="text-sm text-success mt-2">+12% vs mês anterior</p>
          </Card>

          <Card className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">VPL (Valor Presente Líquido)</p>
            <p className="text-3xl font-bold">R$ 3,8M</p>
            <p className="text-sm text-muted-foreground mt-2">Taxa: 8,5% a.a.</p>
          </Card>

          <Card className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <PieChart className="w-6 h-6 text-warning" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">ROI</p>
            <p className="text-3xl font-bold">24,5%</p>
            <p className="text-sm text-muted-foreground mt-2">Retorno sobre investimento</p>
          </Card>

          <Card className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-info" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Taxa de Utilização</p>
            <p className="text-3xl font-bold">87%</p>
            <p className="text-sm text-success mt-2">Acima da meta (75%)</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Indicadores RO/VPL</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Operacional (RO)</p>
                  <p className="text-2xl font-bold mt-1">R$ 2.450.000</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-success">+12,3%</p>
                  <p className="text-xs text-muted-foreground">vs trimestre anterior</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Presente Líquido (VPL)</p>
                  <p className="text-2xl font-bold mt-1">R$ 3.820.000</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-success">+8,7%</p>
                  <p className="text-xs text-muted-foreground">Projeção 12 meses</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <div>
                  <p className="text-sm text-muted-foreground">TIR (Taxa Interna de Retorno)</p>
                  <p className="text-2xl font-bold mt-1">18,5%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-success">Acima do mercado</p>
                  <p className="text-xs text-muted-foreground">Benchmark: 12%</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Relatórios Oficiais</h2>
            <p className="text-muted-foreground mb-6">
              Exporte relatórios financeiros e demonstrativos para órgãos reguladores
            </p>

            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between h-auto p-4">
                <div className="text-left">
                  <p className="font-semibold">Demonstrativo de Resultados</p>
                  <p className="text-sm text-muted-foreground">DRE - Trimestral 2024</p>
                </div>
                <Download className="w-5 h-5" />
              </Button>

              <Button variant="outline" className="w-full justify-between h-auto p-4">
                <div className="text-left">
                  <p className="font-semibold">Balanço Patrimonial</p>
                  <p className="text-sm text-muted-foreground">BP - Anual 2024</p>
                </div>
                <Download className="w-5 h-5" />
              </Button>

              <Button variant="outline" className="w-full justify-between h-auto p-4">
                <div className="text-left">
                  <p className="font-semibold">Fluxo de Caixa</p>
                  <p className="text-sm text-muted-foreground">FCx - Mensal</p>
                </div>
                <Download className="w-5 h-5" />
              </Button>

              <Button variant="outline" className="w-full justify-between h-auto p-4">
                <div className="text-left">
                  <p className="font-semibold">Relatório ESG Completo</p>
                  <p className="text-sm text-muted-foreground">Compliance SX000i</p>
                </div>
                <Download className="w-5 h-5" />
              </Button>
            </div>

            <Button className="w-full mt-6 gap-2">
              <Download className="w-4 h-4" />
              Exportar todos os relatórios
            </Button>
          </Card>
        </div>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Conformidade Regulatória</h2>
              <p className="text-muted-foreground">
                Status de compliance com normas SX000i e regulamentação nacional
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-success">98%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground mb-2">Norma SX000i</p>
              <p className="text-xl font-bold text-success">Conforme</p>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground mb-2">Auditoria Pública</p>
              <p className="text-xl font-bold text-success">Aprovado</p>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground mb-2">Certificação ESG</p>
              <p className="text-xl font-bold text-primary">Em andamento</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Financeiro;
