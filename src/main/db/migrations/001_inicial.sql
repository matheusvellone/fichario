CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  telefone TEXT,
  endereco TEXT,
  observacoes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Índice de busca nos clientes (ignora maiúsculas e acentos)
CREATE VIRTUAL TABLE clientes_fts USING fts5(
  nome,
  endereco,
  observacoes,
  content = 'clientes',
  content_rowid = 'id',
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TRIGGER clientes_fts_ai AFTER INSERT ON clientes BEGIN
  INSERT INTO clientes_fts (rowid, nome, endereco, observacoes)
  VALUES (new.id, new.nome, new.endereco, new.observacoes);
END;

CREATE TRIGGER clientes_fts_ad AFTER DELETE ON clientes BEGIN
  INSERT INTO clientes_fts (clientes_fts, rowid, nome, endereco, observacoes)
  VALUES ('delete', old.id, old.nome, old.endereco, old.observacoes);
END;

CREATE TRIGGER clientes_fts_au AFTER UPDATE OF nome, endereco, observacoes ON clientes BEGIN
  INSERT INTO clientes_fts (clientes_fts, rowid, nome, endereco, observacoes)
  VALUES ('delete', old.id, old.nome, old.endereco, old.observacoes);
  INSERT INTO clientes_fts (rowid, nome, endereco, observacoes)
  VALUES (new.id, new.nome, new.endereco, new.observacoes);
END;

CREATE TABLE fornecedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  telefone TEXT,
  endereco TEXT,
  observacoes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Índice de busca nos fornecedores (ignora maiúsculas e acentos)
CREATE VIRTUAL TABLE fornecedores_fts USING fts5(
  nome,
  endereco,
  observacoes,
  content = 'fornecedores',
  content_rowid = 'id',
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TRIGGER fornecedores_fts_ai AFTER INSERT ON fornecedores BEGIN
  INSERT INTO fornecedores_fts (rowid, nome, endereco, observacoes)
  VALUES (new.id, new.nome, new.endereco, new.observacoes);
END;

CREATE TRIGGER fornecedores_fts_ad AFTER DELETE ON fornecedores BEGIN
  INSERT INTO fornecedores_fts (fornecedores_fts, rowid, nome, endereco, observacoes)
  VALUES ('delete', old.id, old.nome, old.endereco, old.observacoes);
END;

CREATE TRIGGER fornecedores_fts_au AFTER UPDATE OF nome, endereco, observacoes ON fornecedores BEGIN
  INSERT INTO fornecedores_fts (fornecedores_fts, rowid, nome, endereco, observacoes)
  VALUES ('delete', old.id, old.nome, old.endereco, old.observacoes);
  INSERT INTO fornecedores_fts (rowid, nome, endereco, observacoes)
  VALUES (new.id, new.nome, new.endereco, new.observacoes);
END;

-- Dinheiro que entrou ou saiu. Pode ser de um cliente, de um fornecedor, dos dois
-- (ex.: material comprado para o serviço de um cliente) ou de nenhum (conta do próprio usuário)
CREATE TABLE notas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
  fornecedor_id INTEGER REFERENCES fornecedores(id) ON DELETE CASCADE,
  data TEXT NOT NULL, -- AAAA-MM-DD
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  valor_centavos INTEGER NOT NULL CHECK (valor_centavos > 0),
  descricao TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX idx_notas_cliente ON notas(cliente_id);
CREATE INDEX idx_notas_fornecedor ON notas(fornecedor_id);
CREATE INDEX idx_notas_data ON notas(data);
