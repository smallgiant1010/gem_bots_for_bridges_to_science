import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ContentPage from "./Pages/ContentPage";
import AccessPage from "./Pages/AccessPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AccessPage />} />
        <Route path="/main" element={<ContentPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
