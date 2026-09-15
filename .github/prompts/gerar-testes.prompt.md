---
description: Gera testes com node:test para um módulo do backend.
name: gerar-testes
argument-hint: caminho do modulo (ex. backend/src/services/documents.service.js)
agent: agent
---

# Gerar testes do backend

Gere testes automatizados para o módulo `${input:modulo:caminho do modulo}` usando o
runner nativo `node:test` e `node:assert`.

## Passos

1. Leia o módulo indicado e identifique os comportamentos públicos.
2. Crie o arquivo de teste correspondente em `backend/test`.
3. Escreva os casos de sucesso e de erro principais.
4. Execute `node --test` no diretório `backend` e corrija as falhas.

## Requisitos

- Cubra os casos de sucesso e de erro principais.
- Mantenha os testes isolados e legíveis.
- Coloque os testes em `backend/test`.
- Não dependa de serviços externos. Use o filesystem local quando necessário.
