import { Card } from "@/components/ui/card";
import tractorImage from "@/assets/tractor-render.png";

interface AssetCardProps {
  name: string;
  status: "active" | "stopped" | "maintenance";
  hours: number;
  efficiency: number;
  consumption: string;
}

const AssetCard = ({ name, status, hours, efficiency, consumption }: AssetCardProps) => {
  const statusConfig = {
    active: {
      label: "Ativa",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    stopped: {
      label: "Parado",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    maintenance: {
      label: "Manutenção",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  };

  const config = statusConfig[status];

  return (
    <Card className="glass-card p-6 hover:glow-blue transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{name}</h3>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor}`}>
            <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
          </div>
        </div>
        <img src={tractorImage} alt={name} className="w-20 h-20 object-contain" />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <p className="text-sm text-muted-foreground">Horas</p>
          <p className="text-xl font-semibold">{hours}h</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Eficiência</p>
          <p className="text-xl font-semibold">{efficiency}%</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Consumo</p>
          <p className="text-lg font-semibold">{consumption}</p>
        </div>
      </div>
    </Card>
  );
};

export default AssetCard;
