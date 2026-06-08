import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.email.trim(), form.password, form.name.trim());
      navigate("/", { replace: true });
    } catch (err) {
      setError(formatApiError(err, "Inscription impossible"));
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div data-testid="register-page" className="bg-background min-h-[70vh]">
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-12 sm:py-20">
          <p className="overline">Rejoindre — Vol.04</p>
          <h1 className="font-display font-light tracking-tighter mt-4 leading-[0.9]"
              style={{ fontSize: "clamp(48px, 8vw, 120px)" }}>
            Créer un compte.
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1480px] px-4 sm:px-8 py-10 sm:py-14">
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={onSubmit}
          className="max-w-xl space-y-6"
          data-testid="register-form"
        >
          <Field label="Nom" value={form.name} onChange={set("name")} testId="register-name" />
          <Field label="Email" type="email" value={form.email} onChange={set("email")} testId="register-email" required autoComplete="email" />
          <Field label="Mot de passe" type="password" value={form.password} onChange={set("password")} testId="register-password" required autoComplete="new-password" />
          <p className="text-xs text-muted-foreground">Minimum 6 caractères.</p>

          {error && (
            <p data-testid="register-error" className="text-sm text-destructive border border-destructive/50 p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="register-submit"
            className="overline bg-foreground text-background px-6 py-4 inline-flex items-center gap-3 hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? "Création…" : "Créer mon compte"} <ArrowRight size={14} />
          </button>

          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="underline underline-offset-4 hover:opacity-60" data-testid="register-to-login">
              Se connecter
            </Link>
          </p>
        </motion.form>
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
      onChange={onChange}
      autoComplete={autoComplete}
      data-testid={testId}
      className="mt-1 w-full bg-transparent border-b border-border focus:border-foreground outline-none py-2 text-sm transition-colors"
    />
  </label>
);

export default Register;
