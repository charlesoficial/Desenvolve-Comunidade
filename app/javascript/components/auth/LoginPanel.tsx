import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  getRememberedLogin,
  sendPasswordRecovery,
  signInWithPassword,
  signUpWithPassword,
  startOAuth,
} from "../../lib/auth";

type LoginMode = "login" | "signup" | "recover";

export function LoginPanel() {
  const rememberedLogin = useMemo(() => getRememberedLogin(), []);
  const [mode, setMode] = useState<LoginMode>("login");
  const [login, setLogin] = useState(rememberedLogin);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(Boolean(rememberedLogin));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isLogin = mode === "login";
  const isRecover = mode === "recover";
  const title = isLogin ? "Bem-vindo de volta" : isRecover ? "Recuperar senha" : "Criar conta";
  const subtitle = isLogin
    ? "Entre na sua conta para continuar"
    : isRecover
      ? "Informe seu e-mail ou usuÃ¡rio"
      : "Crie sua conta para continuar";
  const canSubmit = Boolean(login.trim()) && (isRecover || password.trim().length >= 6);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    if (!canSubmit) {
      setError(isRecover ? "Digite seu e-mail ou usuÃ¡rio." : "Digite seu e-mail ou usuÃ¡rio e senha.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isRecover) {
        await sendPasswordRecovery(login);
        setMessage("Enviamos as instruÃ§Ãµes para o seu e-mail.");
      } else if (isLogin) {
        await signInWithPassword(login, password, remember);
        const url = new URL(window.location.href);
        url.searchParams.set("v", "feed");
        window.history.pushState({}, "", url);
        window.dispatchEvent(new PopStateEvent("popstate"));
      } else {
        await signUpWithPassword(login, password);
        setMessage("Conta criada. Confira seu e-mail para confirmar o acesso.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "NÃ£o foi possÃ­vel concluir a aÃ§Ã£o.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setError("");
    setMessage("");
  };

  return (
    <main className="login-page" aria-label="Login">
      <section className="login-card">
        <img className="login-logo" src="/community-assets/rji72k58i9o4ujxgb0n0wqpf12pf-b4d4c257bd35.png" alt="Comunidade" />
        <h1>{title}</h1>
        <p>{subtitle}</p>

        <form className="login-form" onSubmit={submit}>
          <label>
            <span>E-mail ou UsuÃ¡rio</span>
            <div className="login-input-wrap">
              <UserRound aria-hidden="true" size={20} />
              <input
                autoComplete="username"
                placeholder="Digite seu e-mail ou usuÃ¡rio"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
              />
            </div>
          </label>

          {!isRecover ? (
            <label>
              <span>Senha</span>
              <div className="login-input-wrap">
                <LockKeyhole aria-hidden="true" size={20} />
                <input
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder="Digite sua senha"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  className="login-eye"
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </label>
          ) : null}

          {isLogin ? (
            <div className="login-options">
              <label className="login-remember">
                <input checked={remember} type="checkbox" onChange={(event) => setRemember(event.target.checked)} />
                <span>Lembrar de mim</span>
              </label>
              <button type="button" onClick={() => switchMode("recover")}>Esqueci minha senha</button>
            </div>
          ) : null}

          {error ? <div className="login-feedback error">{error}</div> : null}
          {message ? <div className="login-feedback success">{message}</div> : null}

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? (isRecover ? "Enviando..." : isLogin ? "Entrando..." : "Criando...") : isLogin ? "Entrar" : isRecover ? "Enviar link" : "Criar conta"}
          </button>
        </form>

        {isLogin ? (
          <>
            <div className="login-separator">
              <span />
              <em>ou continue com</em>
              <span />
            </div>

            <div className="login-socials">
              <button type="button" onClick={() => startOAuth("google")}>
                <span className="login-google-icon">G</span>
                Google
              </button>
              <button type="button" onClick={() => startOAuth("amazon")}>
                <span className="login-amazon-icon">a</span>
                Amazon
              </button>
            </div>
          </>
        ) : null}

        <footer className="login-footer">
          {isLogin ? (
            <>
              <span>NÃ£o tem uma conta?</span>
              <button type="button" onClick={() => switchMode("signup")}>Criar conta</button>
            </>
          ) : (
            <>
              <span>JÃ¡ tem uma conta?</span>
              <button type="button" onClick={() => switchMode("login")}>Entrar</button>
            </>
          )}
        </footer>
      </section>
    </main>
  );
}
