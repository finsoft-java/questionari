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

define('AD_SERVER', 'ldap://osai.loc');
define('AD_DOMAIN', 'OSAI.LOC');
define('AD_BASE_DN', "dc=OSAI,dc=LOC");
define('AD_FILTER', '(&(|(objectclass=person))(|(|(memberof=CN=OSAI-IT Users,OU=OU Osai Groups,DC=osai,DC=loc)(primaryGroupID=1202))(|(memberof=CN=OSAI-DE Users,OU=OU Osai Groups,DC=osai,DC=loc)(primaryGroupID=2625))(|(memberof=CN=OSAI-CN Users,OU=OU Osai Groups,DC=osai,DC=loc)(primaryGroupID=3233))(|(memberof=CN=OSAI-US Users,OU=OU Osai Groups,DC=osai,DC=loc)(primaryGroupID=4426))))');
define('AD_USERNAME', 'surveyosai@OSAI.LOC');
define('AD_PASSWORD', 's0fu3Y2o19!');

?>