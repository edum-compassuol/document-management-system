# Especificação - Document Management System

## 1. Objetivo

Entregar um sistema web que permita a um usuário enviar, listar e baixar seus
documentos, com os arquivos armazenados no filesystem local da aplicação e
gestão simples por usuário.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição (`POST /upload`, `multipart/form-data`)
- Listagem dos documentos do usuário corrente (`GET /documents`)
- Download de um documento pelo identificador (`GET /documents/:id/download`)
- Identificação simples do usuário através do header `X-User-Id`
- Armazenamento dos arquivos no filesystem local via `multer` com `diskStorage`
- Metadados dos documentos mantidos em memória nesta fase
- Interface React com formulário de upload, lista de documentos e ação de download

### Fora do escopo

- Armazenamento externo ou em nuvem (S3, Azure Blob, Google Cloud Storage etc.)
- Versionamento de documentos
- Autenticação e autorização reais (login, senha, tokens)
- Exclusão e edição de documentos
- Banco de dados persistente
- Paginação, busca e filtros avançados na listagem
- Compartilhamento de documentos entre usuários
- Migração para TypeScript

## 3. Requisitos funcionais

| ID    | Requisito                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento via `multipart/form-data` no campo `file`                    |
| RF-02 | O usuário pode listar os documentos enviados com seus metadados                                 |
| RF-03 | O usuário pode baixar um documento pelo identificador                                           |
| RF-04 | Cada documento é associado a um `owner` derivado do header `X-User-Id` (fallback `anonymous`)   |
| RF-05 | A listagem retorna apenas os documentos do usuário corrente                                     |
| RF-06 | O sistema rejeita upload sem arquivo com status `400`                                           |
| RF-07 | O sistema rejeita arquivo acima de `MAX_FILE_SIZE` com status `413`                             |
| RF-08 | O download de um identificador inexistente retorna status `404`                                 |
| RF-09 | O download de um documento pertencente a outro `owner` retorna status `404`                     |
| RF-10 | O nome original é preservado nos metadados e no header `Content-Disposition` do download        |
| RF-11 | O frontend exibe feedback de sucesso e de erro nas operações de upload e listagem               |

## 4. Requisitos não funcionais

| ID     | Requisito                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------- |
| RNF-01 | Arquivos gravados no filesystem local via `multer` com `diskStorage` em `backend/storage`           |
| RNF-02 | Metadados mantidos em memória (estrutura no repository) nesta fase                                  |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor): `PORT`, `STORAGE_DIR`, `MAX_FILE_SIZE`          |
| RNF-04 | Backend em Clean Architecture simples: `routes -> controllers -> services -> repositories`           |
| RNF-05 | O nome físico do arquivo em disco é o `id` (UUID) mais a extensão original, evitando colisão e path traversal |
| RNF-06 | Erros tratados nos limites do sistema; respostas de erro em JSON no formato `{ "error": "<mensagem>" }` |
| RNF-07 | Testes do backend com o runner nativo `node:test`, executados por `npm test`                         |
| RNF-08 | O frontend consome a API pelo prefixo `/api`, removido pelo proxy do Vite                            |
| RNF-09 | JavaScript puro: backend em CommonJS, frontend em ESM, sem TypeScript                               |
| RNF-10 | Utilizar apenas dependências já presentes nos `package.json` (`express`, `multer`, `react`)          |

### Variáveis de ambiente

| Variável        | Padrão                                | Descrição                                |
| --------------- | ------------------------------------- | ---------------------------------------- |
| `PORT`          | `3000`                                | Porta HTTP do backend                    |
| `STORAGE_DIR`   | `./storage` (relativo à raiz do backend) | Diretório de gravação dos uploads     |
| `MAX_FILE_SIZE` | `10485760` (10 MB)                    | Tamanho máximo do arquivo, em bytes      |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo             | Descrição                                                      | Exemplo                                |
| ------------ | ---------------- | -------------------------------------------------------------- | -------------------------------------- |
| id           | string (UUID v4) | Identificador único, gerado por `crypto.randomUUID()`           | `3f9c1b2e-5a47-4a1f-9d3c-7e8b0c1d2a34` |
| originalName | string           | Nome original do arquivo enviado                                | `contrato.pdf`                         |
| storedName   | string           | Nome físico no disco, no formato `<id><extensão>`               | `3f9c1b2e-5a47-4a1f-9d3c-7e8b0c1d2a34.pdf` |
| mimeType     | string           | Tipo MIME informado pelo cliente                                | `application/pdf`                      |
| size         | number           | Tamanho em bytes                                                | `204800`                               |
| uploadedAt   | string           | Data/hora do upload em ISO 8601 (`new Date().toISOString()`)    | `2026-09-15T12:00:00.000Z`             |
| owner        | string           | Identificador do usuário dono                                   | `user-1`                               |

