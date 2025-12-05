import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import RecipePage from "./pages/RecipePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
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
  );
}

export default App;