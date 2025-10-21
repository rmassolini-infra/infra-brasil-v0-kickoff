import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code2, Server, Database, Zap, Activity, Store, CheckCircle, Wrench } from "lucide-react";
import { useState } from "react";

interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  category: string;
  requestExample?: string;
  responseExample: string;
  parameters?: Array<{ name: string; type: string; required: boolean; description: string }>;
  statusCodes: Array<{ code: number; description: string }>;
}

const apiEndpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/telemetry/devices",
    description: "Lista todos os dispositivos de telemetria conectados",
    category: "telemetry",
    responseExample: JSON.stringify({
      success: true,
      data: [
        {
          id: "dev_001",
          name: "Trator John Deere 8R",
          status: "online",
          lastUpdate: "2025-10-21T10:30:00Z",
          location: { lat: -23.5505, lng: -46.6333 }
        }
      ]
    }, null, 2),
    parameters: [
      { name: "status", type: "string", required: false, description: "Filtrar por status (online, offline)" },
      { name: "limit", type: "number", required: false, description: "Número de resultados por página" }
    ],
    statusCodes: [
      { code: 200, description: "Sucesso" },
      { code: 401, description: "Não autorizado" },
      { code: 500, description: "Erro interno do servidor" }
    ]
  },
  {
    method: "POST",
    path: "/api/telemetry/data",
    description: "Envia dados de telemetria de um dispositivo",
    category: "telemetry",
    requestExample: JSON.stringify({
      deviceId: "dev_001",
      timestamp: "2025-10-21T10:30:00Z",
      metrics: {
        engineTemp: 85.5,
        fuelLevel: 78.2,
        speed: 12.5,
        location: { lat: -23.5505, lng: -46.6333 }
      }
    }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      message: "Dados recebidos com sucesso",
      dataId: "data_12345"
    }, null, 2),
    statusCodes: [
      { code: 201, description: "Dados criados com sucesso" },
      { code: 400, description: "Requisição inválida" },
      { code: 401, description: "Não autorizado" }
    ]
  },
  {
    method: "GET",
    path: "/api/marketplace/adapters",
    description: "Lista todos os adaptadores disponíveis no marketplace",
    category: "marketplace",
    responseExample: JSON.stringify({
      success: true,
      data: [
        {
          id: "adapter_001",
          name: "John Deere Operations Center",
          provider: "John Deere",
          version: "2.1.0",
          status: "active",
          price: 299.99,
          features: ["Telemetria em tempo real", "Gestão de frotas", "Análise de dados"]
        }
      ]
    }, null, 2),
    parameters: [
      { name: "category", type: "string", required: false, description: "Filtrar por categoria" },
      { name: "provider", type: "string", required: false, description: "Filtrar por fornecedor" }
    ],
    statusCodes: [
      { code: 200, description: "Sucesso" },
      { code: 500, description: "Erro interno do servidor" }
    ]
  },
  {
    method: "POST",
    path: "/api/marketplace/purchase",
    description: "Realiza a compra de um adaptador",
    category: "marketplace",
    requestExample: JSON.stringify({
      adapterId: "adapter_001",
      licenseType: "monthly",
      paymentMethod: {
        type: "credit_card",
        token: "tok_visa_1234"
      }
    }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      message: "Compra realizada com sucesso",
      purchase: {
        id: "pur_12345",
        adapterId: "adapter_001",
        status: "completed",
        activationKey: "KEY-XXXX-XXXX-XXXX"
      }
    }, null, 2),
    statusCodes: [
      { code: 201, description: "Compra realizada com sucesso" },
      { code: 400, description: "Dados de pagamento inválidos" },
      { code: 402, description: "Pagamento necessário" }
    ]
  },
  {
    method: "GET",
    path: "/api/data-quality/rules",
    description: "Retorna todas as regras de qualidade de dados",
    category: "quality",
    responseExample: JSON.stringify({
      success: true,
      data: [
        {
          id: "rule_001",
          name: "Validação de Coordenadas GPS",
          description: "Verifica se coordenadas estão dentro do Brasil",
          status: "passing",
          lastCheck: "2025-10-21T10:25:00Z",
          passRate: 98.5
        }
      ]
    }, null, 2),
    statusCodes: [
      { code: 200, description: "Sucesso" },
      { code: 401, description: "Não autorizado" }
    ]
  },
  {
    method: "POST",
    path: "/api/maintenance/fault",
    description: "Registra uma nova falha ou necessidade de manutenção",
    category: "maintenance",
    requestExample: JSON.stringify({
      equipmentId: "dev_001",
      severity: "critical",
      description: "Falha no sistema hidráulico - vazamento detectado",
      assignedTo: "João Silva"
    }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      message: "Falha registrada com sucesso",
      fault: {
        id: "F001",
        status: "open",
        createdAt: "2025-10-21T10:30:00Z"
      }
    }, null, 2),
    statusCodes: [
      { code: 201, description: "Falha registrada com sucesso" },
      { code: 400, description: "Dados inválidos" },
      { code: 401, description: "Não autorizado" }
    ]
  }
];

