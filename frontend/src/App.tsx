import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import MainLayout from "./layouts/MainLayout";
import RecipePage from "./pages/RecipePage";
import SignInPage from "./pages/SignInPage";
import DashboardPage from "./pages/DashboardPage";
import { theme } from "./utils/themes";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route
            path="/*"
            element={
              <MainLayout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/recipes" element={<RecipePage />} />
                  <Route path="/" element={<DashboardPage />} />
                </Routes>
              </MainLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
