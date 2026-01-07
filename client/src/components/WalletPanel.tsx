import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Clock
} from "lucide-react";

export function WalletPanel() {
  const { data: wallet, isLoading } = trpc.wallet.getBalance.useQuery();
  const { data: transactions } = trpc.wallet.getTransactions.useQuery();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle>Cargando billetera...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale_commission':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowDownLeft className="h-4 w-4 text-red-600" />;
      case 'refund':
        return <ArrowDownLeft className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'sale_commission':
        return 'Comisión por venta';
      case 'withdrawal':
        return 'Retiro';
      case 'refund':
        return 'Reembolso';
      default:
        return 'Ajuste';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'outline', label: 'Pendiente' },
      completed: { variant: 'default', label: 'Completado' },
      failed: { variant: 'destructive', label: 'Fallido' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Saldo Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₲ {wallet?.balance ? parseFloat(wallet.balance).toLocaleString('es-PY') : '0'}
            </div>
            <p className="text-xs opacity-75 mt-2">Listo para retirar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Ganancias Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₲ {wallet?.totalEarnings ? parseFloat(wallet.totalEarnings).toLocaleString('es-PY') : '0'}
            </div>
            <p className="text-xs opacity-75 mt-2">Desde que te uniste</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Retirado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">
              ₲ {wallet?.totalWithdrawn ? parseFloat(wallet.totalWithdrawn).toLocaleString('es-PY') : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Total retirado</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
          <CardDescription>
            Últimas movimientos en tu billetera
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-full bg-muted">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {getTransactionLabel(transaction.type)}
                      </div>
                      {transaction.description && (
                        <div className="text-sm text-muted-foreground">
                          {transaction.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(transaction.createdAt).toLocaleDateString('es-PY')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${
                      transaction.type === 'sale_commission' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'sale_commission' ? '+' : '-'}
                      ₲ {parseFloat(transaction.amount).toLocaleString('es-PY')}
                    </div>
                    <div className="mt-1">
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                No hay transacciones aún. ¡Comienza a vender para ganar comisiones!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