O campo `storedName` é de uso interno do repository e não é exposto pela API.
O DTO público retornado nos endpoints contém apenas:

```json
{
  "id": "3f9c1b2e-5a47-4a1f-9d3c-7e8b0c1d2a34",
  "originalName": "contrato.pdf",
  "mimeType": "application/pdf",
  "size": 204800,
  "uploadedAt": "2026-09-15T12:00:00.000Z",
  "owner": "user-1"
}
```

## 6. Contratos de API

> O proxy do Vite remove o prefixo `/api` antes de encaminhar a requisição.
> Portanto `fetch('/api/documents')` no frontend chega ao backend como
> `GET /documents`. As rotas do backend não são montadas sob `/api`.

### POST /upload

Envia um documento.

- Headers: `Content-Type: multipart/form-data`, `X-User-Id` (opcional)
- Corpo: campo `file` com um único arquivo

Sucesso `201 Created`:

```json
{
  "id": "3f9c1b2e-5a47-4a1f-9d3c-7e8b0c1d2a34",
  "originalName": "contrato.pdf",
  "mimeType": "application/pdf",
  "size": 204800,
  "uploadedAt": "2026-09-15T12:00:00.000Z",
  "owner": "user-1"
}
```

Erros:

| Status | Situação                          | Corpo                                                       |
| ------ | --------------------------------- | ----------------------------------------------------------- |
| `400`  | Nenhum arquivo enviado            | `{ "error": "Nenhum arquivo enviado." }`                     |
| `413`  | Arquivo acima de `MAX_FILE_SIZE`  | `{ "error": "Arquivo excede o tamanho máximo permitido." }`  |
| `500`  | Falha ao gravar no filesystem     | `{ "error": "Erro ao processar o upload." }`                 |

### GET /documents

Lista os documentos do usuário corrente.

- Headers: `X-User-Id` (opcional)

Sucesso `200 OK`, ordenado por `uploadedAt` decrescente; array vazio quando não
há documentos:

```json
[
  {
    "id": "3f9c1b2e-5a47-4a1f-9d3c-7e8b0c1d2a34",
    "originalName": "contrato.pdf",
    "mimeType": "application/pdf",
    "size": 204800,
    "uploadedAt": "2026-09-15T12:00:00.000Z",
    "owner": "user-1"
  }
]
```

### GET /documents/:id/download

Baixa o conteúdo binário de um documento.

- Headers: `X-User-Id` (opcional)

Sucesso `200 OK` com o binário e os headers:

- `Content-Type: <mimeType>`
- `Content-Disposition: attachment; filename="<originalName>"`
- `Content-Length: <size>`

Erros:

| Status | Situação                                             | Corpo                                          |
| ------ | ---------------------------------------------------- | ---------------------------------------------- |
| `404`  | Id inexistente ou documento de outro `owner`         | `{ "error": "Documento não encontrado." }`     |
| `500`  | Falha ao ler o arquivo no filesystem                 | `{ "error": "Erro ao ler o documento." }`      |

### GET /health

Endpoint já existente de verificação de saúde.

Sucesso `200 OK`:

```json
{ "status": "ok" }
```

## 7. Decisões arquiteturais

### Backend em Clean Architecture simples

Fluxo de dependência unidirecional: `routes -> controllers -> services -> repositories`.
Camadas internas não conhecem camadas externas.

| Arquivo previsto                          | Responsabilidade                                                     |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `src/config.js`                           | Leitura das variáveis de ambiente com valores padrão                  |
| `src/middlewares/upload.js`               | Instância do `multer` com `diskStorage` e `limits.fileSize`           |
| `src/middlewares/errorHandler.js`         | Tratamento centralizado de erros, incluindo `MulterError`             |
| `src/routes/documentRoutes.js`            | Define os endpoints e aplica o middleware de upload                   |
| `src/controllers/documentController.js`   | Extrai dados da requisição, valida entrada e formata a resposta HTTP  |
| `src/services/documentService.js`         | Regras de negócio: gera o `id`, monta os metadados, valida o `owner`  |
| `src/repositories/documentRepository.js`  | Persistência: coleção em memória e acesso ao filesystem               |

