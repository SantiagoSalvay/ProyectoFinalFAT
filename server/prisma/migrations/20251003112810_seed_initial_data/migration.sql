-- Insertar tipos de usuario
INSERT INTO "TipoUsuario" ("tipo_usuario") VALUES
('Persona'),
('ONG'),
('Admin');

-- Insertar tipos de ranking
INSERT INTO "TipoRanking" ("tipo_ranking") VALUES
('Ranking ONG'),
('Ranking Usuarios');

-- Insertar tipos de infracción
INSERT INTO "TipoInfraccion" ("tipo_infraccion", "severidad") VALUES
('Contenido inapropiado', 'Media'),
('Spam', 'Baja'),
('Lenguaje ofensivo', 'Alta'),
('Información falsa', 'Alta'),
('Contenido ilegal', 'Crítica'),
('Acoso', 'Crítica'),
('Discriminación', 'Crítica');

-- Insertar etiquetas para publicaciones
INSERT INTO "Etiqueta" ("etiqueta") VALUES
('Alimentos'),
('Ropa'),
('Medicamentos'),
('Juguetes'),
('Libros'),
('Electrodomésticos'),
('Muebles'),
('Herramientas'),
('Material escolar'),
('Productos de higiene'),
('Calzado'),
('Accesorios'),
('Deportes'),
('Tecnología'),
('Hogar'),
('Jardín'),
('Mascotas'),
('Bebés'),
('Adultos mayores'),
('Emergencias');

-- Insertar tipos de donación
INSERT INTO "TipoDonacion" ("tipo_donacion", "descripcion", "puntos") VALUES
('Alimentos', 'Donación de productos alimenticios', 10),
('Ropa', 'Donación de prendas de vestir', 5),
('Medicamentos', 'Donación de medicamentos', 15),
('Juguetes', 'Donación de juguetes para niños', 8),
('Libros', 'Donación de libros y material educativo', 6),
('Electrodomésticos', 'Donación de aparatos eléctricos', 20),
('Muebles', 'Donación de muebles y decoración', 12),
('Herramientas', 'Donación de herramientas y equipos', 15),
('Material escolar', 'Donación de útiles escolares', 7),
('Productos de higiene', 'Donación de productos de cuidado personal', 5),
('Voluntariado', 'Donación de tiempo y trabajo voluntario', 0);
