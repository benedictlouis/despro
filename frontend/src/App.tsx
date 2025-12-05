import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import RecipePage from "./pages/RecipePage";
import SignInPage from "./pages/SignInPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
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