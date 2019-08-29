<?php 


header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: OPTIONS,GET,PUT,POST,DELETE");
header("Access-Control-Allow-Headers: Accept,Content-Type,Authorization");

include("config.php");
include("costanti.php");
include("JWT.php");
include("functions.php");
include("class_utente.php");
include("class_progetto.php");
include("class_questionario.php");
include("class_sezione.php");
include("class_questionario_compilato.php");
include("xlsxwriter.class.php");
