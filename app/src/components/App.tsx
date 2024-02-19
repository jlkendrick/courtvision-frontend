import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LeagueInfo from './LeagueInfo'
import ListFeatures from './ListFeatures'
import Home from '../pages/Home'
import Stoptz from '../pages/Stoptz'
import Header from "../components/Header";

export default function App() {

  return (
    <>

    <Header />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stoptz" element={<Stoptz />} />
      </Routes>
    </BrowserRouter>
    <div>
      <LeagueInfo />
    </div>
    <div>
      <ListFeatures />
    </div>

    </>
  )
}
