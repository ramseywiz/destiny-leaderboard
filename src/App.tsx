import { Route, Routes } from 'react-router';
import './App.css';
import { SummaryPage } from './pages/report/page';
import { HomePage } from './pages/home/page';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/report/:membershipId" element={<SummaryPage />} />
    </Routes>
  )
}

export default App
  