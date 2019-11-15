export class User {
    username: string;
    nome: string;
    cognome: string;
    email: string;
    ruolo: string;
    ruolo_dec: string;
    from_ldap: boolean;
    // Questi servono per gestire la modifica via web
    password?:string;    
    editing?: boolean;
    creating?: boolean;
}

export class UserRuoli {
    nome_utente: string;
    responsabileL1: boolean;
    responsabileL2: boolean;
    utenteFinale: boolean;
    id_progetto: number;
    editing?: boolean;
}