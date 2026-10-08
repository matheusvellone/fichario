# Fichário

Controle simples de clientes e anotações de serviços. App desktop (Electron) para Windows, com banco SQLite local e atualização automática.

**Download da versão mais recente:** https://github.com/matheusvellone/fichario/releases/latest/download/Fichario-Setup.exe

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

O banco fica em `%APPDATA%\Fichário\fichario.db` (no macOS: `~/Library/Application Support/Fichário/`).

## Migrations

Arquivos `.sql` em `src/main/db/migrations/`, nomeados `NNN_descricao.sql`. São aplicadas em ordem ao abrir o app e registradas em `schema_migrations`. Antes de aplicar migrations num banco existente é feita uma cópia `fichario.db.bak-<versão>`. Nunca altere uma migration já publicada — crie uma nova.

## Release

```bash
pnpm version patch   # ou minor/major
git push --follow-tags
```

A tag `v*` dispara o GitHub Actions, que gera o instalador Windows e publica no GitHub Releases. Os apps instalados baixam a atualização sozinhos e pedem para reiniciar.
