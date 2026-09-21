  import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { useAuth } from "@/contexts/AuthContext";
  import { Bus, ArrowLeft } from "lucide-react";
  import React, { useState } from "react";

  export const Route = createFileRoute("/login")({
    component: LoginPage,
  });

  function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState("Mugul");
    const [password, setPassword] = useState("mockpassword123");


    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
        <div className="absolute top-4 left-4">
          <Button variant="ghost" onClick={() => navigate({ to: "/" })} className="flex gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </div>
        
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex justify-center mb-6">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl">
              <Bus className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-center text-slate-500 mb-8">Sign in to your Journyx account</p>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />
            </div>
            <Button onClick={() => {
              login(username);
              navigate({ to: "/" });
            }} className="w-full h-12 text-lg font-semibold rounded-xl active:scale-95 transition-all">
              Log In
            </Button>
          </div>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    );
  }
