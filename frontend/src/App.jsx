import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SchemaBuilder from './pages/SchemaBuilder';
import VisualStudio from './pages/VisualStudio';
import Settings from './pages/Settings';
import ApiPlayground from './pages/ApiPlayground';
import Documentation from './pages/Documentation';
import OnboardingModal from './components/OnboardingModal';

function App() {
  return (
    <>
      {/* Global onboarding overlay — rendered above all routes */}
      <OnboardingModal />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes wrapped in Layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/schemas"       element={<SchemaBuilder />} />
            <Route path="/visual-studio" element={<VisualStudio />} />
            <Route path="/playground"    element={<ApiPlayground />} />
            <Route path="/docs"          element={<Documentation />} />
            <Route path="/settings"      element={<Settings />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;