Decisões complementares:

- O `multer` usa `diskStorage` com `destination` apontando para `STORAGE_DIR` e
  `filename` no formato `<id><extensão>`. O diretório é criado na inicialização
  caso não exista.
- O `id` é gerado com `crypto.randomUUID()`, nativo do Node, sem dependência extra.
- O `owner` vem do header `X-User-Id`, com fallback para `anonymous`. Não há
  autenticação nesta fase.
- Não há `fileFilter` por tipo MIME; a única restrição é o tamanho máximo.

### Frontend baseado em componentes

| Arquivo previsto                         | Responsabilidade                                           |
| ---------------------------------------- | ---------------------------------------------------------- |
| `src/services/documentApi.js`            | Wrapper de `fetch` sobre o prefixo `/api`                   |
| `src/components/UploadComponent.jsx`     | Formulário de seleção e envio do arquivo                    |
| `src/components/DocumentList.jsx`        | Renderiza a lista de documentos e seus metadados            |
| `src/components/DownloadButton.jsx`      | Aciona o download de um documento                           |
| `src/pages/DocumentsPage.jsx`            | Compõe os componentes e controla o estado da página         |

- Componentes funcionais com `useState` e `useEffect`; sem bibliotecas de estado global.
- Mensagens ao usuário em português.

### Armazenamento local apenas

Nenhum provedor externo é utilizado. Os arquivos ficam em `backend/storage`, que
já está ignorado pelo `.gitignore` (exceto o `.gitkeep`).

### Trade-offs assumidos

- Metadados em memória são perdidos a cada reinício do servidor; aceitável nesta
  fase e substituível por um banco de dados sem alterar as camadas superiores.
- Ausência de autenticação real: o header `X-User-Id` é confiável apenas em
  ambiente de desenvolvimento.
- Usar o `id` como nome físico evita colisões de nome e ataques de path traversal
  a partir do `originalName` enviado pelo cliente.

## 8. Plano de execução

1. **Configuração e infraestrutura do backend** - criar `config.js`, garantir a
   existência do `STORAGE_DIR`, o middleware `upload.js` com `diskStorage` e
   `limits`, e o `errorHandler.js`.
   _Concluído quando_: o app sobe lendo as três variáveis de ambiente e cria o
   diretório de storage automaticamente.

2. **Repository em memória e acesso ao filesystem** - implementar `save`,
   `findAllByOwner` e `findById` sobre uma coleção em memória, com a resolução do
   caminho físico do arquivo.
   _Concluído quando_: o repository persiste e recupera metadados e resolve o
   caminho do arquivo em disco.

3. **Service com as regras de negócio** - criar documento (gerar `id`, montar
   metadados), listar por `owner` e obter documento para download validando o dono.
   _Concluído quando_: as três operações existem e retornam o DTO público.

4. **Controller e rotas** - implementar `documentController` e `documentRoutes`,
   montando as rotas e o `errorHandler` no `app.js`.
   _Concluído quando_: `POST /upload`, `GET /documents` e
   `GET /documents/:id/download` respondem conforme a seção 6.

5. **Testes do backend** - cobrir com `node:test` os requisitos funcionais e os
   códigos de erro `400`, `413` e `404`.
   _Concluído quando_: `npm test` passa no diretório `backend`.

6. **Serviço de API do frontend** - criar `documentApi.js` com as funções
   `uploadDocument`, `listDocuments` e `buildDownloadUrl` sobre `/api`.
   _Concluído quando_: as chamadas atingem o backend através do proxy do Vite.

7. **Componentes React e página** - implementar `UploadComponent`,
   `DocumentList`, `DownloadButton` e `DocumentsPage`, com feedback de sucesso e erro.
   _Concluído quando_: a interface envia, lista e baixa documentos.

8. **Integração ponta a ponta** - executar backend e frontend simultaneamente e
   validar manualmente os fluxos de upload, listagem e download.
   _Concluído quando_: os três fluxos funcionam no navegador e os arquivos
   aparecem em `backend/storage`.
