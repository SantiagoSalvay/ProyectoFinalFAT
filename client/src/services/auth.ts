import axios from 'axios';

const API_URL = 'http://localhost:3002';

interface RegisterData {
  nombreCompleto: string;
  ubicacion: string;
  email: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  try {
    const [nombre, ...apellidoArray] = data.nombreCompleto.split(' ');
    const apellido = apellidoArray.join(' ');
    
    if (!nombre || !apellido) {
      throw new Error('Por favor ingresa nombre y apellido');
    }

    console.log('Enviando datos al servidor:', {
      nombre,
      apellido,
      usuario: data.email.split('@')[0],
      correo: data.email,
      contrasena: '[PROTECTED]'
    });

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre,
        apellido,
        usuario: data.email.split('@')[0], // Usamos la parte del email antes del @ como nombre de usuario
        telefono: "", // Campo requerido por el esquema pero no solicitado en el formulario
        correo: data.email,
        contrasena: data.password
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Error al crear la cuenta');
    }
    
    console.log('Respuesta del servidor:', responseData);
    return responseData;
  } catch (error: any) {
    console.error('Error en el registro:', error);
    throw new Error(error.message || 'Error al crear la cuenta');
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Error al iniciar sesión');
    }
    
    return responseData;
  } catch (error: any) {
    console.error('Error en el login:', error);
    throw new Error(error.message || 'Error al iniciar sesión');
  }
}; 