import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Admin from "./pages/Admin";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
