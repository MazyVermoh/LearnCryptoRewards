import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Home from "@/pages/Home";
import BookReader from "@/pages/BookReader";
import CourseReader from "@/pages/CourseReader";
import TestManager from "@/pages/TestManager";
import TelegramBotPreview from "@/pages/TelegramBotPreview";
import RegistrationPage from "@/pages/Registration";
import ProfilePage from "@/pages/Profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={RegistrationPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/books/:id/read" component={BookReader} />
      <Route path="/courses/:id/read" component={CourseReader} />
      <Route path="/admin/tests" component={TestManager} />
      <Route path="/telegram/preview" component={TelegramBotPreview} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
