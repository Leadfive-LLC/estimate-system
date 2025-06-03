import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import LoginButton from "./components/LoginButton"
import UserProfile from "./components/UserProfile"
import Dashboard from "./pages/Dashboard"
import ClientsPage from "./pages/ClientsPage"
import ItemsPage from "./pages/ItemsPage"
import EstimatesPage from "./pages/EstimatesPage"
import CreateEstimatePage from "./pages/CreateEstimatePage"
import EstimateDetailPage from "./pages/EstimateDetailPage"
import EditItemPage from './pages/EditItemPage'

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/estimates" element={<EstimatesPage />} />
          <Route path="/estimates/new" element={<CreateEstimatePage />} />
          <Route path="/estimates/:id" element={<EstimateDetailPage />} />
          <Route path="/items/:id/edit" element={<EditItemPage />} />
        </Routes>
      </Router>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">造園見積システム</h1>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">個人宅向け造園工事の見積から請求まで一元管理</h2>
          <p className="text-lg text-gray-600 mb-8">ログインして造園見積システムをご利用ください</p>
          <LoginButton />
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
