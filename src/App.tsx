import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosRequestConfig } from "axios";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  Github,
  Moon,
  Sparkles,
  Sun,
  Terminal,
  WrapText,
  X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AxiosToCurl } from "./utils/axios-curl";

const EXAMPLE_CONFIG = `{
  method: "POST",
  maxContentLength: Infinity,
  url: "https://api.example.com/v1/users",
  params: { notify: true },
  headers: {
    "content-type": "application/json",
    authorization: "Bearer <token>",
  },
  data: { name: "Ada Lovelace", role: "admin" },
}`;

const INPUT_PLACEHOLDER = `Paste your axios config object, e.g.

${EXAMPLE_CONFIG}`;

const MULTILINE_KEY = "axios-to-curl:multiline";
const THEME_KEY = "axios-to-curl:theme";

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage may be unavailable (private mode, blocked cookies)
  }
};

const hasValidBraces = (input: string): boolean => {
  const stack: string[] = [];
  for (const char of input) {
    if (char === "{") {
      stack.push(char);
    } else if (char === "}") {
      if (stack.length === 0 || stack.pop() !== "{") {
        return false;
      }
    }
  }
  return stack.length === 0;
};

const parseConfig = (input: string): AxiosRequestConfig => {
  const cleanInput = input.replace(/\n/g, "").trim();
  if (!cleanInput.match(/^\{[\s\S]*\}$/) || !hasValidBraces(cleanInput)) {
    throw new Error("Input must be a single object literal wrapped in { }.");
  }

  // evaluate as a JS object literal (allows unquoted keys, Infinity, etc.),
  // then round-trip through JSON to drop anything non-serialisable
  const jsObject = (0, eval)(`(${input})`);
  return JSON.parse(JSON.stringify(jsObject));
};

// lightweight token colouring for the generated command
const highlight = (command: string) =>
  command.split(/('[^']*'|"[^"]*"|\s+)/).map((token, i) => {
    if (!token) return null;
    let className: string | undefined;
    if (token === "curl") className = "text-sky-600 dark:text-sky-400 font-semibold";
    else if (/^-{1,2}[a-zA-Z]/.test(token))
      className = "text-violet-600 dark:text-violet-400";
    else if (/^['"]/.test(token))
      className = "text-emerald-700 dark:text-emerald-400";
    else if (token === "\\") className = "text-muted-foreground";
    return (
      <span key={i} className={className}>
        {token}
      </span>
    );
  });

function useTheme() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggle = () =>
    setDark((d) => {
      writeStorage(THEME_KEY, d ? "light" : "dark");
      return !d;
    });

  return { dark, toggle };
}

function App() {
  const [configInput, setConfigInput] = useState("");
  const [config, setConfig] = useState<AxiosRequestConfig | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [multiline, setMultiline] = useState(
    () => readStorage(MULTILINE_KEY) === "true"
  );
  const { dark, toggle: toggleTheme } = useTheme();

  const outputCurl = useMemo(
    () => (config ? new AxiosToCurl(config).generateCommand({ multiline }) : ""),
    [config, multiline]
  );

  const handleConvert = useCallback(() => {
    setConfig(null);
    setError("");
    if (!configInput.trim()) {
      setError("Paste an axios config object first.");
      return;
    }
    try {
      setConfig(parseConfig(configInput));
    } catch (err) {
      console.log("invalid axios config", { error: err });
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Invalid axios config."
      );
    }
  }, [configInput]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputCurl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      return;
    }
  };

  const toggleMultiline = () =>
    setMultiline((m) => {
      writeStorage(MULTILINE_KEY, String(!m));
      return !m;
    });

  const handleClear = () => {
    setConfigInput("");
    setConfig(null);
    setError("");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Terminal className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              Axios to cURL
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://github.com/gvarma28/axios-to-curl"
                target="_blank"
                rel="noreferrer"
                aria-label="View source on GitHub"
              >
                <Github className="h-[18px] w-[18px]" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {dark ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Turn axios configs into cURL
          </h1>
          <p className="mt-2 text-muted-foreground">
            Paste an axios request config and get a ready-to-run cURL command.
            Everything runs locally in your browser.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          {/* input panel */}
          <section className="flex flex-col rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <h2 className="text-sm font-medium">Axios config</h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-muted-foreground"
                  onClick={() => setConfigInput(EXAMPLE_CONFIG)}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Example
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-muted-foreground"
                  onClick={handleClear}
                  disabled={!configInput && !config && !error}
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </div>
            </div>
            <Textarea
              className="min-h-[340px] resize-y rounded-none border-0 bg-transparent p-4 font-mono text-[13px] leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 lg:min-h-[420px]"
              value={configInput}
              onChange={(e) => setConfigInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleConvert();
                }
              }}
              placeholder={INPUT_PLACEHOLDER}
              spellCheck={false}
              aria-label="Axios config input"
            />
            <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                  ⌘/Ctrl
                </kbd>{" "}
                +{" "}
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                  Enter
                </kbd>{" "}
                to convert
              </span>
              <Button onClick={handleConvert} className="ml-auto gap-1.5">
                Convert
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </section>

          {/* output panel */}
          <section className="flex flex-col rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <h2 className="text-sm font-medium">cURL command</h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 gap-1.5 text-muted-foreground",
                    multiline && "bg-accent text-accent-foreground"
                  )}
                  onClick={toggleMultiline}
                  aria-pressed={multiline}
                >
                  <WrapText className="h-3.5 w-3.5" />
                  Multi-line
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-muted-foreground"
                  onClick={handleCopy}
                  disabled={!outputCurl}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            <div
              className="min-h-[200px] resize-y overflow-auto lg:min-h-[420px]"
              aria-live="polite"
            >
              {error ? (
                <div className="m-4 flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div>
                    <p className="font-medium">Couldn't parse that config</p>
                    <p className="mt-1 text-muted-foreground">{error}</p>
                    <p className="mt-2 text-muted-foreground">
                      Think the input is valid?{" "}
                      <a
                        href="https://github.com/gvarma28/axios-to-curl/issues"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-foreground underline underline-offset-4"
                      >
                        Report a bug
                      </a>
                    </p>
                  </div>
                </div>
              ) : outputCurl ? (
                <pre className="whitespace-pre-wrap break-all p-4 font-mono text-[13px] leading-relaxed">
                  <code>{highlight(outputCurl)}</code>
                </pre>
              ) : (
                <div className="flex h-full min-h-[inherit] flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
                  <Terminal className="h-6 w-6 opacity-50" />
                  Your cURL command will appear here.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-sm text-muted-foreground sm:px-6">
          <p>© {new Date().getFullYear()} Axios to cURL</p>
          <a
            href="https://github.com/gvarma28/axios-to-curl/issues"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            Report a bug
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
