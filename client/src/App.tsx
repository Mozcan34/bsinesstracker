import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Route, Switch } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import UserForm from "@/pages/UserForm";
import Login from "@/pages/Login";
import Users from "@/pages/Users";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={UserForm} />
        
        {/* Protected Routes */}
        <Route path="/users">
          {() => (
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          )}
        </Route>
        
        {/* Redirect to login by default */}
        <Route>
          {() => {
            window.location.href = "/login";
            return null;
          }}
        </Route>
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;