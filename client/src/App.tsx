import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Route, Switch } from "wouter";
import UserForm from "@/pages/UserForm";
import Login from "@/pages/Login";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/register" component={UserForm} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;