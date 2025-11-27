import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-4xl font-bold text-center mb-8">
                Fitness Club Management System
              </h1>
              <p className="text-center text-gray-600">
                Welcome! This is your fitness club management system.
              </p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App

