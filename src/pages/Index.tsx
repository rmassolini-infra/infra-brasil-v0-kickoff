import { Link } from "react-router-dom";
import { ArrowRight, Database, Shield, TrendingUp } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import brazilMap from "@/assets/brazil-map.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            INFRA BRASIL
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A primeira infraestrutura digital soberana para gestão integrada de máquinas, ativos e dados do setor de infraestrutura, energia e agronegócio do Brasil.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2">
                Acessar Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/diagnostics">
              <Button size="lg" variant="outline">
                Ver Diagnóstico
              </Button>
            </Link>
          </div>
        </section>

        {/* Image Section */}
        <section className="mb-16 flex justify-center">
          <img 
            src={brazilMap} 
            alt="Mapa do Brasil representando a cobertura nacional da infraestrutura digital"
            className="max-w-md w-full h-auto rounded-lg shadow-lg"
          />
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Database className="w-10 h-10 mb-4 text-primary" />
              <CardTitle>Gestão Integrada</CardTitle>
              <CardDescription>
                Transforme máquinas em dados. Centralize telemetria, ativos e operações em uma única plataforma nacional.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-10 h-10 mb-4 text-primary" />
              <CardTitle>Soberania Digital</CardTitle>
              <CardDescription>
                Controle total sobre seus dados estratégicos com infraestrutura 100% brasileira e segura.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-10 h-10 mb-4 text-primary" />
              <CardTitle>IoT & ESG</CardTitle>
              <CardDescription>
                Telemetria em tempo real, análise de performance e conformidade ESG para decisões inteligentes.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* Mission */}
        <section className="max-w-4xl mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Nossa Missão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Transformar dados em soberania. Construir a primeira plataforma nacional de gestão integrada de ativos 
                para infraestrutura, energia e agronegócio, oferecendo controle completo, segurança e inteligência 
                para as operações estratégicas do Brasil através da tecnologia SX000i e integração total com fabricantes 
                como Caterpillar, Komatsu e Volvo.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
