<?php

// Per i test: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub21lX3V0ZW50ZSI6ImZpbnNvZnQiLCJub21lIjoiTWFyaW8iLCJjb2dub21lIjoiUm9zc2kiLCJlbWFpbCI6ImZpbnNvZnRAZXhhbXBsZS5jb20iLCJydW9sbyI6IjIiLCJydW9sb19kZWMiOiJBbW1pbmlzdHJhdG9yZSJ9.uGM9xHtv8dYMrjPL5suIh8I2gY1lOPaZ7QNtXsBJ45A

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
include("./include/all.php");
$con = connect();

$user = '';
$postdata = file_get_contents("php://input");

$request = json_decode($postdata);

if($request != ''){
    $username = $request->username;
    $password = $request->password;
    $user = check_and_load_user($username, $password);
}

if ($user) {
    load_user_role($user);
    try {
        $user->username = JWT::encode($user, JWT_SECRET_KEY);
        $user->login = date("Y-m-d H:i:s");
        echo json_encode(['value' => $user]);
    } catch(Exception $e) {
        print_error(403, $e->getMessage());
    } catch (Error $e) {
        print_error(403, $e->getMessage());
     }
   
} else {
    session_unset();
    print_error(403, "Invalid credentials");
}

function check_and_load_user($username, $pwd) {
    // TODO LDAP connection....

    /*
    
        $adServer = "ldap://domaincontroller.mydomain.com";

        $ldap = ldap_connect($adServer);
        $username = $_POST['username'];
        $password = $_POST['password'];

        $ldaprdn = 'mydomain' . "\\" . $username;

        ldap_set_option($ldap, LDAP_OPT_PROTOCOL_VERSION, 3);
        ldap_set_option($ldap, LDAP_OPT_REFERRALS, 0);

        $bind = @ldap_bind($ldap, $ldaprdn, $password);

        if ($bind) {
            $filter="(sAMAccountName=$username)";
            $result = ldap_search($ldap,"dc=MYDOMAIN,dc=COM",$filter);
            ldap_sort($ldap,$result,"sn");
            $info = ldap_get_entries($ldap, $result);
            for ($i=0; $i<$info["count"]; $i++)
            {
                if($info['count'] > 1)
                    break;
                echo "<p>You are accessing <strong> ". $info[$i]["sn"][0] .", " . $info[$i]["givenname"][0] ."</strong><br /> (" . $info[$i]["samaccountname"][0] .")</p>\n";
                echo '<pre>';
                var_dump($info);
                echo '</pre>';
                $userDn = $info[$i]["distinguishedname"][0]; 
            }
            @ldap_close($ldap);
        } else {
            $msg = "Invalid email address / password";
            echo $msg;
        }
        
    */
    if ($username == 'ale.b' and $pwd == 'ale.b') {
        $user = new Utente();
        $user->nome_utente = $username;
        $user->nome = 'Alessandro';
        $user->cognome = 'Barsanti';
        $user->email = 'alessandrobarsanti6@gmail.com';

        return $user;
    }elseif ($username == 'luca.vercelli' and $pwd == 'luca.vercelli') {
        $user = new Utente();
        $user->nome_utente = $username;
        $user->nome = 'Luca';
        $user->cognome = 'Vercelli';
        $user->email = 'l.vercelli@finsoft.it';

        return $user;
    }else if ($username == 'finsoft' and $pwd == 'finsoft') {
        $user = new Utente();
        $user->nome_utente = $username;
        $user->nome = 'Mario';
        $user->cognome = 'Rossi';
        $user->email = 'finsoft@example.com';

        return $user;
    } else {
        //non usiamo il 401 perchè va in reload la pagina
        http_response_code(403);
        $user = '';
        return $user;
    }
}

/**
Se l'utente è già censito su DB, ne carica il ruolo
Altrimenti lo salva su DB con ruolo '0' (utente normale)
*/
function load_user_role(&$user) {
    global $RUOLO, $utenteManager;
    
    $user_su_db = $utenteManager->get_utente($user->nome_utente);
    if ($user_su_db) {
        $user->ruolo = $user_su_db->ruolo;
        $user->ruolo_dec = $user_su_db->ruolo_dec;
    } else {
        $user->ruolo = '0';
        $user->ruolo_dec = $RUOLO[$user_su_db->ruolo_dec];
        
        $user_su_db = new Utente();
        $user_su_db->username = $user->nome_utente;
        $user_su_db->nome = $user->nome;
        $user_su_db->cognome = $user->cognome;
        $user_su_db->email = $user->email;
        $user_su_db->ruolo = $user->ruolo;
        $utenteManager->crea($user_su_db);
    }
}


?>