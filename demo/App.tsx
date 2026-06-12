import { useState } from "react";
import Index from "./pages/Index.tsx";
import MuiRegistry from "./pages/MuiRegistry.tsx";

type Page = "default" | "mui";

const NAV: { id: Page; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "mui", label: "MUI Registry" },
];

const App = () => {
  const [page, setPage] = useState<Page>("default");

  return (
    <>
      <nav className="jsonjoy sticky top-0 z-50 flex gap-1 border-b border-border/40 bg-background/90 px-4 py-2 backdrop-blur-sm">
        {NAV.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPage(id)}
            className={
              page === id
                ? "rounded-md px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground"
                : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            }
          >
            {label}
          </button>
        ))}
      </nav>
      {page === "default" ? <Index /> : <MuiRegistry />}
    </>
  );
};

export default App;
