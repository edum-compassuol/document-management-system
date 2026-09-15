---
description: Cria um commit com mensagem convencional e envia as alterações para o remoto.
name: commit-push
argument-hint: resumo da alteração (ex. upload de documentos)
agent: agent
---

# Commit e push

Registre as alterações atuais em um commit e envie para o repositório remoto,
usando `${input:resumo:resumo da alteração}` como base da mensagem.

## Passos

1. Verifique o estado do repositório com `git status` e `git diff`.
2. Adicione apenas os arquivos relacionados à alteração com `git add`.
3. Crie o commit com mensagem no padrão Conventional Commits
   (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`).
4. Confirme a branch atual e execute `git push` para o remoto.
5. Informe o resultado do push e o hash do commit.

## Requisitos

- Escreva a mensagem de commit em português, no imperativo e com até 72 caracteres
  na primeira linha.
- Não inclua arquivos de `backend/storage`, `node_modules` ou artefatos de build.
- Não use `--force`, `--no-verify` ou reescrita de histórico já publicado.
- Se houver conflitos ou a branch estiver desatualizada, interrompa e relate ao usuário.
- Se não houver alterações para commitar, apenas informe e encerre.
