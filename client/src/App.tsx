import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PanelDeControl from "./pages/PanelDeControl";
import ProductDetail from "./pages/ProductDetail";
import Admin from "./pages/Admin";
import Recursos from "./pages/Recursos";
import Soporte from "./pages/Soporte";
import CreateOrder from "./pages/CreateOrder";
import OrderTracking from "./pages/OrderTracking";
import NotificationHistory from "./pages/NotificationHistory";
import { WhatsAppButton } from "./components/WhatsAppButton";
import DropshipperPanelDeControl from "./pages/DropshipperPanelDeControl";
import DropshipperSettings from "./pages/DropshipperSettings";
import DropshipperIssues from "./pages/DropshipperIssues";
import DropshipperTools from "./pages/DropshipperTools";
import UploadSale from "./pages/UploadSale";
import { Login } from "./pages/Login";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/dashboard"} component={PanelDeControl} />
      <Route path={"/dashboard/orders"} component={OrderTracking} />
      <Route path={"/create-order"} component={CreateOrder} />
      <Route path={"/producto/:id"} component={ProductDetail} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin/notifications"} component={NotificationHistory} />
      <Route path={"/recursos"} component={Recursos} />
      <Route path={"/soporte"} component={Soporte} />
      
      {/* Dropshipper Routes */}
      <Route path={"/dropshipper/dashboard"} component={DropshipperPanelDeControl} />
      <Route path={"/dropshipper/cargar-venta"} component={UploadSale} />
      <Route path={"/dropshipper/configuracion"} component={DropshipperSettings} />
      <Route path={"/dropshipper/problemas"} component={DropshipperIssues} />
      <Route path={"/dropshipper/herramientas"} component={DropshipperTools} />
      
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <WhatsAppButton />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
