-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:33065
-- Tiempo de generación: 19-04-2026 a las 03:08:43
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `amazon`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`) VALUES
(1, 'Electrónica'),
(2, 'Ropa y Accesorios'),
(3, 'Hogar y Cocina'),
(4, 'Deportes y Aire Libre'),
(5, 'Libros');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compras`
--

CREATE TABLE `compras` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `comprador_id` int(11) NOT NULL,
  `vendedor_id` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `estado` varchar(20) DEFAULT 'pendiente',
  `fecha_compra` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `compras`
--

INSERT INTO `compras` (`id`, `producto_id`, `comprador_id`, `vendedor_id`, `precio`, `estado`, `fecha_compra`) VALUES
(1, 1, 1, 3, 299.99, 'completado', '2026-04-19 01:00:04'),
(2, 3, 2, 4, 15.99, 'pendiente', '2026-04-19 01:00:04'),
(3, 5, 2, 3, 450.00, 'completado', '2026-04-19 01:00:04'),
(4, 6, 1, 4, 29.99, 'pendiente', '2026-04-19 01:00:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conversaciones`
--

CREATE TABLE `conversaciones` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `comprador_id` int(11) NOT NULL,
  `vendedor_id` int(11) NOT NULL,
  `fecha_inicio` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `conversaciones`
--

INSERT INTO `conversaciones` (`id`, `producto_id`, `comprador_id`, `vendedor_id`, `fecha_inicio`) VALUES
(1, 1, 1, 3, '2026-04-19 01:00:04'),
(2, 3, 2, 4, '2026-04-19 01:00:04'),
(3, 5, 2, 3, '2026-04-19 01:00:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `favoritos`
--

CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `favoritos`
--

INSERT INTO `favoritos` (`id`, `usuario_id`, `producto_id`) VALUES
(1, 1, 1),
(2, 1, 3),
(3, 2, 2),
(4, 2, 5),
(5, 3, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes_producto`
--

CREATE TABLE `imagenes_producto` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `url` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `imagenes_producto`
--

INSERT INTO `imagenes_producto` (`id`, `producto_id`, `url`) VALUES
(1, 1, 'https://ejemplo.com/img/smartphone1.jpg'),
(2, 1, 'https://ejemplo.com/img/smartphone2.jpg'),
(3, 2, 'https://ejemplo.com/img/auriculares1.jpg'),
(4, 3, 'https://ejemplo.com/img/camiseta1.jpg'),
(5, 4, 'https://ejemplo.com/img/sartenes1.jpg'),
(6, 5, 'https://ejemplo.com/img/bici1.jpg'),
(7, 6, 'https://ejemplo.com/img/libro_sql1.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes`
--

CREATE TABLE `mensajes` (
  `id` int(11) NOT NULL,
  `conversacion_id` int(11) NOT NULL,
  `emisor_id` int(11) NOT NULL,
  `contenido` text NOT NULL,
  `fecha_envio` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `mensajes`
--

INSERT INTO `mensajes` (`id`, `conversacion_id`, `emisor_id`, `contenido`, `fecha_envio`) VALUES
(1, 1, 1, 'Hola, ¿el smartphone tiene garantía?', '2026-04-19 01:00:04'),
(2, 1, 3, 'Sí, 2 años de garantía oficial.', '2026-04-19 01:00:04'),
(3, 1, 1, 'Perfecto, ¿lo tienes disponible?', '2026-04-19 01:00:04'),
(4, 1, 3, 'Sí, envío inmediato.', '2026-04-19 01:00:04'),
(5, 2, 2, '¿La camiseta es de talla M?', '2026-04-19 01:00:04'),
(6, 2, 4, 'Sí, exacta. Color azul marino.', '2026-04-19 01:00:04'),
(7, 3, 2, '¿La bicicleta sigue disponible?', '2026-04-19 01:00:04'),
(8, 3, 3, 'Lo siento, ya se vendió.', '2026-04-19 01:00:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `vendedor_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `estado` varchar(20) DEFAULT 'disponible',
  `ubicacion` varchar(150) DEFAULT NULL,
  `fecha_publicacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `titulo`, `descripcion`, `precio`, `vendedor_id`, `categoria_id`, `estado`, `ubicacion`, `fecha_publicacion`, `fecha_actualizacion`) VALUES
(1, 'Smartphone XYZ', 'Último modelo con 128GB y cámara 50MP', 299.99, 3, 1, 'disponible', 'Madrid', '2026-04-19 01:00:04', NULL),
(2, 'Auriculares Bluetooth', 'Cancelación de ruido, 20h de batería', 49.99, 3, 1, 'disponible', 'Barcelona', '2026-04-19 01:00:04', NULL),
(3, 'Camiseta Deportiva', '100% algodón, talla M', 15.99, 4, 2, 'disponible', 'Valencia', '2026-04-19 01:00:04', NULL),
(4, 'Juego de Sartenes', 'Antiaderente, 3 piezas', 39.99, 4, 3, 'disponible', 'Sevilla', '2026-04-19 01:00:04', NULL),
(5, 'Bicicleta Montaña', 'Ruedas 26\", cambios Shimano', 450.00, 3, 4, 'vendido', 'Bilbao', '2026-04-19 01:00:04', NULL),
(6, 'Libro \"Aprender SQL\"', 'Guía práctica para principiantes', 29.99, 4, 5, 'disponible', 'Málaga', '2026-04-19 01:00:04', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol` varchar(20) NOT NULL DEFAULT 'cliente',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `contrasena`, `telefono`, `rol`, `fecha_creacion`) VALUES
(1, 'Carlos', 'carlos@email.com', '$2b$10$yX031XT2q2xAr1Mu1Q4u7ufvDxECO.T/UkvM8caIYM6ZXuHT9W0QW', '111222333', 'cliente', '2026-04-19 01:00:04'),
(2, 'Ana Martínez', 'ana@email.com', '$2b$10$yX031XT2q2xAr1Mu1Q4u7ufvDxECO.T/UkvM8caIYM6ZXuHT9W0QW', '600333444', 'cliente', '2026-04-19 01:00:04'),
(3, 'Juan Pérez', 'juan@email.com', '$2b$10$yX031XT2q2xAr1Mu1Q4u7ufvDxECO.T/UkvM8caIYM6ZXuHT9W0QW', '600555666', 'vendedor', '2026-04-19 01:00:04'),
(4, 'María Gómez', 'maria@email.com', '$2b$10$yX031XT2q2xAr1Mu1Q4u7ufvDxECO.T/UkvM8caIYM6ZXuHT9W0QW', '600777888', 'vendedor', '2026-04-19 01:00:04'),
(6, 'Guillermo Actualizado', 'nuevo@amazon.com', '$2b$10$0Dcms.RYhtLhICridMnfhuChiLUjKY2UyhQircqJVRFcw6bl/2Ghu', '111222333', 'cliente', '2026-04-19 01:00:52'),
(7, 'Guillermo', 'admin@asdfasdf.com', '$2b$10$yX031XT2q2xAr1Mu1Q4u7ufvDxECO.T/UkvM8caIYM6ZXuHT9W0QW', '999888777', 'cliente', '2026-04-19 01:07:08');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `usuarios_publicos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `usuarios_publicos` (
`id` int(11)
,`nombre` varchar(100)
,`correo` varchar(150)
,`telefono` varchar(20)
,`rol` varchar(20)
,`fecha_creacion` timestamp
);

-- --------------------------------------------------------

--
-- Estructura para la vista `usuarios_publicos`
--
DROP TABLE IF EXISTS `usuarios_publicos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `usuarios_publicos`  AS SELECT `usuarios`.`id` AS `id`, `usuarios`.`nombre` AS `nombre`, `usuarios`.`correo` AS `correo`, `usuarios`.`telefono` AS `telefono`, `usuarios`.`rol` AS `rol`, `usuarios`.`fecha_creacion` AS `fecha_creacion` FROM `usuarios` ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `compras`
--
ALTER TABLE `compras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_compras_producto` (`producto_id`),
  ADD KEY `fk_compras_comprador` (`comprador_id`),
  ADD KEY `fk_compras_vendedor` (`vendedor_id`);

--
-- Indices de la tabla `conversaciones`
--
ALTER TABLE `conversaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_conversacion_producto_comprador` (`producto_id`,`comprador_id`),
  ADD KEY `fk_conversaciones_comprador` (`comprador_id`),
  ADD KEY `fk_conversaciones_vendedor` (`vendedor_id`);

--
-- Indices de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_favorito_usuario_producto` (`usuario_id`,`producto_id`),
  ADD KEY `fk_favoritos_producto` (`producto_id`);

--
-- Indices de la tabla `imagenes_producto`
--
ALTER TABLE `imagenes_producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_imagenes_producto` (`producto_id`);

--
-- Indices de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_mensajes_conversacion` (`conversacion_id`),
  ADD KEY `fk_mensajes_emisor` (`emisor_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_productos_titulo` (`titulo`),
  ADD KEY `idx_productos_categoria` (`categoria_id`),
  ADD KEY `idx_productos_vendedor` (`vendedor_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `compras`
--
ALTER TABLE `compras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `conversaciones`
--
ALTER TABLE `conversaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `imagenes_producto`
--
ALTER TABLE `imagenes_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `compras`
--
ALTER TABLE `compras`
  ADD CONSTRAINT `fk_compras_comprador` FOREIGN KEY (`comprador_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `fk_compras_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `fk_compras_vendedor` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `conversaciones`
--
ALTER TABLE `conversaciones`
  ADD CONSTRAINT `fk_conversaciones_comprador` FOREIGN KEY (`comprador_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `fk_conversaciones_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `fk_conversaciones_vendedor` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `fk_favoritos_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `fk_favoritos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `imagenes_producto`
--
ALTER TABLE `imagenes_producto`
  ADD CONSTRAINT `fk_imagenes_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD CONSTRAINT `fk_mensajes_conversacion` FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_mensajes_emisor` FOREIGN KEY (`emisor_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  ADD CONSTRAINT `fk_productos_vendedor` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
