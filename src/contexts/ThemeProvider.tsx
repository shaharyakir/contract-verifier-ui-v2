import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
  pageTheme: string;
  switchTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const usePage = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("usePage must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [pageTheme, setPageTheme] = useState<string>(() => {
    return localStorage.getItem("theme") || "light";
  });

  const theme = createTheme({
    spacing: (factor: number) => `${8 * factor}px`,
    palette: {
      mode: pageTheme as "light" | "dark",
      primary: {
        main: pageTheme === "light" ? "#1976d2" : "#90caf9",
      },
      background: {
        default: pageTheme === "light" ? "#ffffff" : "#121212",
        paper: pageTheme === "light" ? "#ffffff" : "#1e1e1e",
      },
      text: {
        primary: pageTheme === "light" ? "#000000" : "#ffffff",
        secondary: pageTheme === "light" ? "#666666" : "#b3b3b3",
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    components: {
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: pageTheme === "light" ? "#000000" : "#ffffff",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            color: pageTheme === "light" ? "#000000" : "#ffffff",
          },
        },
      },
    },
  });

  const switchTheme = () => {
    setPageTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", pageTheme);
    localStorage.setItem("theme", pageTheme);

    document.body.style.backgroundColor = pageTheme === "light" ? "#ffffff" : "#121212";
    document.body.style.color = pageTheme === "light" ? "#000000" : "#ffffff";
  }, [pageTheme]);

  return (
    <ThemeContext.Provider value={{ pageTheme, switchTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
