-- Excluir cliente/fornecedor só marca a data; o cadastro some das listas, mas as notas
-- ligadas a ele continuam (e o nome continua aparecendo nelas)
ALTER TABLE clientes ADD COLUMN deleted_at TEXT;
ALTER TABLE fornecedores ADD COLUMN deleted_at TEXT;
