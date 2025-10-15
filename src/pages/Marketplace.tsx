import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import tractorImage from "@/assets/tractor-render.png";
import { Search, MapPin, Star } from "lucide-react";

const Marketplace = () => {
  const rentals = [
    {
      name: "Trator New Holland T7",
      price: "R$ 450",
      rating: 4.5,
      location: "São Paulo, SP",
      distance: "60 km",
    },
    {
      name: "Escavadeira CAT 320",
      price: "R$ 680",
      rating: 4.8,
      location: "Campinas, SP",
      distance: "45 km",
    },
    {
      name: "Retroescavadeira JCB",
      price: "R$ 520",
      rating: 4.6,
      location: "Sorocaba, SP",
      distance: "75 km",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Encontre e alugue equipamentos de infraestrutura
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por equipamento, localização..."
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.map((rental, index) => (
            <Card key={index} className="glass-card overflow-hidden hover:glow-blue transition-all duration-300 animate-fade-in">
              <div className="aspect-video bg-secondary/50 flex items-center justify-center">
                <img src={tractorImage} alt={rental.name} className="w-2/3 h-2/3 object-contain" />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{rental.name}</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(rental.rating)
                            ? "fill-warning text-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{rental.rating}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{rental.location}</span>
                  <span>•</span>
                  <span>{rental.distance}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{rental.price}</p>
                    <p className="text-sm text-muted-foreground">por dia</p>
                  </div>
                  <Button>Locar</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="glass-card p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Análise de Crédito Produtivo</h2>
          <p className="text-muted-foreground mb-6">
            Utilize nosso simulador para análise de crédito e viabilidade de locação
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground mb-2">Simulação</p>
              <p className="text-3xl font-bold mb-1">1570</p>
              <p className="text-sm text-muted-foreground">por dia</p>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground mb-2">Valor total</p>
              <p className="text-3xl font-bold mb-1">R$ 1.350</p>
              <p className="text-sm text-success">Análise de crédito aprovada</p>
            </div>
          </div>

          <Button className="w-full mt-6">Gerar crédito produtivo</Button>
        </Card>
      </main>
    </div>
  );
};

export default Marketplace;
