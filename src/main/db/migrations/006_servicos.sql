-- Serviço feito para um cliente. O cliente pode pagar de uma vez ou em várias partes,
-- cada uma é um pagamento
CREATE TABLE servicos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  data TEXT NOT NULL, -- AAAA-MM-DD
  valor_centavos INTEGER NOT NULL CHECK (valor_centavos > 0),
  descricao TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX idx_servicos_cliente ON servicos(cliente_id);

CREATE TABLE pagamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  data TEXT NOT NULL, -- AAAA-MM-DD
  valor_centavos INTEGER NOT NULL CHECK (valor_centavos > 0),
  meio TEXT NOT NULL CHECK (meio IN ('dinheiro', 'pix', 'cartao')),
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX idx_pagamentos_servico ON pagamentos(servico_id);
CREATE INDEX idx_pagamentos_data ON pagamentos(data);

-- Índice de busca nas descrições dos serviços, como o das notas
CREATE VIRTUAL TABLE servicos_fts USING fts5(
  descricao,
  content = 'servicos',
  content_rowid = 'id',
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TRIGGER servicos_fts_ai AFTER INSERT ON servicos BEGIN
  INSERT INTO servicos_fts (rowid, descricao) VALUES (new.id, new.descricao);
END;

CREATE TRIGGER servicos_fts_ad AFTER DELETE ON servicos BEGIN
  INSERT INTO servicos_fts (servicos_fts, rowid, descricao) VALUES ('delete', old.id, old.descricao);
END;

CREATE TRIGGER servicos_fts_au AFTER UPDATE OF descricao ON servicos BEGIN
  INSERT INTO servicos_fts (servicos_fts, rowid, descricao) VALUES ('delete', old.id, old.descricao);
  INSERT INTO servicos_fts (rowid, descricao) VALUES (new.id, new.descricao);
END;

-- Cada "dinheiro recebido" de um cliente vira um serviço já pago de uma vez (em dinheiro).
-- O serviço fica com o mesmo id da nota para ligar o pagamento a ele
INSERT INTO servicos (id, cliente_id, data, valor_centavos, descricao, created_at, updated_at)
SELECT id, cliente_id, data, valor_centavos, descricao, created_at, updated_at
FROM notas
WHERE tipo = 'entrada' AND cliente_id IS NOT NULL AND fornecedor_id IS NULL;

INSERT INTO pagamentos (servico_id, data, valor_centavos, meio, created_at, updated_at)
SELECT id, data, valor_centavos, 'dinheiro', created_at, updated_at
FROM notas
WHERE tipo = 'entrada' AND cliente_id IS NOT NULL AND fornecedor_id IS NULL;

DELETE FROM notas
WHERE tipo = 'entrada' AND cliente_id IS NOT NULL AND fornecedor_id IS NULL;
