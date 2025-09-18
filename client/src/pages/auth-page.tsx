import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Users, Building, Shield } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    role: "student" as "student" | "company" | "admin",
    name: "",
    location: "",
    industry: ""
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-accent/20 flex">
      {/* Left Column - Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-12 w-12 text-primary mr-2" />
              <h1 className="text-3xl font-bold text-foreground">InternAlloc</h1>
            </div>
            <p className="text-muted-foreground">AI-Powered Internship Allocation System</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                        data-testid="input-login-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        data-testid="input-login-password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Join InternAlloc today</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                        data-testid="input-register-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        data-testid="input-register-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-role">Role</Label>
                      <Select 
                        value={registerData.role} 
                        onValueChange={(value: "student" | "company" | "admin") => 
                          setRegisterData({ ...registerData, role: value })
                        }
                      >
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="company">Company</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Role-specific fields */}
                    {(registerData.role === "student" || registerData.role === "company") && (
                      <div>
                        <Label htmlFor="register-name">
                          {registerData.role === "student" ? "Full Name" : "Company Name"}
                        </Label>
                        <Input
                          id="register-name"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                          required
                          data-testid="input-register-name"
                        />
                      </div>
                    )}
                    
                    {registerData.role === "company" && (
                      <div>
                        <Label htmlFor="register-industry">Industry</Label>
                        <Input
                          id="register-industry"
                          value={registerData.industry}
                          onChange={(e) => setRegisterData({ ...registerData, industry: e.target.value })}
                          placeholder="e.g., Technology, Finance, Healthcare"
                          data-testid="input-register-industry"
                        />
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/90 to-accent text-white p-12 items-center justify-center">
        <div className="max-w-lg text-center">
          <h2 className="text-4xl font-bold mb-6">Smart Internship Matching</h2>
          <p className="text-xl mb-8 opacity-90">
            Powered by AI to connect the right students with the perfect internship opportunities
          </p>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">For Students</h3>
                <p className="text-sm opacity-80">Find your ideal internship with AI-powered matching</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Building className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">For Companies</h3>
                <p className="text-sm opacity-80">Discover top talent that matches your requirements</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Shield className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Fair & Transparent</h3>
                <p className="text-sm opacity-80">Built-in fairness monitoring and audit capabilities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
