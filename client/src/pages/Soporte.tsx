import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Headphones,
  MessageSquare,
  HelpCircle,
  Clock,
  CheckCircle2,
  Send
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Soporte() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    message: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const { data: faqs } = trpc.support.listFaqs.useQuery();
  const { data: myTickets } = trpc.support.listTickets.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createTicket = trpc.support.createTicket.useMutation({
    onSuccess: () => {
      utils.support.listTickets.invalidate();
      setTicketForm({ subject: "", message: "", priority: "medium" });
      toast.success("Ticket creado exitosamente. Te responderemos pronto.");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    createTicket.mutate(ticketForm);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      open: { variant: "default", label: "Abierto" },
      in_progress: { variant: "secondary", label: "En Progreso" },
      resolved: { variant: "outline", label: "Resuelto" },
      closed: { variant: "outline", label: "Cerrado" },
    };
    const config = variants[status] || variants.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-500/10 text-blue-700",
      medium: "bg-yellow-500/10 text-yellow-700",
      high: "bg-red-500/10 text-red-700",
    };
    const labels: Record<string, string> = {
      low: "Baja",
      medium: "Media",
      high: "Alta",
    };
    return (
      <Badge className={colors[priority] || colors.medium}>
        {labels[priority] || "Media"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold">La Hora de las Compras</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'}>
                  <Button variant="ghost">Panel de Control</Button>
                </Link>
                <Link href="/recursos">
                  <Button variant="ghost">Recursos</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Iniciar Sesión</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="container py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Headphones className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold">
            Centro de Soporte
          </h1>
          <p className="text-xl text-muted-foreground">
            Estamos aquí para ayudarte. Encuentra respuestas rápidas en nuestras FAQs 
            o contáctanos directamente
          </p>
        </div>

        {/* Support Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Respuesta Rápida</CardTitle>
              <CardDescription>
                Tiempo promedio de respuesta: menos de 2 horas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Soporte Personalizado</CardTitle>
              <CardDescription>
                Asistencia dedicada para cada dropshipper
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Disponibilidad 24/7</CardTitle>
              <CardDescription>
                Crea tickets en cualquier momento del día
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Preguntas Frecuentes</h2>
            </div>

            <Card>
              <CardContent className="pt-6">
                {faqs && faqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, idx) => (
                      <AccordionItem key={faq.id} value={`item-${idx}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No hay preguntas frecuentes disponibles por el momento
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Common Topics */}
            <Card>
              <CardHeader>
                <CardTitle>Temas Comunes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
                  <div className="font-medium">¿Cómo empiezo a vender?</div>
                  <div className="text-sm text-muted-foreground">
                    Guía completa para nuevos dropshippers
                  </div>
                </div>
                <div className="p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
                  <div className="font-medium">Gestión de pedidos y entregas</div>
                  <div className="text-sm text-muted-foreground">
                    Cómo funciona el proceso de entrega
                  </div>
                </div>
                <div className="p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
                  <div className="font-medium">Precios y márgenes de ganancia</div>
                  <div className="text-sm text-muted-foreground">
                    Entiende cómo calcular tus ganancias
                  </div>
                </div>
                <div className="p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
                  <div className="font-medium">Recursos de marketing</div>
                  <div className="text-sm text-muted-foreground">
                    Materiales para promocionar productos
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form / Tickets */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Crear Ticket de Soporte</h2>
            </div>

            {isAuthenticated ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Nuevo Ticket</CardTitle>
                    <CardDescription>
                      Describe tu problema o pregunta y te responderemos pronto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitTicket} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Asunto *</Label>
                        <Input
                          id="subject"
                          placeholder="Resumen de tu consulta"
                          value={ticketForm.subject}
                          onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priority">Prioridad</Label>
                        <Select
                          value={ticketForm.priority}
                          onValueChange={(value: any) => setTicketForm({ ...ticketForm, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Mensaje *</Label>
                        <Textarea
                          id="message"
                          placeholder="Describe tu problema o pregunta en detalle..."
                          rows={6}
                          value={ticketForm.message}
                          onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={createTicket.isPending}>
                        <Send className="mr-2 h-4 w-4" />
                        {createTicket.isPending ? "Enviando..." : "Enviar Ticket"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* My Tickets */}
                {myTickets && myTickets.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Mis Tickets</CardTitle>
                      <CardDescription>
                        Historial de tus consultas de soporte
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {myTickets.map((ticket) => (
                        <div key={ticket.id} className="p-4 rounded-lg border space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="font-medium">{ticket.subject}</div>
                            <div className="flex gap-2">
                              {getStatusBadge(ticket.status)}
                              {getPriorityBadge(ticket.priority)}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {ticket.message}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Creado: {new Date(ticket.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center space-y-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Inicia sesión para crear tickets
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Necesitas una cuenta para contactar con soporte
                    </p>
                    <a href={getLoginUrl()}>
                      <Button>Iniciar Sesión</Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2">
          <CardContent className="py-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Información de Contacto</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Central, Paraguay</p>
                  <p>Soporte disponible 24/7</p>
                  <p>Tiempo de respuesta: &lt;2 horas</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Horario de Atención</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Lunes a Viernes: 8:00 AM - 8:00 PM</p>
                  <p>Sábados: 9:00 AM - 6:00 PM</p>
                  <p>Domingos: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
