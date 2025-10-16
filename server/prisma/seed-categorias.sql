-- Insertar categorías predefinidas para ONGs
INSERT INTO "Categoria" (nombre, descripcion, color, icono, "createdAt") VALUES
('Niños', 'Organizaciones que trabajan con niños y jóvenes', '#2196f3', '👶', NOW()),
('Gente mayor', 'Organizaciones que apoyan a personas mayores', '#8bc34a', '👴', NOW()),
('Mujeres', 'Organizaciones enfocadas en derechos y apoyo a mujeres', '#e040fb', '👩', NOW()),
('Animales', 'Protección y cuidado de animales', '#ff9800', '🐾', NOW()),
('Personas con discapacidad', 'Apoyo e inclusión de personas con discapacidad', '#ffeb3b', '♿', NOW()),
('Familias', 'Apoyo integral a familias', '#009688', '👨‍👩‍👧‍👦', NOW()),
('Otros', 'Otras causas sociales', '#f44336', '🤝', NOW())
ON CONFLICT (nombre) DO NOTHING;
