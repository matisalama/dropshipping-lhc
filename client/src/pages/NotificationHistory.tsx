import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  ArrowLeft
} from "lucide-react";
import { useLocation } from "wouter";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  sent: { label: 'Enviado', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  bounced: { label: 'Rechazado', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
};

const RECIPIENT_CONFIG: Record<string, string> = {
  customer: '👤 Cliente',
  dropshipper: '📦 Dropshipper',
  company: '🏢 Empresa',
};

export default function NotificationHistory() {
  const [, navigate] = useLocation();
  const { data: failedNotifications, isLoading, refetch } = trpc.notifications.getFailedNotifications.useQuery();
  const retryMutation = trpc.notifications.retryFailed.useMutation();

  const handleRetry = async (notificationId: number) => {
    try {
      await retryMutation.mutateAsync({ notificationId });
      refetch();
    } catch (error) {
      console.error('Error retrying notification:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Cargando historial de notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Historial de Notificaciones</h1>
            <p className="text-muted-foreground">
              Gestiona el envío de correos de confirmación de pedidos
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Mail className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {failedNotifications?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Notificaciones Fallidas
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {failedNotifications?.filter(n => n.retryCount > 0).length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Con Reintentos
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {failedNotifications?.filter(n => n.retryCount <= 1).length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Primer Intento
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        {failedNotifications && failedNotifications.length > 0 ? (
          <div className="grid gap-4">
            {failedNotifications.map((notification) => {
              const statusConfig = STATUS_CONFIG[notification.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={notification.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-12 gap-4 items-start">
                      {/* Status */}
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-5 w-5" />
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleDateString('es-PY')}
                        </div>
                      </div>

                      {/* Recipient */}
                      <div className="md:col-span-3">
                        <div className="font-semibold text-sm mb-1">Destinatario</div>
                        <div className="text-sm">
                          {RECIPIENT_CONFIG[notification.recipientType] || notification.recipientType}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 break-all">
                          {notification.recipientEmail}
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="md:col-span-3">
                        <div className="font-semibold text-sm mb-1">Asunto</div>
                        <div className="text-sm line-clamp-2">
                          {notification.subject}
                        </div>
                      </div>

                      {/* Retry Count */}
                      <div className="md:col-span-2">
                        <div className="font-semibold text-sm mb-1">Reintentos</div>
                        <div className="text-sm">
                          {notification.retryCount} / 3
                        </div>
                      </div>

                      {/* Action */}
                      <div className="md:col-span-2 text-right">
                        {notification.retryCount < 3 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetry(notification.id)}
                            disabled={retryMutation.isPending}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reintentar
                          </Button>
                        )}
                        {notification.retryCount >= 3 && (
                          <Badge variant="secondary">Máx. reintentos</Badge>
                        )}
                      </div>
                    </div>

                    {/* Failure Reason */}
                    {notification.failureReason && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Razón del error:</span>
                          <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded mt-2 text-xs font-mono break-all">
                            {notification.failureReason}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sent At */}
                    {notification.sentAt && (
                      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                        Enviado: {new Date(notification.sentAt).toLocaleString('es-PY')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 text-center">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Sin notificaciones fallidas</h3>
              <p className="text-muted-foreground">
                Todos los correos se han enviado exitosamente
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
