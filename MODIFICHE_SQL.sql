ALTER TABLE `domande` CHANGE `descrizione` `descrizione` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;
ALTER TABLE `risposte_ammesse` CHANGE `descrizione` `descrizione` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;
--metodo più veloce per il controllo sull'email duplicata
ALTER TABLE `utenti` CHANGE `email` `email` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;
ALTER TABLE `utenti` ADD UNIQUE `email` (`email`);
ALTER TABLE `progetti` ADD UNIQUE `titolo` (`titolo`);
ALTER TABLE `questionari` ADD UNIQUE `titolo` (`titolo`);
ALTER TABLE `utenti` ADD `from_ldap` VARCHAR(1) NOT NULL DEFAULT '0' AFTER `ruolo`, ADD `password_enc` VARCHAR(32) NULL COMMENT 'md5' AFTER `from_ldap`;