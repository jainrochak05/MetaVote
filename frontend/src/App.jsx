import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import VotePage from "./pages/VotePage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <div className="app-shell">
          <Navbar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/vote" element={<VotePage />} />
              <Route path="/results" element={<ResultsPage />} />
            </Routes>
          </div>
        </div>
      </WalletProvider>
    </BrowserRouter>
  );
}

export default App;
