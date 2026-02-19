# 🔐 Password Manager (Cofre de Palavras-Passe)

Um gestor de palavras-passe fullstack desenvolvido para armazenar e gerir credenciais de forma segura. A aplicação permite que os utilizadores criem contas, façam login e guardem as suas palavras-passe de diversos sites utilizando encriptação forte, garantindo que apenas o próprio utilizador possa aceder aos seus dados.

## ✨ Funcionalidades

* **Autenticação de Utilizadores:** Registo e Login seguros com *hashing* de palavras-passe (BCrypt) e tokens JWT.
* **Gestão de Cofre:** Adicionar, editar, visualizar e remover credenciais (site, nome de utilizador e palavra-passe).
* **Segurança de Dados:** As palavras-passe guardadas no cofre são encriptadas no lado do servidor utilizando o algoritmo **AES-256** antes de serem guardadas na base de dados.
* **Interface Intuitiva:** Frontend moderno, rápido e responsivo (React + Vite).

## 🛠️ Tecnologias Utilizadas

### Backend
* **Plataforma:** .NET 10 (C#) / ASP.NET Core Web API
* **Base de Dados:** PostgreSQL
* **ORM:** Entity Framework Core
* **Segurança:** Autenticação via JWT (JSON Web Tokens), BCrypt (hashing de utilizadores) e `System.Security.Cryptography.Aes` (encriptação do cofre).

### Frontend
* **Framework:** React 18
* **Linguagem:** TypeScript
* **Build Tool:** Vite
* **Roteamento:** React Router DOM
* **Comunicações HTTP:** Axios

### Infraestrutura
* **Contentores:** Docker & Docker Compose
* **Servidor Web (Frontend):** Nginx

## 🚀 Como Executar o Projeto

A forma mais simples de rodar a aplicação localmente é utilizando o Docker Compose, uma vez que este já configura a base de dados PostgreSQL, a API em .NET e o Frontend em React simultaneamente.

### Pré-requisitos
* [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/) instalados na sua máquina.

### Passos para arrancar (via Docker Compose)

1. Clone o repositório para a sua máquina local.
2. Navegue até à raiz do projeto (onde se encontra o ficheiro `docker-compose.yml`).
3. Execute o seguinte comando no terminal:

```bash
docker-compose up --build

```

4. Aguarde até que os contentores sejam construídos e iniciados. A aplicação ficará disponível nos seguintes endereços:
* **Frontend (Interface do Utilizador):** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)
* **Backend (API API):** [http://localhost:5000](https://www.google.com/search?q=http://localhost:5000)
* **Base de Dados PostgreSQL:** Acessível na porta `5432`.



### Execução Manual (Desenvolvimento Local)

Caso prefira rodar os serviços fora dos contentores para fins de desenvolvimento:

**1. Base de Dados:**
Certifique-se de ter uma instância do PostgreSQL rodando e atualize a *Connection String* no ficheiro `backend/appsettings.json`.

**2. Backend:**

```bash
cd backend
dotnet restore
dotnet ef database update # Para aplicar as migrações à base de dados
dotnet run

```

**3. Frontend:**

```bash
cd frontend
npm install
npm run dev

```

## 🔒 Arquitetura de Segurança

A segurança foi uma prioridade no desenho desta API:

1. **Credenciais do Utilizador:** Quando um utilizador se regista, a sua "Senha Mestra" nunca é guardada em texto limpo. O backend utiliza **BCrypt** para gerar um *hash* seguro.
2. **Cofre de Palavras-Passe:** Quando um utilizador guarda uma palavra-passe de um website (ex: Netflix), o backend utiliza o serviço `EncryptionService` para encriptar a *string* utilizando **AES**.
3. **Vetor de Inicialização (IV):** Cada processo de encriptação gera um novo IV aleatório, que é anexado à *string* final encriptada. Isto garante que palavras-passe iguais resultem em *ciphertexts* (textos cifrados) diferentes.
4. **Comunicação:** Todas as rotas protegidas da API exigem um cabeçalho `Authorization: Bearer <token>`, validado no backend de forma a garantir a identidade do requerente.

## 📡 Endpoints da API

Abaixo encontra-se um resumo dos principais *endpoints* expostos pelo backend:

### Autenticação (`/api/auth`)

* `POST /register`: Cria uma nova conta de utilizador.
* `POST /login`: Autentica o utilizador e devolve um token JWT.

### Cofre (`/api/vault`) - *Requer JWT*

* `GET /`: Devolve a lista de itens guardados (sem revelar a palavra-passe).
* `POST /`: Adiciona um novo item encriptado ao cofre.
* `GET /decrypt/{id}`: Devolve a palavra-passe desencriptada de um item específico (apenas se pertencer ao utilizador autenticado).
* `PUT /{id}`: Atualiza os dados de um item específico.
* `DELETE /{id}`: Remove um item do cofre.

---

*Desenvolvido com o intuito de criar um ambiente seguro e moderno para gestão de credenciais.*
