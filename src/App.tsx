import { Route, Routes } from 'react-router';
import './App.css';
import { SummaryPage } from './pages/report/page';
import { HomePage } from './pages/home/page';
import { PcgrPage } from './pages/pcgr/page';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/report/:platform/:membershipId" element={<SummaryPage />} />
      <Route path="/pcgr/:instanceId" element={<PcgrPage />} />
    </Routes>
  );
};

export default App;
