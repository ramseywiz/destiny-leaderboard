import { Route, Routes } from 'react-router';
import './App.css';
import { SummaryPage } from './pages/report/page';
import { HomePage } from './pages/home/page';
import { PcgrPage } from './pages/pcgr/page';
import { FaqPage } from './pages/faq/page';
import { AboutPage } from './pages/about/page';
import { PrivacyPage } from './pages/privacy/page';
import { TermsPage } from './pages/terms/page';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';

const App = () => {
  return (
    <>
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report/:platform/:membershipId" element={<SummaryPage />} />
          <Route path="/pcgr/:instanceId" element={<PcgrPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
