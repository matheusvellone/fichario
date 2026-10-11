-- Índice de busca nas descrições das notas, para achar o cliente/fornecedor pelo que
-- foi anotado nas notas dele (ignora maiúsculas e acentos)
CREATE VIRTUAL TABLE notas_fts USING fts5(
  descricao,
  content = 'notas',
  content_rowid = 'id',
  tokenize = 'unicode61 remove_diacritics 2'
);

INSERT INTO notas_fts (notas_fts) VALUES ('rebuild');

CREATE TRIGGER notas_fts_ai AFTER INSERT ON notas BEGIN
  INSERT INTO notas_fts (rowid, descricao) VALUES (new.id, new.descricao);
END;

CREATE TRIGGER notas_fts_ad AFTER DELETE ON notas BEGIN
  INSERT INTO notas_fts (notas_fts, rowid, descricao) VALUES ('delete', old.id, old.descricao);
END;

CREATE TRIGGER notas_fts_au AFTER UPDATE OF descricao ON notas BEGIN
  INSERT INTO notas_fts (notas_fts, rowid, descricao) VALUES ('delete', old.id, old.descricao);
  INSERT INTO notas_fts (rowid, descricao) VALUES (new.id, new.descricao);
END;
