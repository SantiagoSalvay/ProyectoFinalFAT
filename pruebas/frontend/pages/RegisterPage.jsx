import { useState } from 'react';
import UserList from './UserList';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [reloadUsers, setReloadUsers] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('http://localhost:4000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const data = await res.json();
    if (data.success) {
      setMessage('¡Registro exitoso!');
      setReloadUsers(r => !r); // Fuerza recarga de usuarios
    } else {
      setMessage(data.message || 'Error');
    }
  };

  return (
    <div>
      <h2>Registro de Prueba</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Registrarse</button>
      </form>
      <div>{message}</div>
      <UserList reload={reloadUsers} />
    </div>
  );
}
