import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/components/Logo";
import brazilMap from "@/assets/brazil-map.png";
import { ArrowRight, Shield, TrendingUp, Zap, Database, Globe2, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-lg fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link to="/dashboard">
                <Button>Acessar Plataforma</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Norma SX000i Compliant</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transformar<br />
                <span className="text-primary">máquinas</span> em dados.
              </h1>
              
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Transformar<br />
                dados em <span className="text-primary">soberania</span>.
              </h2>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                A primeira infraestrutura digital soberana para gestão integrada de máquinas, 
                ativos e dados do setor de infraestrutura, energia e agronegócio do Brasil.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="gap-2 text-base px-8 h-12">
                    Acessar Plataforma
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-base px-8 h-12">
                  Saiba mais
                </Button>
              </div>
            </div>
            
            <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              <img 
                src={brazilMap} 
                alt="Mapa do Brasil conectado" 
                className="relative w-full h-auto glow-blue"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Plataforma Integrada</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta para gestão completa do ciclo de vida dos seus ativos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass-card p-8 hover:glow-blue transition-all duration-300 animate-fade-in">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Database className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Dashboard de Ativos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitoramento em tempo real com telemetria IoT, status operacional e indicadores de performance.
              </p>
            </Card>

            <Card className="glass-card p-8 hover:glow-blue transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mb-6">
                <Globe2 className="w-7 h-7 text-success" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Marketplace Nacional</h3>
              <p className="text-muted-foreground leading-relaxed">
                Conecte locadores e locatários em um ecossistema seguro com análise de crédito produtivo integrada.
              </p>
            </Card>

            <Card className="glass-card p-8 hover:glow-blue transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-warning" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Módulo Financeiro</h3>
              <p className="text-muted-foreground leading-relaxed">
                Indicadores RO/VPL, relatórios oficiais e conformidade regulatória automatizada.
              </p>
            </Card>

            <Card className="glass-card p-8 hover:glow-blue transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="w-14 h-14 rounded-xl bg-info/10 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-info" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Relatórios ESG</h3>
              <p className="text-muted-foreground leading-relaxed">
                Certificação de sustentabilidade, eficiência energética e emissões com padrão internacional.
              </p>
            </Card>

            <Card className="glass-card p-8 hover:glow-blue transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Soberania Digital</h3>
              <p className="text-muted-foreground leading-relaxed">
                Infraestrutura nacional com governança de dados baseada em normas internacionais SX000i.
              </p>
            </Card>

            <Card className="glass-card p-8 hover:glow-blue transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7 text-success" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Governança Integrada</h3>
              <p className="text-muted-foreground leading-relaxed">
                Conecte ministérios, agências públicas e instituições financeiras em um ecossistema confiável.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center animate-fade-in">
              <p className="text-5xl font-bold text-primary mb-2">2025-2035</p>
              <p className="text-muted-foreground">Plano Decenal</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <p className="text-5xl font-bold text-primary mb-2">100%</p>
              <p className="text-muted-foreground">Soberania Digital</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <p className="text-5xl font-bold text-primary mb-2">SX000i</p>
              <p className="text-muted-foreground">Compliance Internacional</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <p className="text-5xl font-bold text-primary mb-2">IoT</p>
              <p className="text-muted-foreground">Telemetria em Tempo Real</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <Card className="glass-card p-12 text-center max-w-4xl mx-auto glow-blue">
            <h2 className="text-4xl font-bold mb-4">
              Pronto para transformar seus ativos?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se à revolução da infraestrutura digital brasileira
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2 text-base px-8 h-12">
                  Começar agora
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base px-8 h-12">
                Agendar demonstração
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo />
            <p className="text-sm text-muted-foreground">
              © 2025 INFRA BRASIL. Infraestrutura Digital Soberana.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
