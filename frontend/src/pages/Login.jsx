import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(email.trim(), password);
      navigate(u.role === "admin" ? "/admin" : redirectTo, { replace: true });
    } catch (err) {
      setError(formatApiError(err, "Connexion impossible"));
    } finally {
      setLoading(false);
    }
  };

  const fill = (e, p) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div data-testid="login-page" className="bg-background min-h-[70vh]">
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-12 sm:py-20">
          <p className="overline">Accès — Vol.04</p>
          <h1
            className="font-display font-light tracking-tighter mt-4 leading-[0.9]"
            style={{ fontSize: "clamp(48px, 8vw, 120px)" }}
          >
            Connexion.
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={onSubmit}
          className="lg:col-span-7 space-y-8"
          data-testid="login-form"
        >
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            testId="login-email"
            required
            autoComplete="email"
          />
          <div>
            <label className="block">
              <span className="overline text-muted-foreground">Mot de passe *</span>
              <div className="flex items-center border-b border-border focus-within:border-foreground transition-colors">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  data-testid="login-password"
                  className="flex-1 bg-transparent outline-none py-2 text-sm"
                />
                <button
                  type="button"
                  data-testid="login-toggle-password"
                  onClick={() => setShowPwd((v) => !v)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Afficher mot de passe"
                >
                  {showPwd ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
          </div>

          {error && (
            <p data-testid="login-error" className="text-sm text-destructive border border-destructive/50 p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit"
            className="overline bg-foreground text-background px-6 py-4 inline-flex items-center gap-3 hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? "Connexion…" : "Se connecter"} <ArrowRight size={14} />
          </button>

          <p className="text-sm text-muted-foreground">
            Pas de compte ?{" "}
            <Link to="/register" className="underline underline-offset-4 hover:opacity-60" data-testid="login-to-register">
              Créer un compte
            </Link>
          </p>
        </motion.form>

        <aside className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start border border-border p-6 sm:p-8 bg-card" data-testid="login-demo-panel">
          <p className="overline mb-6">Comptes de démonstration</p>
          <ul className="divide-y divide-border text-sm">
            <DemoRow
              role="Admin"
              email="admin@malin.shop"
              pwd="Admin123!"
              onFill={() => fill("admin@malin.shop", "Admin123!")}
              testId="demo-admin"
            />
            <DemoRow
              role="Client 1"
              email="client1@malin.shop"
              pwd="Client123!"
              onFill={() => fill("client1@malin.shop", "Client123!")}
              testId="demo-client1"
            />
            <DemoRow
              role="Client 2"
              email="client2@malin.shop"
              pwd="Client123!"
              onFill={() => fill("client2@malin.shop", "Client123!")}
              testId="demo-client2"
            />
          </ul>
          <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
            Cliquez sur un compte pour pré-remplir le formulaire. L’admin accède à la console de
            gestion des produits et commandes.
          </p>
        </aside>
      </div>
    </div>
  );
};

const Field = ({ label, type = "text", value, onChange, required, testId, autoComplete }) => (
  <label className="block">
    <span className="overline text-muted-foreground">{label}{required ? " *" : ""}</span>
    <input
      type={type}
      required={required}
      value={value}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testId}
      className="mt-1 w-full bg-transparent border-b border-border focus:border-foreground outline-none py-2 text-sm transition-colors"
    />
  </label>
);

const DemoRow = ({ role, email, pwd, onFill, testId }) => (
  <li className="py-4 flex justify-between items-center gap-3">
    <div className="min-w-0">
      <p className="font-display text-base">{role}</p>
      <p className="font-mono text-xs text-muted-foreground truncate">{email}</p>
      <p className="font-mono text-xs text-muted-foreground">{pwd}</p>
    </div>
    <button
      type="button"
      onClick={onFill}
      data-testid={testId}
      className="overline text-xs border border-border px-3 py-2 hover:bg-foreground hover:text-background transition-colors shrink-0"
    >
      Utiliser
    </button>
  </li>
);

export default Login;
