import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export async function getDatabase() {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, '../../demos.db'),
      driver: sqlite3.Database
    });
  }
  return db;
}

export async function initializeDatabase() {
  const database = await getDatabase();
  
  // Crear tabla de usuarios
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('person', 'ong')) NOT NULL,
      organization TEXT,
      location TEXT,
      bio TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Crear tabla de ONGs
  await database.exec(`
    CREATE TABLE IF NOT EXISTS ongs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT CHECK(type IN ('public', 'private')) NOT NULL,
      location TEXT,
      latitude REAL,
      longitude REAL,
      website TEXT,
      phone TEXT,
      email TEXT,
      logo TEXT,
      impact_score REAL DEFAULT 0,
      projects_count INTEGER DEFAULT 0,
      volunteers_count INTEGER DEFAULT 0,
      donations_received REAL DEFAULT 0,
      rating REAL DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Crear tabla de publicaciones del foro
  await database.exec(`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ong_id INTEGER,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      tags TEXT,
      likes INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (ong_id) REFERENCES ongs (id)
    )
  `);

  // Crear tabla de comentarios
  await database.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      post_id INTEGER,
      ong_id INTEGER,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (post_id) REFERENCES forum_posts (id),
      FOREIGN KEY (ong_id) REFERENCES ongs (id)
    )
  `);

  // Crear tabla de calificaciones de ONGs
  await database.exec(`
    CREATE TABLE IF NOT EXISTS ong_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ong_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (ong_id) REFERENCES ongs (id),
      UNIQUE(user_id, ong_id)
    )
  `);

  // Crear tabla de donaciones
  await database.exec(`
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ong_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      message TEXT,
      anonymous BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (ong_id) REFERENCES ongs (id)
    )
  `);

  // Crear tabla de voluntariado
  await database.exec(`
    CREATE TABLE IF NOT EXISTS volunteering (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ong_id INTEGER NOT NULL,
      hours INTEGER NOT NULL,
      activity TEXT,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (ong_id) REFERENCES ongs (id)
    )
  `);

  // Insertar datos de ejemplo
  await insertSampleData(database);
  
  console.log('✅ Base de datos inicializada correctamente');
}

