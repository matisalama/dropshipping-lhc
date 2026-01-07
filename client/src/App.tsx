import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProductDetail from "./pages/ProductDetail";
import Admin from "./pages/Admin";
import Recursos from "./pages/Recursos";
import Soporte from "./pages/Soporte";
import CreateOrder from "./pages/CreateOrder";
import OrderTracking from "./pages/OrderTracking";
import { WhatsAppButton } from "./components/WhatsAppButton";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/dashboard/orders"} component={OrderTracking} />
      <Route path={"/create-order"} component={CreateOrder} />
      <Route path={"/producto/:id"} component={ProductDetail} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/recursos"} component={Recursos} />
      <Route path={"/soporte"} component={Soporte} />
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
