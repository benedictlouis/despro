import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import MainLayout from "./layouts/MainLayout";
import RecipePage from "./pages/RecipePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { theme } from "./utils/themes";

function App() {
  return (
<<<<<<< HEAD
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <MainLayout>
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/recipes" element={<RecipePage />} />
              <Route path="/" element={<DashboardPage />} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
    </BrowserRouter>
=======
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
>>>>>>> 8eb1a6827f0587bd451668971f031aca00e146a9
  );
}

export default App;
