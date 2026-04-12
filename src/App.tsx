import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MasterIndex from './MasterIndex'
import MBRDashboard from './Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MasterIndex />} />
        <Route path="/mbr-march-2026" element={<MBRDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
