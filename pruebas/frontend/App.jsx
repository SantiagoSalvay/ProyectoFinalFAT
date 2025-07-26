import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useState } from 'react';

export default function App() {
  const [page, setPage] = useState('login');
  return (
    <div>
      <button onClick={() => setPage('login')}>Login</button>
      <button onClick={() => setPage('register')}>Register</button>
      {page === 'login' ? <LoginPage /> : <RegisterPage />}
    </div>
  );
}