async function insertSampleData(database) {
  // Verificar si ya hay datos
  const userCount = await database.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count > 0) return;

  // Insertar usuarios de ejemplo
  await database.run(`
    INSERT INTO users (email, password, name, role, organization, location, bio) VALUES
    ('admin@demos.com', '$2a$10$rQZ8KJ9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'Admin', 'ong', 'Demos+ Admin', 'Buenos Aires, Argentina', 'Administrador de la plataforma'),
    ('maria@fundacion.org', '$2a$10$rQZ8KJ9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'María González', 'ong', 'Fundación Ayuda', 'Buenos Aires, Argentina', 'Ayudando a niños en situación de calle'),
    ('juan@ecovida.org', '$2a$10$rQZ8KJ9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'Juan Pérez', 'ong', 'EcoVida', 'Mar del Plata, Argentina', 'Protegiendo el medio ambiente'),
    ('ana@educacion.org', '$2a$10$rQZ8KJ9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'Ana Rodríguez', 'ong', 'Educación para Todos', 'Córdoba, Argentina', 'Promoviendo la educación inclusiva'),
    ('carlos@salud.org', '$2a$10$rQZ8KJ9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'Carlos López', 'ong', 'Salud Comunitaria', 'Rosario, Argentina', 'Mejorando la salud de las comunidades'),
    ('lucia@derechos.org', '$2a$10$rQZ8KJ9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'Lucía Fernández', 'ong', 'Derechos Humanos', 'Mendoza, Argentina', 'Defendiendo los derechos humanos'),
    ('pedro@voluntario.com', '$2a$10$rQZ8KJ9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'Pedro Martínez', 'person', NULL, 'Buenos Aires, Argentina', 'Voluntario activo'),
    ('sofia@donante.com', '$2a$10$rQZ8KJ9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'Sofía García', 'person', NULL, 'Córdoba, Argentina', 'Donante regular')
  `);

  // Insertar ONGs de ejemplo
  await database.run(`
    INSERT INTO ongs (name, description, type, location, latitude, longitude, website, phone, email, impact_score, projects_count, volunteers_count, donations_received, rating, rating_count) VALUES
    ('Fundación Ayuda', 'Organización dedicada a ayudar a niños en situación de calle, proporcionando educación, alimentación y apoyo emocional.', 'public', 'Buenos Aires, Argentina', -34.6037, -58.3816, 'https://fundacionayuda.org', '+54 11 1234-5678', 'info@fundacionayuda.org', 8.5, 15, 120, 50000, 4.8, 45),
    ('EcoVida', 'ONG ambientalista que trabaja en la conservación de ecosistemas marinos y terrestres, promoviendo prácticas sostenibles.', 'public', 'Mar del Plata, Argentina', -38.0023, -57.5575, 'https://ecovida.org', '+54 223 456-7890', 'contacto@ecovida.org', 9.2, 8, 85, 75000, 4.9, 32),
    ('Educación para Todos', 'Organización que promueve la educación inclusiva y de calidad para niños y jóvenes en situación vulnerable.', 'private', 'Córdoba, Argentina', -31.4201, -64.1888, 'https://educacionparatodos.org', '+54 351 789-0123', 'info@educacionparatodos.org', 7.8, 12, 95, 35000, 4.6, 28),
    ('Salud Comunitaria', 'ONG que trabaja en mejorar el acceso a la salud en comunidades rurales y urbanas marginadas.', 'public', 'Rosario, Argentina', -32.9468, -60.6393, 'https://saludcomunitaria.org', '+54 341 234-5678', 'contacto@saludcomunitaria.org', 8.9, 20, 150, 85000, 4.7, 52),
    ('Derechos Humanos', 'Organización dedicada a la defensa y promoción de los derechos humanos en Argentina.', 'private', 'Mendoza, Argentina', -32.8908, -68.8272, 'https://derechoshumanos.org', '+54 261 567-8901', 'info@derechoshumanos.org', 9.5, 25, 200, 120000, 4.9, 78)
  `);

  // Insertar publicaciones de ejemplo
  await database.run(`
    INSERT INTO forum_posts (user_id, ong_id, title, content, tags, likes, comments_count) VALUES
    (2, 1, 'Campaña de Donación: Ayuda para Niños en Situación de Calle', 'Estamos organizando una campaña para ayudar a niños en situación de calle. Necesitamos donaciones de ropa, alimentos y útiles escolares. ¡Cualquier ayuda es bienvenida!', 'Donación,Niños,Educación', 45, 12),
    (3, 2, 'Voluntariado: Limpieza de Playa', 'Organizamos una jornada de limpieza de playa este sábado. Necesitamos voluntarios para ayudar a mantener limpio nuestro medio ambiente.', 'Voluntariado,Medio Ambiente,Limpieza', 32, 8),
    (4, 3, 'Programa de Alfabetización Digital', 'Lanzamos nuestro programa de alfabetización digital para adultos mayores. Necesitamos voluntarios con conocimientos en tecnología.', 'Educación,Tecnología,Adultos Mayores', 28, 15),
    (5, 4, 'Campaña de Vacunación', 'Realizaremos una campaña de vacunación gratuita en barrios vulnerables. Necesitamos apoyo médico y logístico.', 'Salud,Vacunación,Comunidad', 56, 23),
    (6, 5, 'Taller de Derechos Laborales', 'Organizamos un taller gratuito sobre derechos laborales y cómo defenderlos. Abierto a toda la comunidad.', 'Derechos,Laboral,Educación', 34, 18)
  `);

  // Insertar comentarios de ejemplo
  await database.run(`
    INSERT INTO comments (user_id, post_id, content) VALUES
    (7, 1, 'Excelente iniciativa! Me gustaría participar como voluntario.'),
    (8, 1, 'Doné ropa y útiles escolares. ¡Gracias por esta labor!'),
    (7, 2, 'Me encantaría participar en la limpieza de playa. ¿Cuándo es exactamente?'),
    (8, 3, 'Mi abuela participó en el programa y le encantó. ¡Muy recomendable!'),
    (7, 4, 'Como médico, me gustaría ofrecer mi ayuda en la campaña.'),
    (8, 5, 'Información muy útil. ¿Habrá más talleres como este?')
  `);

  // Insertar calificaciones de ejemplo
  await database.run(`
    INSERT INTO ong_ratings (user_id, ong_id, rating, comment) VALUES
    (7, 1, 5, 'Excelente organización, muy transparente con el uso de donaciones.'),
    (8, 1, 4, 'Buen trabajo, pero podrían mejorar la comunicación.'),
    (7, 2, 5, 'Increíble labor ambiental, muy comprometidos.'),
    (8, 2, 5, 'Participé en varias actividades y siempre muy bien organizadas.'),
    (7, 3, 4, 'Buen programa educativo, muy necesario.'),
    (8, 4, 5, 'Excelente atención médica en la comunidad.'),
    (7, 5, 5, 'Muy importante su labor en defensa de derechos humanos.')
  `);

  console.log('✅ Datos de ejemplo insertados correctamente');
} 