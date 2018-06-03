<?php
define('LOG_DIR', $_SERVER['DOCUMENT_ROOT'].'/ato/log/ato_test.log');
define('LOG_AUX', $_SERVER['DOCUMENT_ROOT'].'/ato/log/atoaux_test.log');
define('HTTP_HOST', $_SERVER['HTTP_HOST']);

$db_settings = array(
    'host' => 'localhost',
    'user' => 'ato',
    'pass' => 'Csd321',
    'db' => 'mysql',
    'port' => 3306,
    'charset' => 'utf8',
);
