import React from 'react'
import TrackerTable from './components/TrackerTable'
import Corgi from './assets/london-corgi.webp'

export default function App() {
  return (
    <div className="app">
      <header className="hero">
        <div className="hero-text">
          <h1>English Homework Tracker</h1>
          <h2>Welcome to Group Gr1</h2>
          <p className="tag">Learn, practise and make progress!</p>
        </div>
        <div className="hero-illustration">
          <img src={Corgi} alt="Corgi mascot" className="corgi-png" loading="lazy" />
        </div>
      </header>
      <main>
        <TrackerTable />
      </main>
      
    </div>
  )
}