const methodColors = {
  GET: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  POST: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  PUT: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  DELETE: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  PATCH: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
};

const categoryIcons = {
  telemetry: Activity,
  marketplace: Store,
  quality: CheckCircle,
  maintenance: Wrench
};

const categoryLabels = {
  telemetry: "Telemetria",
  marketplace: "Marketplace",
  quality: "Qualidade de Dados",
  maintenance: "Manutenção"
};

const ApiDocs = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredEndpoints = selectedCategory === "all" 
    ? apiEndpoints 
    : apiEndpoints.filter(e => e.category === selectedCategory);

  const categories = Array.from(new Set(apiEndpoints.map(e => e.category)));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Documentação da API</h1>
          </div>
          <p className="text-muted-foreground">
            Referência completa da API com exemplos de payload e endpoints interativos
          </p>
        </div>

        {/* API Base URL */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              URL Base da API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md font-mono text-sm">
              <code>https://api.plataforma-agro.com.br/v1</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard("https://api.plataforma-agro.com.br/v1", "base-url")}
              >
                {copiedCode === "base-url" ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Todas as requisições devem incluir o header de autenticação:{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded">Authorization: Bearer YOUR_API_KEY</code>
            </p>
          </CardContent>
        </Card>

        {/* Category Filters */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">
              Todos ({apiEndpoints.length})
            </TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {categoryLabels[category as keyof typeof categoryLabels]} (
                {apiEndpoints.filter(e => e.category === category).length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6 space-y-6">
            {filteredEndpoints.map((endpoint, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={methodColors[endpoint.method]}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono">{endpoint.path}</code>
                      </div>
                      <CardDescription>{endpoint.description}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {categoryLabels[endpoint.category as keyof typeof categoryLabels]}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Parameters */}
                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Parâmetros
                      </h4>
                      <div className="space-y-2">
                        {endpoint.parameters.map((param, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
                            <code className="text-sm font-mono text-primary">{param.name}</code>
                            <Badge variant={param.required ? "default" : "secondary"} className="text-xs">
                              {param.type}
                            </Badge>
                            {param.required && (
                              <Badge variant="destructive" className="text-xs">
                                obrigatório
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground flex-1">
                              {param.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Example */}
                  {endpoint.requestExample && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Exemplo de Request
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(endpoint.requestExample!, `req-${index}`)}
                        >
                          {copiedCode === `req-${index}` ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="p-4 bg-muted rounded-md overflow-x-auto">
                        <code className="text-sm">{endpoint.requestExample}</code>
                      </pre>
                    </div>
                  )}

                  {/* Response Example */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Code2 className="h-4 w-4" />
                        Exemplo de Response
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.responseExample, `res-${index}`)}
                      >
                        {copiedCode === `res-${index}` ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <pre className="p-4 bg-muted rounded-md overflow-x-auto">
                      <code className="text-sm">{endpoint.responseExample}</code>
                    </pre>
                  </div>

                  {/* Status Codes */}
                  <div>
                    <h4 className="font-semibold mb-3">Códigos de Status HTTP</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {endpoint.statusCodes.map((status, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <Badge variant={status.code < 300 ? "success" : status.code < 400 ? "default" : "destructive"}>
                            {status.code}
                          </Badge>
                          <span className="text-sm">{status.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ApiDocs;
