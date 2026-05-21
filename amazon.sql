-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:33065
-- Tiempo de generación: 21-05-2026 a las 06:02:51
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
(1, 1, 3, 4, 599.00, 'pendiente', '2026-05-09 00:04:35'),
(2, 2, 5, 4, 25.50, 'pendiente', '2026-05-09 00:04:35'),
(3, 3, 5, 4, 89.90, 'pendiente', '2026-05-09 00:14:36'),
(4, 3, 3, 4, 89.90, 'pendiente', '2026-05-09 00:14:36'),
(5, 3, 3, 4, 89.90, 'pendiente', '2026-05-09 00:17:48'),
(6, 1, 3, 2, 599.00, 'pendiente', '2026-05-09 00:32:25'),
(7, 4, 3, 4, 10.00, 'pendiente', '2026-05-09 00:32:25'),
(8, 1, 3, 4, 599.00, 'pendiente', '2026-05-09 01:17:41'),
(9, 1, 5, 2, 599.00, 'pendiente', '2026-05-09 01:17:41'),
(10, 2, 3, 4, 25.50, 'pendiente', '2026-05-09 01:17:41'),
(11, 2, 3, 4, 25.50, 'entregado', '2026-05-09 01:19:35'),
(12, 2, 3, 4, 25.50, 'no entregado', '2026-05-09 01:19:35'),
(13, 2, 3, 4, 25.50, 'completado', '2026-05-09 01:19:35'),
(14, 4, 3, 4, 10.50, 'completado', '2026-05-15 02:36:13'),
(15, 3, 3, 2, 89.90, 'pendiente', '2026-05-15 02:36:13'),
(16, 1, 3, 2, 599.00, 'pendiente', '2026-05-21 05:35:13'),
(17, 2, 3, 2, 25.50, 'pendiente', '2026-05-21 05:35:13'),
(18, 2, 3, 2, 25.50, 'pendiente', '2026-05-21 05:35:13'),
(19, 4, 3, 4, 10.50, 'completado', '2026-05-21 03:05:55'),
(20, 4, 3, 4, 10.50, 'pendiente', '2026-05-21 03:21:44');

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
(6, 4, 'https://multimarcas.com.bo/storage/images/productos/252-0-1712076251.jpg');

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
  `img_url` text DEFAULT NULL,
  `fecha_publicacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `titulo`, `descripcion`, `precio`, `vendedor_id`, `categoria_id`, `estado`, `ubicacion`, `img_url`, `fecha_publicacion`, `fecha_actualizacion`) VALUES
(1, 'Smartphone Alpha G1', 'Potente procesador y cámara de 48MP.', 599.00, 2, 1, 'disponible', 'La Paz', 'https://image.made-in-china.com/202f0j00OHReJTCKrZot/6-56-Inches-Cell-Phone-Android-12-Mobile-Phone-Uniwa-X19s-4G-Android-Global-Version-Smartphone.webp', '2026-05-08 23:58:34', '2026-05-21 03:16:39'),
(2, 'Camiseta Pro Breath', 'Tela transpirable ideal para deportes intensos.', 25.50, 2, 2, 'disponible', 'Cochabamba', 'https://fairplaybo.vtexassets.com/arquivos/ids/585182/779190-01.jpg?v=638797160337800000', '2026-05-08 23:58:34', '2026-05-21 03:16:44'),
(3, 'Cafetera Express Home', 'Café perfecto en menos de 2 minutos.', 89.90, 2, 3, 'disponible', 'Sucre', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbtr_q-iUUrHc_4Vqsq18NsYD_wh876be0WQ&s', '2026-05-08 23:58:34', '2026-05-21 03:16:48'),
(4, 'Libro de fabulas Esopo', '12 cuentos', 10.50, 4, 5, 'no disponible', 'Pando', 'https://images.cdn2.buscalibre.com/fit-in/360x360/7e/b3/7eb3e5916d2fcd844888da213fe0ba40.jpg', '2026-05-09 00:30:48', '2026-05-21 03:47:18');

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
(1, 'Admin', 'admin@amazon.com', '$2b$10$Q5yLDQjMAGPPlJf0DAZx.uud0EUqNzn3FQAPGUltBAy6DeMHnDI6K', '555-0101', 'admin', '2026-05-08 23:58:34'),
(2, 'Juan Velazco', 'juan@ejemplo.com', '$2b$10$0MWbvpOdN2.LlvZ8EWo6ve5I0Ys82D/Zr9bPexeAuAwBfNCC/Sxmq', '555-0102', 'vendedor', '2026-05-08 23:58:34'),
(3, 'Kevin Sancalli', 'kevin@ejemplo.com', '$2b$10$D44Su3JONcn3ChgQva807eUzm2XduapDpCwZUiNdgyE8uPSJYI9aO', '44997766', 'cliente', '2026-05-09 00:04:07'),
(4, 'Marco Conde', 'marco@ejemplo.com', '$2b$10$tUxO7kcnu8ytPiBeGwSA4e80hs29EtsceFuaYw7.a.BI3S./His5m', '77996622', 'vendedor', '2026-05-09 00:15:43'),
(5, 'Juan Perez', 'juan1@ejemplo.com', '$2b$10$OKT1uqF7WdWxwI6BCRTEAORGncPItSNX5kfvn/2wL/4ADErIsbKjO', '99445566', 'cliente', '2026-05-09 00:26:15'),
(6, 'Pablo Aliaga', 'pablo@ejemplo.com', '$2b$10$Q5yLDQjMAGPPlJf0DAZx.uud0EUqNzn3FQAPGUltBAy6DeMHnDI6K', '77559133', 'cliente', '2026-05-20 21:19:46'),
(7, 'Rosa Luna', 'rosa@ejemplo.com', '$2b$10$0MWbvpOdN2.LlvZ8EWo6ve5I0Ys82D/Zr9bPexeAuAwBfNCC/Sxmq', '12345678', 'cliente', '2026-05-20 21:35:11');

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
  ADD KEY `fk_compras_comprador` (`comprador_id`),
  ADD KEY `fk_compras_producto` (`producto_id`),
  ADD KEY `fk_compras_vendedor` (`vendedor_id`);

--
-- Indices de la tabla `imagenes_producto`
--
ALTER TABLE `imagenes_producto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_imagenes_producto` (`producto_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `imagenes_producto`
--
ALTER TABLE `imagenes_producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
-- Filtros para la tabla `imagenes_producto`
--
ALTER TABLE `imagenes_producto`
  ADD CONSTRAINT `fk_imagenes_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

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
