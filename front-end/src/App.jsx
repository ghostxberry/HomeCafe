import MyNavbar from "./components/MyNavbar";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import Sessions from './pages/Sessions'
import Landing from './pages/Landing'
import { SessionProvider } from './contexts/SessionContext'; 
import ProjectFilter from './components/ProjectFilter';
import Journal from './pages/Journal';

function App() {
  return (
    <Router>
      <SessionProvider>
        <div className="App">
          <MyNavbar /> 
          <Routes>
          <Route path="/projects" element={<ProjectFilter />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/" element={<Landing />} />
            <Route path="/journal" element={<Journal />}/>
          </Routes>
        </div>
      </SessionProvider>
    </Router>
  );
}

export default App;
