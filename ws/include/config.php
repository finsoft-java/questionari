<?php 

/* docker
define('DB_HOST', 'db');
define('DB_USER', 'user');
define('DB_PASS', 'user');
define('DB_NAME', 'questionari');
*/

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'questionari');

define('JWT_SECRET_KEY', 'my very very secret key');

define('AD_SERVER', 'ldap://domaincontroller.mydomain.com');
define('AD_DOMAIN', 'mydomain');
define('AD_BASE_DN', "dc=MYDOMAIN,dc=COM");
define('AD_FILTER', '(&(objectCategory=person)(samaccountname=*))');
define('AD_USERNAME', 'USER@DOMAIN.COM');
define('AD_PASSWORD', 'password');

?>