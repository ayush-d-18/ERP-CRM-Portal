import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Layers } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { login, signup } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let response;
      if (isSignIn) {
        response = await login(email, password);
      } else {
        response = await signup(email, password, name);
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const role = response.data.user.role;
      if (role === "ADMIN" || role === "SALES") {
        navigate("/dashboard");
      } else if (role === "WAREHOUSE") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || (isSignIn ? "Login failed" : "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-8 py-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Layers className="w-7 h-7 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">ERP Portal</h1>
            <p className="text-blue-100 text-sm">Manage your business with confidence</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                setIsSignIn(true);
                setError("");
                setEmail("");
                setPassword("");
                setName("");
              }}
              className={`flex-1 py-4 font-medium transition ${
                isSignIn
                  ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignIn(false);
                setError("");
                setEmail("");
                setPassword("");
                setName("");
              }}
              className={`flex-1 py-4 font-medium transition ${
                !isSignIn
                  ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            {!isSignIn && (
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {!isSignIn && (
                <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              {isSignIn ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 mt-6 text-xs">
          © 2026 ERP Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
}
