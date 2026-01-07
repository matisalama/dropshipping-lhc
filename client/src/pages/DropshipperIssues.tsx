import { useState } from "react";
import DropshipperLayout from "@/components/DropshipperLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  Filter,
} from "lucide-react";

// Mock data for issues
const MOCK_ISSUES = [
  {
    id: 1,
    orderId: 1001,
    customerName: "Juan García",
    issueType: "wrong_address",
    description: "El cliente reportó que la dirección es incorrecta",
    status: "open",
    priority: "high",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    messages: 3,
  },
  {
    id: 2,
    orderId: 1002,
    customerName: "María López",
    issueType: "product_complaint",
    description: "El producto llegó con defectos",
    status: "in_progress",
    priority: "high",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    messages: 5,
  },
  {
    id: 3,
    orderId: 1003,
    customerName: "Carlos Rodríguez",
    issueType: "delivery_delay",
    description: "El pedido se retrasó más de lo esperado",
    status: "resolved",
    priority: "medium",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    messages: 2,
  },
];

const ISSUE_TYPES: Record<string, { label: string; icon: any; color: string }> = {
  wrong_address: { label: "Dirección Incorrecta", icon: AlertCircle, color: "text-red-600" },
  product_complaint: { label: "Queja del Producto", icon: AlertCircle, color: "text-orange-600" },
  delivery_delay: { label: "Retraso en Entrega", icon: Clock, color: "text-yellow-600" },
  customer_complaint: { label: "Queja del Cliente", icon: AlertCircle, color: "text-red-600" },
  other: { label: "Otro", icon: MessageSquare, color: "text-gray-600" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: "Abierto", color: "bg-red-100 text-red-800", icon: AlertCircle },
  in_progress: { label: "En Progreso", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  resolved: { label: "Resuelto", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  closed: { label: "Cerrado", color: "bg-gray-100 text-gray-800", icon: CheckCircle2 },
};

export default function DropshipperIssues() {
  const [selectedIssue, setSelectedIssue] = useState<typeof MOCK_ISSUES[0] | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const filteredIssues = MOCK_ISSUES.filter((issue) => {
    if (filterStatus !== "all" && issue.status !== filterStatus) return false;
    if (filterPriority !== "all" && issue.priority !== filterPriority) return false;
    return true;
  });

  const stats = {
    open: MOCK_ISSUES.filter((i) => i.status === "open").length,
    inProgress: MOCK_ISSUES.filter((i) => i.status === "in_progress").length,
    resolved: MOCK_ISSUES.filter((i) => i.status === "resolved").length,
  };

  return (
    <DropshipperLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Problemas</h1>
          <p className="text-gray-600">Resuelve incidencias con tus pedidos</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.open}</div>
                <div className="text-sm text-muted-foreground">Abiertos</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <div className="text-sm text-muted-foreground">En Progreso</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.resolved}</div>
                <div className="text-sm text-muted-foreground">Resueltos</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los Estados</option>
              <option value="open">Abiertos</option>
              <option value="in_progress">En Progreso</option>
              <option value="resolved">Resueltos</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las Prioridades</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Reportar Problema
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reportar Nuevo Problema</DialogTitle>
                <DialogDescription>
                  Describe el problema que necesitas resolver
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orderId">Número de Pedido</Label>
                  <input
                    id="orderId"
                    type="text"
                    placeholder="Ej: 1001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="issueType">Tipo de Problema</Label>
                  <select
                    id="issueType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un tipo</option>
                    <option value="wrong_address">Dirección Incorrecta</option>
                    <option value="product_complaint">Queja del Producto</option>
                    <option value="delivery_delay">Retraso en Entrega</option>
                    <option value="customer_complaint">Queja del Cliente</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Cuéntanos qué pasó..."
                    rows={4}
                  />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Enviar Reporte
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => {
              const issueType = ISSUE_TYPES[issue.issueType as keyof typeof ISSUE_TYPES];
              const statusConfig = STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG];
              const IssueIcon = issueType?.icon || AlertCircle;
              const StatusIcon = statusConfig?.icon || AlertCircle;

              return (
                <Card
                  key={issue.id}
                  className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedIssue(issue)}
                >
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-12 gap-4 items-start">
                      {/* Issue Type */}
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2">
                          <IssueIcon className={`h-5 w-5 ${issueType?.color}`} />
                          <div>
                            <div className="text-sm font-semibold">{issueType?.label}</div>
                            <div className="text-xs text-muted-foreground">Pedido #{issue.orderId}</div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="md:col-span-4">
                        <div className="font-semibold text-sm mb-1">{issue.customerName}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {issue.description}
                        </div>
                      </div>

                      {/* Status and Priority */}
                      <div className="md:col-span-2">
                        <div className="flex gap-2 flex-wrap">
                          <Badge className={statusConfig?.color}>
                            {statusConfig?.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              issue.priority === "high"
                                ? "border-red-300 text-red-700"
                                : issue.priority === "medium"
                                ? "border-yellow-300 text-yellow-700"
                                : "border-green-300 text-green-700"
                            }
                          >
                            {issue.priority === "high"
                              ? "Alta"
                              : issue.priority === "medium"
                              ? "Media"
                              : "Baja"}
                          </Badge>
                        </div>
                      </div>

                      {/* Messages and Date */}
                      <div className="md:col-span-2">
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground mb-1">
                            <MessageSquare className="h-4 w-4" />
                            {issue.messages} mensajes
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {issue.createdAt.toLocaleDateString("es-PY")}
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="md:col-span-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIssue(issue);
                          }}
                        >
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="pt-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Sin problemas reportados</h3>
                <p className="text-muted-foreground">
                  ¡Excelente! No hay problemas pendientes en tus pedidos
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Issue Detail Modal */}
        {selectedIssue && (
          <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalles del Problema - Pedido #{selectedIssue.orderId}</DialogTitle>
                <DialogDescription>
                  Cliente: {selectedIssue.customerName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tipo de Problema</Label>
                    <div className="font-semibold">
                      {ISSUE_TYPES[selectedIssue.issueType as keyof typeof ISSUE_TYPES]?.label}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Estado</Label>
                    <div className="font-semibold">
                      {STATUS_CONFIG[selectedIssue.status as keyof typeof STATUS_CONFIG]?.label}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Descripción</Label>
                  <p className="text-sm">{selectedIssue.description}</p>
                </div>

                <div>
                  <Label htmlFor="resolution" className="text-xs text-muted-foreground">
                    Solución
                  </Label>
                  <Textarea
                    id="resolution"
                    placeholder="Describe cómo resolviste o planeas resolver este problema..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Guardar Solución
                  </Button>
                  <Button variant="outline">
                    Contactar Soporte
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DropshipperLayout>
  );
}
