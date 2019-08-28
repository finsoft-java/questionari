-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Creato il: Lug 24, 2019 alle 08:29
-- Versione del server: 10.1.40-MariaDB-1~bionic
-- Versione PHP: 7.2.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `questionari`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `domande`
--

CREATE TABLE `domande` (
  `id_questionario` int(10) NOT NULL,
  `progressivo_sezione` int(10) NOT NULL,
  `progressivo_domanda` int(10) NOT NULL,
  `descrizione` varchar(1000) NOT NULL,
  `obbligatorieta` varchar(1) NOT NULL,
  `coeff_valutazione` float NOT NULL,
  `html_type` varchar(20) DEFAULT NULL,
  `html_pattern` varchar(255) DEFAULT NULL,
  `html_min` float DEFAULT NULL,
  `html_max` float DEFAULT NULL,
  `html_maxlenght` int(10) DEFAULT NULL,
  `rimescola` char(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `domande`
--

INSERT INTO `domande` (`id_questionario`, `progressivo_sezione`, `progressivo_domanda`, `descrizione`, `obbligatorieta`, `coeff_valutazione`, `html_type`, `html_pattern`, `html_min`, `html_max`, `html_maxlenght`, `rimescola`) VALUES
(1, 1, 1, 'Era tutto buono?', '1', 1, NULL, NULL, NULL, NULL, NULL, '0'),
(1, 1, 2, 'Hai dei consigli?', '1', 1, '0', NULL, NULL, NULL, NULL, '0'),
(1, 2, 1, 'Quanto valuti l\'organizzazione da 1 a 5?', '1', 1, NULL, NULL, NULL, NULL, NULL, '0'),
(1, 3, 1, 'Era tutto buono?', '1', 1, NULL, NULL, NULL, NULL, NULL, '0'),
(1, 3, 2, 'Hai dei consigli?', '1', 1, '0', NULL, NULL, NULL, NULL, '0');

-- --------------------------------------------------------

--
-- Struttura della tabella `progetti`
--

CREATE TABLE `progetti` (
  `id_progetto` int(10) NOT NULL,
  `titolo` varchar(500) NOT NULL,
  `stato` varchar(1) NOT NULL,
  `gia_compilato` char(1) NOT NULL DEFAULT '0',
  `utente_creazione` varchar(255) NOT NULL,
  `data_creazione` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `progetti`
--

INSERT INTO `progetti` (`id_progetto`, `titolo`, `stato`, `gia_compilato`, `utente_creazione`, `data_creazione`) VALUES
(2, 'Festa di Poldo', '1', '1', 'luca.vercelli', '2019-07-01 12:14:49'),
(4, 'concerto di natale', '0', '0', 'ale.b', '2019-07-08 10:12:28'),
(5, 'concerto di natale', '0', '0', 'ale.b', '2019-07-08 10:18:08');

-- --------------------------------------------------------

--
-- Struttura della tabella `progetti_questionari`
--

CREATE TABLE `progetti_questionari` (
  `id_progetto` int(10) NOT NULL,
  `id_questionario` int(10) NOT NULL,
  `tipo_questionario` char(1) NOT NULL,
  `gruppo_compilanti` varchar(1) DEFAULT NULL,
  `gruppo_valutati` varchar(1) DEFAULT NULL,
  `autovalutazione` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `progetti_questionari`
--

INSERT INTO `progetti_questionari` (`id_progetto`, `id_questionario`, `tipo_questionario`, `gruppo_compilanti`, `gruppo_valutati`, `autovalutazione`) VALUES
(2, 1, '0', '0', '1', '0');

-- --------------------------------------------------------

--
-- Struttura della tabella `progetti_utenti`
--

CREATE TABLE `progetti_utenti` (
  `id_progetto` int(10) NOT NULL,
  `nome_utente` varchar(255) NOT NULL,
  `funzione` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `progetti_utenti`
--

INSERT INTO `progetti_utenti` (`id_progetto`, `nome_utente`, `funzione`) VALUES
(2, 'ale.b', '0'),
(2, 'finsoft', '0'),
(2, 'luca.vercelli', '1');

-- --------------------------------------------------------

--
-- Struttura della tabella `questionari`
--

CREATE TABLE `questionari` (
  `id_questionario` int(10) NOT NULL,
  `titolo` varchar(255) NOT NULL,
  `stato` varchar(1) NOT NULL,
  `gia_compilato` char(1) NOT NULL DEFAULT '0',
  `flag_comune` varchar(1) NOT NULL,
  `utente_creazione` varchar(255) DEFAULT NULL,
  `data_creazione` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `questionari`
--

INSERT INTO `questionari` (`id_questionario`, `titolo`, `stato`, `gia_compilato`, `flag_comune`, `utente_creazione`, `data_creazione`) VALUES
(1, 'Verifica post-festa', '1', '1', '0', 'luca.vercelli', '2019-07-01 12:14:28');

-- --------------------------------------------------------

--
-- Struttura della tabella `questionari_compilati`
--

CREATE TABLE `questionari_compilati` (
  `progressivo_quest_comp` int(10) NOT NULL,
  `id_progetto` int(10) NOT NULL,
  `id_questionario` int(10) NOT NULL,
  `stato` varchar(1) NOT NULL,
  `utente_compilazione` varchar(255) NOT NULL,
  `data_compilazione` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `questionari_compilati`
--

INSERT INTO `questionari_compilati` (`progressivo_quest_comp`, `id_progetto`, `id_questionario`, `stato`, `utente_compilazione`, `data_compilazione`) VALUES
(3, 2, 1, '0', 'ale.b', '2019-07-05 08:36:10'),
(10, 2, 1, '0', 'finsoft', '2019-07-24 08:23:39');

-- --------------------------------------------------------

--
-- Struttura della tabella `risposte_ammesse`
--

CREATE TABLE `risposte_ammesse` (
  `id_questionario` int(10) NOT NULL,
  `progressivo_sezione` int(10) NOT NULL,
  `progressivo_domanda` int(10) NOT NULL,
  `progressivo_risposta` int(10) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `valore` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `risposte_ammesse`
--

INSERT INTO `risposte_ammesse` (`id_questionario`, `progressivo_sezione`, `progressivo_domanda`, `progressivo_risposta`, `descrizione`, `valore`) VALUES
(1, 1, 1, 1, 'Sì', 1),
(1, 1, 1, 2, 'No', 0),
(1, 2, 1, 1, 'insufficiente', 1),
(1, 2, 1, 2, 'scarso', 2),
(1, 2, 1, 3, 'sufficiente', 3),
(1, 2, 1, 4, 'buono', 4),
(1, 2, 1, 5, 'ottimo', 5),
(1, 3, 1, 1, 'Sì', 1),
(1, 3, 1, 2, 'No', 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `risposte_quest_compilati`
--

CREATE TABLE `risposte_quest_compilati` (
  `progressivo_quest_comp` int(10) NOT NULL,
  `progressivo_sezione` int(10) NOT NULL,
  `progressivo_domanda` int(10) NOT NULL,
  `nome_utente_valutato` varchar(255) NOT NULL,
  `progressivo_risposta` int(10) DEFAULT NULL,
  `note` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `risposte_quest_compilati`
--

INSERT INTO `risposte_quest_compilati` (`progressivo_quest_comp`, `progressivo_sezione`, `progressivo_domanda`, `nome_utente_valutato`, `progressivo_risposta`, `note`) VALUES
(3, 1, 1, 'luca.vercelli', NULL, NULL),
(3, 1, 2, 'luca.vercelli', NULL, NULL),
(3, 2, 1, 'luca.vercelli', NULL, NULL),
(3, 3, 1, 'luca.vercelli', NULL, NULL),
(3, 3, 2, 'luca.vercelli', NULL, NULL),
(10, 1, 1, 'ale.b', NULL, NULL),
(10, 1, 1, 'finsoft', NULL, NULL),
(10, 1, 1, 'luca.vercelli', NULL, NULL),
(10, 1, 2, 'ale.b', NULL, NULL),
(10, 1, 2, 'finsoft', NULL, NULL),
(10, 1, 2, 'luca.vercelli', NULL, NULL),
(10, 2, 1, 'ale.b', NULL, NULL),
(10, 2, 1, 'finsoft', NULL, NULL),
(10, 2, 1, 'luca.vercelli', NULL, NULL),
(10, 3, 1, 'ale.b', NULL, NULL),
(10, 3, 1, 'finsoft', NULL, NULL),
(10, 3, 1, 'luca.vercelli', NULL, NULL),
(10, 3, 2, 'ale.b', NULL, NULL),
(10, 3, 2, 'finsoft', NULL, NULL),
(10, 3, 2, 'luca.vercelli', NULL, NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `sezioni`
--

CREATE TABLE `sezioni` (
  `id_questionario` int(10) NOT NULL,
  `progressivo_sezione` int(10) NOT NULL,
  `titolo` varchar(255) NOT NULL,
  `descrizione` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `sezioni`
--

INSERT INTO `sezioni` (`id_questionario`, `progressivo_sezione`, `titolo`, `descrizione`) VALUES
(1, 1, 'Cibo', ''),
(1, 2, 'Organizzazione', ''),
(1, 3, 'Cibo', '');

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti`
--

CREATE TABLE `utenti` (
  `username` varchar(255) NOT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `cognome` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `ruolo` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `utenti`
--

INSERT INTO `utenti` (`username`, `nome`, `cognome`, `email`, `ruolo`) VALUES
('ale.b', 'Alessandro', 'Barsanti', NULL, '1'),
('finsoft', 'Mario', 'Rossi', 'finsoft@example.com', '2'),
('luca.vercelli', 'Luca', 'Vercelli', '', '1');

-- --------------------------------------------------------

--
-- Struttura stand-in per le viste `v_progetti_questionari`
-- (Vedi sotto per la vista effettiva)
--
CREATE TABLE `v_progetti_questionari` (
`id_progetto` int(10)
,`titolo_progetto` varchar(500)
,`stato_progetto` varchar(1)
,`ut_creaz_progetto` varchar(255)
,`data_creaz_progetto` datetime
,`id_questionario` int(10)
,`titolo_questionario` varchar(255)
,`stato_questionario` varchar(1)
,`flag_comune` varchar(1)
,`ut_creaz_questionario` varchar(255)
,`data_creaz_questionario` datetime
,`tipo_questionario` char(1)
,`gruppo_compilanti` varchar(1)
,`gruppo_valutati` varchar(1)
,`autovalutazione` varchar(1)
);

-- --------------------------------------------------------

--
-- Struttura stand-in per le viste `v_progetti_questionari_utenti`
-- (Vedi sotto per la vista effettiva)
--
CREATE TABLE `v_progetti_questionari_utenti` (
`id_progetto` int(10)
,`titolo_progetto` varchar(500)
,`stato_progetto` varchar(1)
,`ut_creaz_progetto` varchar(255)
,`data_creaz_progetto` datetime
,`id_questionario` int(10)
,`titolo_questionario` varchar(255)
,`stato_questionario` varchar(1)
,`flag_comune` varchar(1)
,`ut_creaz_questionario` varchar(255)
,`data_creaz_questionario` datetime
,`tipo_questionario` char(1)
,`gruppo_compilanti` varchar(1)
,`gruppo_valutati` varchar(1)
,`autovalutazione` varchar(1)
,`nome_utente` varchar(255)
,`funzione` varchar(1)
);

-- --------------------------------------------------------

--
-- Struttura stand-in per le viste `v_questionari_compilabili_per_utente`
-- (Vedi sotto per la vista effettiva)
--
CREATE TABLE `v_questionari_compilabili_per_utente` (
`id_progetto` int(10)
,`titolo_progetto` varchar(500)
,`stato_progetto` varchar(1)
,`id_questionario` int(10)
,`titolo_questionario` varchar(255)
,`stato_questionario` varchar(1)
,`tipo_questionario` char(1)
,`gruppo_compilanti` varchar(1)
,`gruppo_valutati` varchar(1)
,`autovalutazione` varchar(1)
,`nome_utente` varchar(255)
,`funzione` varchar(1)
,`progressivo_quest_comp` int(10)
,`stato_quest_comp` varchar(1)
,`data_compilazione` datetime
);

-- --------------------------------------------------------

--
-- Struttura stand-in per le viste `v_questionari_domande`
-- (Vedi sotto per la vista effettiva)
--
CREATE TABLE `v_questionari_domande` (
`id_questionario` int(10)
,`progressivo_sezione` int(10)
,`progressivo_domanda` int(10)
);

-- --------------------------------------------------------

--
-- Struttura stand-in per le viste `v_ultimi_questionari_compilati`
-- (Vedi sotto per la vista effettiva)
--
CREATE TABLE `v_ultimi_questionari_compilati` (
`progressivo_quest_comp` int(10)
,`id_progetto` int(10)
,`id_questionario` int(10)
,`utente_compilazione` varchar(255)
,`stato` varchar(1)
,`data_compilazione` datetime
);

-- --------------------------------------------------------

--
-- Struttura per vista `v_progetti_questionari`
--
DROP TABLE IF EXISTS `v_progetti_questionari`;

CREATE ALGORITHM=UNDEFINED DEFINER=`user`@`%` SQL SECURITY DEFINER VIEW `v_progetti_questionari`  AS  select `p`.`id_progetto` AS `id_progetto`,`p`.`titolo` AS `titolo_progetto`,`p`.`stato` AS `stato_progetto`,`p`.`utente_creazione` AS `ut_creaz_progetto`,`p`.`data_creazione` AS `data_creaz_progetto`,`q`.`id_questionario` AS `id_questionario`,`q`.`titolo` AS `titolo_questionario`,`q`.`stato` AS `stato_questionario`,`q`.`flag_comune` AS `flag_comune`,`q`.`utente_creazione` AS `ut_creaz_questionario`,`q`.`data_creazione` AS `data_creaz_questionario`,`x`.`tipo_questionario` AS `tipo_questionario`,`x`.`gruppo_compilanti` AS `gruppo_compilanti`,`x`.`gruppo_valutati` AS `gruppo_valutati`,`x`.`autovalutazione` AS `autovalutazione` from ((`progetti` `p` join `progetti_questionari` `x` on((`x`.`id_progetto` = `p`.`id_progetto`))) join `questionari` `q` on((`q`.`id_questionario` = `x`.`id_questionario`))) ;

-- --------------------------------------------------------

--
-- Struttura per vista `v_progetti_questionari_utenti`
--
DROP TABLE IF EXISTS `v_progetti_questionari_utenti`;

CREATE ALGORITHM=UNDEFINED DEFINER=`user`@`%` SQL SECURITY DEFINER VIEW `v_progetti_questionari_utenti`  AS  select `p`.`id_progetto` AS `id_progetto`,`p`.`titolo` AS `titolo_progetto`,`p`.`stato` AS `stato_progetto`,`p`.`utente_creazione` AS `ut_creaz_progetto`,`p`.`data_creazione` AS `data_creaz_progetto`,`q`.`id_questionario` AS `id_questionario`,`q`.`titolo` AS `titolo_questionario`,`q`.`stato` AS `stato_questionario`,`q`.`flag_comune` AS `flag_comune`,`q`.`utente_creazione` AS `ut_creaz_questionario`,`q`.`data_creazione` AS `data_creaz_questionario`,`x`.`tipo_questionario` AS `tipo_questionario`,`x`.`gruppo_compilanti` AS `gruppo_compilanti`,`x`.`gruppo_valutati` AS `gruppo_valutati`,`x`.`autovalutazione` AS `autovalutazione`,`u`.`nome_utente` AS `nome_utente`,`u`.`funzione` AS `funzione` from (((`progetti` `p` join `progetti_questionari` `x` on((`x`.`id_progetto` = `p`.`id_progetto`))) join `progetti_utenti` `u` on((`u`.`id_progetto` = `p`.`id_progetto`))) join `questionari` `q` on((`q`.`id_questionario` = `x`.`id_questionario`))) ;

-- --------------------------------------------------------

--
-- Struttura per vista `v_questionari_compilabili_per_utente`
--
DROP TABLE IF EXISTS `v_questionari_compilabili_per_utente`;

CREATE ALGORITHM=UNDEFINED DEFINER=`user`@`%` SQL SECURITY DEFINER VIEW `v_questionari_compilabili_per_utente`  AS  select `p`.`id_progetto` AS `id_progetto`,`p`.`titolo` AS `titolo_progetto`,`p`.`stato` AS `stato_progetto`,`q`.`id_questionario` AS `id_questionario`,`q`.`titolo` AS `titolo_questionario`,`q`.`stato` AS `stato_questionario`,`x`.`tipo_questionario` AS `tipo_questionario`,`x`.`gruppo_compilanti` AS `gruppo_compilanti`,`x`.`gruppo_valutati` AS `gruppo_valutati`,`x`.`autovalutazione` AS `autovalutazione`,`u`.`nome_utente` AS `nome_utente`,`u`.`funzione` AS `funzione`,`v`.`progressivo_quest_comp` AS `progressivo_quest_comp`,`v`.`stato` AS `stato_quest_comp`,`v`.`data_compilazione` AS `data_compilazione` from ((((`progetti` `p` join `progetti_questionari` `x` on((`p`.`id_progetto` = `x`.`id_progetto`))) join `questionari` `q` on((`q`.`id_questionario` = `x`.`id_questionario`))) join `progetti_utenti` `u` on((`p`.`id_progetto` = `u`.`id_progetto`))) left join `v_ultimi_questionari_compilati` `v` on(((`v`.`id_progetto` = `x`.`id_progetto`) and (`v`.`id_questionario` = `x`.`id_questionario`) and (`v`.`utente_compilazione` = `u`.`nome_utente`)))) where ((`q`.`stato` > '0') and (`p`.`stato` > '0') and (`x`.`gruppo_compilanti` = `u`.`funzione`)) ;

-- --------------------------------------------------------

--
-- Struttura per vista `v_questionari_domande`
--
DROP TABLE IF EXISTS `v_questionari_domande`;

CREATE ALGORITHM=UNDEFINED DEFINER=`user`@`%` SQL SECURITY DEFINER VIEW `v_questionari_domande`  AS  select `q`.`id_questionario` AS `id_questionario`,`s`.`progressivo_sezione` AS `progressivo_sezione`,`d`.`progressivo_domanda` AS `progressivo_domanda` from ((`questionari` `q` join `sezioni` `s` on((`s`.`id_questionario` = `q`.`id_questionario`))) join `domande` `d` on(((`d`.`id_questionario` = `s`.`id_questionario`) and (`d`.`progressivo_sezione` = `s`.`progressivo_sezione`)))) ;

-- --------------------------------------------------------

--
-- Struttura per vista `v_ultimi_questionari_compilati`
--
DROP TABLE IF EXISTS `v_ultimi_questionari_compilati`;

CREATE ALGORITHM=UNDEFINED DEFINER=`user`@`%` SQL SECURITY DEFINER VIEW `v_ultimi_questionari_compilati`  AS  select max(`a`.`progressivo_quest_comp`) AS `progressivo_quest_comp`,`a`.`id_progetto` AS `id_progetto`,`a`.`id_questionario` AS `id_questionario`,`a`.`utente_compilazione` AS `utente_compilazione`,(select `b`.`stato` from `questionari_compilati` `b` where (`a`.`progressivo_quest_comp` = `b`.`progressivo_quest_comp`)) AS `stato`,(select `b`.`data_compilazione` from `questionari_compilati` `b` where (`a`.`progressivo_quest_comp` = `b`.`progressivo_quest_comp`)) AS `data_compilazione` from `questionari_compilati` `a` where (`a`.`stato` <> '2') group by `a`.`id_progetto`,`a`.`id_questionario`,`a`.`utente_compilazione` ;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `domande`
--
ALTER TABLE `domande`
  ADD PRIMARY KEY (`id_questionario`,`progressivo_sezione`,`progressivo_domanda`);

--
-- Indici per le tabelle `progetti`
--
ALTER TABLE `progetti`
  ADD PRIMARY KEY (`id_progetto`),
  ADD KEY `utente_creazione` (`utente_creazione`);

--
-- Indici per le tabelle `progetti_questionari`
--
ALTER TABLE `progetti_questionari`
  ADD PRIMARY KEY (`id_progetto`,`id_questionario`),
  ADD KEY `id_questionario` (`id_questionario`);

--
-- Indici per le tabelle `progetti_utenti`
--
ALTER TABLE `progetti_utenti`
  ADD PRIMARY KEY (`id_progetto`,`nome_utente`),
  ADD KEY `nome_utente` (`nome_utente`);

--
-- Indici per le tabelle `questionari`
--
ALTER TABLE `questionari`
  ADD PRIMARY KEY (`id_questionario`) USING BTREE,
  ADD KEY `utente_creazione` (`utente_creazione`);

--
-- Indici per le tabelle `questionari_compilati`
--
ALTER TABLE `questionari_compilati`
  ADD PRIMARY KEY (`progressivo_quest_comp`),
  ADD KEY `id_progetto` (`id_progetto`,`id_questionario`);

--
-- Indici per le tabelle `risposte_ammesse`
--
ALTER TABLE `risposte_ammesse`
  ADD PRIMARY KEY (`id_questionario`,`progressivo_sezione`,`progressivo_domanda`,`progressivo_risposta`);

--
-- Indici per le tabelle `risposte_quest_compilati`
--
ALTER TABLE `risposte_quest_compilati`
  ADD PRIMARY KEY (`progressivo_quest_comp`,`progressivo_sezione`,`progressivo_domanda`,`nome_utente_valutato`);

--
-- Indici per le tabelle `sezioni`
--
ALTER TABLE `sezioni`
  ADD PRIMARY KEY (`id_questionario`,`progressivo_sezione`);

--
-- Indici per le tabelle `utenti`
--
ALTER TABLE `utenti`
  ADD PRIMARY KEY (`username`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `progetti`
--
ALTER TABLE `progetti`
  MODIFY `id_progetto` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT per la tabella `questionari`
--
ALTER TABLE `questionari`
  MODIFY `id_questionario` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `questionari_compilati`
--
ALTER TABLE `questionari_compilati`
  MODIFY `progressivo_quest_comp` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `domande`
--
ALTER TABLE `domande`
  ADD CONSTRAINT `domande_ibfk_1` FOREIGN KEY (`id_questionario`,`progressivo_sezione`) REFERENCES `sezioni` (`id_questionario`, `progressivo_sezione`) ON DELETE CASCADE;

--
-- Limiti per la tabella `progetti`
--
ALTER TABLE `progetti`
  ADD CONSTRAINT `progetti_ibfk_1` FOREIGN KEY (`utente_creazione`) REFERENCES `utenti` (`username`);

--
-- Limiti per la tabella `progetti_questionari`
--
ALTER TABLE `progetti_questionari`
  ADD CONSTRAINT `progetti_questionari_ibfk_1` FOREIGN KEY (`id_progetto`) REFERENCES `progetti` (`id_progetto`) ON DELETE CASCADE,
  ADD CONSTRAINT `progetti_questionari_ibfk_2` FOREIGN KEY (`id_questionario`) REFERENCES `questionari` (`id_questionario`) ON DELETE CASCADE;

--
-- Limiti per la tabella `progetti_utenti`
--
ALTER TABLE `progetti_utenti`
  ADD CONSTRAINT `progetti_utenti_ibfk_1` FOREIGN KEY (`id_progetto`) REFERENCES `progetti` (`id_progetto`) ON DELETE CASCADE,
  ADD CONSTRAINT `progetti_utenti_ibfk_2` FOREIGN KEY (`nome_utente`) REFERENCES `utenti` (`username`);

--
-- Limiti per la tabella `questionari`
--
ALTER TABLE `questionari`
  ADD CONSTRAINT `questionari_ibfk_1` FOREIGN KEY (`utente_creazione`) REFERENCES `utenti` (`username`);

--
-- Limiti per la tabella `questionari_compilati`
--
ALTER TABLE `questionari_compilati`
  ADD CONSTRAINT `questionari_compilati_ibfk_1` FOREIGN KEY (`id_progetto`,`id_questionario`) REFERENCES `progetti_questionari` (`id_progetto`, `id_questionario`);

--
-- Limiti per la tabella `risposte_ammesse`
--
ALTER TABLE `risposte_ammesse`
  ADD CONSTRAINT `risposte_ammesse_ibfk_1` FOREIGN KEY (`id_questionario`,`progressivo_sezione`,`progressivo_domanda`) REFERENCES `domande` (`id_questionario`, `progressivo_sezione`, `progressivo_domanda`) ON DELETE CASCADE;

--
-- Limiti per la tabella `risposte_quest_compilati`
--
ALTER TABLE `risposte_quest_compilati`
  ADD CONSTRAINT `risposte_quest_compilati_ibfk_1` FOREIGN KEY (`progressivo_quest_comp`) REFERENCES `questionari_compilati` (`progressivo_quest_comp`);

--
-- Limiti per la tabella `sezioni`
--
ALTER TABLE `sezioni`
  ADD CONSTRAINT `sezioni_ibfk_1` FOREIGN KEY (`id_questionario`) REFERENCES `questionari` (`id_questionario`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
