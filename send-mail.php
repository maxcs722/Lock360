<?php
/**
 * send-mail.php — Lock360
 * Procesa el formulario de contacto (de index.html y/o contacto.html),
 * envía el correo a contacto.lock360@gmail.com y redirige a gracias.html.
 *
 * Requiere que la función mail() de PHP esté habilitada en el hosting
 * (la mayoría de los hostings compartidos la traen activa por defecto).
 * Si los correos llegan como spam o no llegan, revisa las notas al
 * final de este archivo.
 */

// Correo que recibe las solicitudes
$to = "contacto.lock360@gmail.com";

// Dominio del sitio (usado en el remitente "From"). Ajusta si tu dominio es distinto.
$dominio = "lock360.cl";

function clean($str) {
    $str = trim($str);
    // Evita inyección de cabeceras de correo (header injection)
    $str = str_replace(array("\r", "\n", "%0a", "%0d", "%0A", "%0D"), '', $str);
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

// Página a la que se debe volver si algo falla (según el formulario de origen)
$origen = (isset($_POST['origen']) && $_POST['origen'] === 'index') ? 'index.html' : 'contacto.html';

// Solo se aceptan solicitudes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: " . $origen);
    exit;
}

// Campo trampa (honeypot) anti-spam: invisible para personas, los bots suelen rellenarlo.
// Si viene con contenido, se descarta la solicitud sin avisar (se redirige como si fuera exitosa).
if (!empty($_POST['website'])) {
    header("Location: gracias.html");
    exit;
}

$nombre   = isset($_POST['nombre'])   ? clean($_POST['nombre'])   : '';
$empresa  = isset($_POST['empresa'])  ? clean($_POST['empresa'])  : '';
$email    = isset($_POST['email'])    ? trim($_POST['email'])     : '';
$telefono = isset($_POST['telefono']) ? clean($_POST['telefono']) : '';
$servicio = isset($_POST['servicio']) ? clean($_POST['servicio']) : '';
$mensaje  = isset($_POST['mensaje'])  ? trim(str_replace(array("\r\n", "\r"), "\n", $_POST['mensaje'])) : '';

// Validación server-side (independiente de la validación en el navegador)
$errores = array();
if ($nombre === '') $errores[] = 'nombre';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errores[] = 'email';
if ($mensaje === '') $errores[] = 'mensaje';

if (!empty($errores)) {
    header("Location: " . $origen . "?error=1#contacto");
    exit;
}

$mensaje_limpio = htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8');

$asunto = "=?UTF-8?B?" . base64_encode("Solicitud de propuesta - Lock360 (" . $servicio . ")") . "?=";

$cuerpo  = "Nueva solicitud recibida desde el sitio web de Lock360\n\n";
$cuerpo .= "Nombre: " . $nombre . "\n";
$cuerpo .= "Empresa: " . ($empresa !== '' ? $empresa : '-') . "\n";
$cuerpo .= "Correo: " . $email . "\n";
$cuerpo .= "Teléfono: " . ($telefono !== '' ? $telefono : '-') . "\n";
$cuerpo .= "Servicio de interés: " . ($servicio !== '' ? $servicio : '-') . "\n\n";
$cuerpo .= "Mensaje:\n" . $mensaje_limpio . "\n";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: Lock360 Web <no-reply@" . $dominio . ">\r\n";
$headers .= "Reply-To: " . $nombre . " <" . $email . ">\r\n";

$enviado = @mail($to, $asunto, $cuerpo, $headers);

if ($enviado) {
    header("Location: gracias.html");
    exit;
} else {
    header("Location: " . $origen . "?error=1#contacto");
    exit;
}

/**
 * NOTAS PARA LA PUESTA EN PRODUCCIÓN
 * -----------------------------------
 * 1. Este script usa la función nativa mail() de PHP. Funciona en la
 *    mayoría de los hostings compartidos (cPanel, etc.), pero algunos
 *    proveedores de correo (Gmail, Outlook) pueden marcar estos envíos
 *    como spam si el dominio del hosting no coincide con el dominio
 *    real o no tiene SPF/DKIM configurado.
 * 2. Si los correos no llegan o caen en spam, la alternativa más
 *    confiable es enviar por SMTP autenticado (por ejemplo con la
 *    librería PHPMailer y una cuenta de Gmail/Zoho/SendGrid). Puedo
 *    adaptar este mismo archivo a SMTP si lo necesitas.
 * 3. Verifica que tu hosting permita la función mail() (algunos
 *    proveedores gratuitos la desactivan).
 * 4. Si en algún momento conectas el formulario de index.html a este
 *    mismo script, agrega en ese formulario:
 *      action="send-mail.php" method="POST"
 *    y dentro del <form>:
 *      <input type="hidden" name="origen" value="index" />
 *    (en contacto.html ya quedó con value="contacto").
 */
