ALTER TABLE `domande` CHANGE `descrizione` `descrizione` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;
ALTER TABLE `risposte_ammesse` CHANGE `descrizione` `descrizione` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;
--metodo più veloce per il controllo sull'email duplicata
ALTER TABLE `utenti` CHANGE `email` `email` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;
ALTER TABLE `questionari`.`utenti` ADD UNIQUE `email` (`email`);