import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import AuthRoute from './components/AuthRoute.jsx'
import { QuotePage } from './pages/QuotePages.jsx'
import ClickSpark from './components/ClickSpark.jsx'

import HomePage from './pages/HomePage.jsx'
import WorkoutPage from './pages/WorkoutPage.jsx'
import SkincarePage from './pages/SkincarePage.jsx'
import DietPage from './pages/DietPage.jsx'
import MindSoulPage from './pages/MindSoulPage.jsx'
import HealthPage from './pages/HealthPage.jsx'
import GroceryPage from './pages/GroceryPage.jsx'
import DiaryPage from './pages/DiaryPage.jsx'
import VoicePage from './pages/VoicePage.jsx'
import NearbyPage from './pages/NearbyPage.jsx'
import GetStartedPage from './pages/GetStartedPage.jsx'

const Protected = ({ children, page }) => (
  <AuthRoute fallback={<QuotePage page={page} />}>{children}</AuthRoute>
)

export default function App() {
  return (
    <BrowserRouter>
      <ClickSpark sparkColor='#fff' sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/get-started" element={<GetStartedPage />} />
          <Route path="/workout" element={<Protected page="workout"><WorkoutPage /></Protected>} />
          <Route path="/skincare" element={<Protected page="skincare"><SkincarePage /></Protected>} />
          <Route path="/diet" element={<Protected page="diet"><DietPage /></Protected>} />
          <Route path="/mind-soul" element={<Protected page="mind-soul"><MindSoulPage /></Protected>} />
          <Route path="/health" element={<Protected page="health"><HealthPage /></Protected>} />
          <Route path="/order-up" element={<Protected page="order-up"><GroceryPage /></Protected>} />
          <Route path="/diary" element={<Protected page="diary"><DiaryPage /></Protected>} />
          <Route path="/voice" element={<Protected page="voice"><VoicePage /></Protected>} />
          <Route path="/nearby" element={<Protected page="nearby"><NearbyPage /></Protected>} />
        </Routes>
      </ClickSpark>
    </BrowserRouter>
  )
}
