import { useEffect, useState } from 'react';

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div>
      <h3>Usuarios registrados</h3>
      <ul>
        {users.map((u, i) => (
          <li key={i}>{u.name} ({u.email})</li>
        ))}
      </ul>
    </div>
  );
}
