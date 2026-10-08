-- Índice de busca por texto nas anotações (ignora maiúsculas e acentos)
CREATE VIRTUAL TABLE notas_fts USING fts5(
  texto,
  content = 'notas',
  content_rowid = 'id',
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TRIGGER notas_fts_ai AFTER INSERT ON notas BEGIN
  INSERT INTO notas_fts (rowid, texto) VALUES (new.id, new.texto);
END;

CREATE TRIGGER notas_fts_ad AFTER DELETE ON notas BEGIN
  INSERT INTO notas_fts (notas_fts, rowid, texto) VALUES ('delete', old.id, old.texto);
END;

CREATE TRIGGER notas_fts_au AFTER UPDATE OF texto ON notas BEGIN
  INSERT INTO notas_fts (notas_fts, rowid, texto) VALUES ('delete', old.id, old.texto);
  INSERT INTO notas_fts (rowid, texto) VALUES (new.id, new.texto);
END;

INSERT INTO notas_fts (notas_fts) VALUES ('rebuild');
