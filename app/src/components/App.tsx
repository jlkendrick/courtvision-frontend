import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Stoptz from '../pages/Stoptz'
import Header from "../components/Header";
import { CardWithForm } from './CardWithForm'
import '../styles/global.css'
import '../styles/App.css'
import '../styles/Card.css'


export default function App() {

  return (
    <>
    <div className="dark">
    <div className="appBackground">
      <Header />

      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={} /> */}
          <Route path="/streaming-optimization" element={<Stoptz />} />
        </Routes>
      </BrowserRouter>

      <CardWithForm />

    </div>
    </div>

    </>
  )
}
