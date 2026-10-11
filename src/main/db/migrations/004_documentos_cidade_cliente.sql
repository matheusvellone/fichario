-- Documentos e cidade/estado do cliente. estado guarda a sigla (SP, RJ...)
ALTER TABLE clientes ADD COLUMN rg TEXT;
ALTER TABLE clientes ADD COLUMN cpf TEXT;
ALTER TABLE clientes ADD COLUMN cidade TEXT;
ALTER TABLE clientes ADD COLUMN estado TEXT;

-- Índice de busca recriado para incluir a cidade. observacoes continua sendo a
-- coluna 2, que é a usada para mostrar o trecho encontrado
DROP TRIGGER clientes_fts_ai;
DROP TRIGGER clientes_fts_ad;
DROP TRIGGER clientes_fts_au;
DROP TABLE clientes_fts;

CREATE VIRTUAL TABLE clientes_fts USING fts5(
  nome,
  endereco,
  observacoes,
  cidade,
  content = 'clientes',
  content_rowid = 'id',
  tokenize = 'unicode61 remove_diacritics 2'
);

INSERT INTO clientes_fts (clientes_fts) VALUES ('rebuild');

CREATE TRIGGER clientes_fts_ai AFTER INSERT ON clientes BEGIN
  INSERT INTO clientes_fts (rowid, nome, endereco, observacoes, cidade)
  VALUES (new.id, new.nome, new.endereco, new.observacoes, new.cidade);
END;

CREATE TRIGGER clientes_fts_ad AFTER DELETE ON clientes BEGIN
  INSERT INTO clientes_fts (clientes_fts, rowid, nome, endereco, observacoes, cidade)
  VALUES ('delete', old.id, old.nome, old.endereco, old.observacoes, old.cidade);
END;

CREATE TRIGGER clientes_fts_au AFTER UPDATE OF nome, endereco, observacoes, cidade ON clientes BEGIN
  INSERT INTO clientes_fts (clientes_fts, rowid, nome, endereco, observacoes, cidade)
  VALUES ('delete', old.id, old.nome, old.endereco, old.observacoes, old.cidade);
  INSERT INTO clientes_fts (rowid, nome, endereco, observacoes, cidade)
  VALUES (new.id, new.nome, new.endereco, new.observacoes, new.cidade);
END;
