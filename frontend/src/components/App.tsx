import { BrowserRouter, Routes, Route } from "react-router-dom";
import Stoptz from "../pages/Stoptz";
import Home from "../pages/Home";
import Header from "./Header";
import "../styles/global.css";
import "../styles/App.css";
import "../styles/Card.css";

export default function App() {
  return (
    <>
      <div className="dark">
        <div className="appBackground">
          <Header />

          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/streaming-optimization" element={<Stoptz />} />
            </Routes>
          </BrowserRouter>

        </div>
      </div>
    </>
  );
}
