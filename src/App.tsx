import { Route, Routes } from 'react-router';
import './App.css';
import { SummaryPage } from './pages/report/page';
import { HomePage } from './pages/home/page';
import { PcgrPage } from './pages/pcgr/page';
import { Navbar } from './components/navbar';

const App = () => {
  return (
    <>
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report/:platform/:membershipId" element={<SummaryPage />} />
          <Route path="/pcgr/:instanceId" element={<PcgrPage />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
