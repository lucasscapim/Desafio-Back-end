
# Desafio Backend - Estudo Pessoal

Este repositório contém um projeto de backend desenvolvido com Node.js, usando o Prisma para interagir com o banco de dados MySQL. O objetivo do projeto é estudar e implementar funcionalidades como depósitos, transferências e cancelamento de transferências, além do envio de e-mails com a ajuda do Nodemailer e Mailtrap.

Este repositório é utilizado para fins de estudo pessoal e é inspirado no [desafio do PicPay](https://github.com/PicPay/picpay-desafio-backend).

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução para o JavaScript no servidor.
- **Express**: Framework web para criar as rotas e lidar com as requisições HTTP.
- **Prisma**: ORM para interagir com o banco de dados MySQL.
- **MySQL**: Sistema de gerenciamento de banco de dados relacional.
- **Nodemailer**: Biblioteca para envio de e-mails.
- **Mailtrap**: Serviço de sandbox para testar o envio de e-mails.
- **Axios**: Cliente HTTP para realizar requisições a APIs externas.

## Funcionalidades

### 1. **Listar Usuários**
   Endpoint para listar todos os usuários cadastrados.

   **Método**: `GET`  
   **Rota**: `/api/users`

### 2. **Listar Lojistas**
   Endpoint para listar todos os usuários com a conta tipo "lojista".

   **Método**: `GET`  
   **Rota**: `/api/lojistas`

### 3. **Pegar um Usuário Específico**
   Endpoint para pegar as informações de um usuário específico pelo ID.

   **Método**: `GET`  
   **Rota**: `/api/user/:id`

### 4. **Criar um Novo Usuário**
   Endpoint para criar um novo usuário.

   **Método**: `POST`  
   **Rota**: `/api/create`

### 5. **Realizar Depósito**
   Endpoint para realizar um depósito na conta de um usuário.

   **Método**: `POST`  
   **Rota**: `/api/deposit`

### 6. **Realizar Transferência**
   Endpoint para realizar uma transferência entre dois usuários.

   **Método**: `POST`  
   **Rota**: `/api/transfer`

### 7. **Cancelar Transferência**
   Endpoint para cancelar uma transferência realizada.

   **Método**: `POST`  
   **Rota**: `/api/cancel-transfer`

### 8. **Enviar E-mail**
   Endpoint para enviar um e-mail de confirmação.

   **Método**: `POST`  
   **Rota**: `/api/send-email`

## Estrutura do Projeto

```bash
.
├── src
│   ├── controllers
│   │   ├── userController.js
│   │   ├── transactionController.js
│   │   └── emailController.js
│   ├── models
│   │   └── user.js
│   ├── routes
│   │   └── userRoutes.js
│   ├── utils
│   │   └── generate_protocol.js
│   │   └── hash-password.js
│   └── index.js
├── prisma
│   └── schema.prisma
├── .env
├── package.json
└── README.md
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
PORT=3000

MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=5ba4e266cc7d01
MAIL_PASS=691528db10607a
MAIL_FROM=guido@email.com

DATABASE_URL="mysql://root:jurubeba13@localhost:3306/site-estudos"
```

- **PORT**: A porta em que o servidor vai rodar.
- **MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM**: Configurações para o envio de e-mails usando o Mailtrap.
- **DATABASE_URL**: URL de conexão com o banco de dados MySQL.

## Como Rodar o Projeto

1. Clone este repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o banco de dados e as variáveis de ambiente no arquivo `.env`.
4. Execute as migrações do Prisma:
   ```bash
   npx prisma migrate dev
   ```
5. Inicie o servidor:
   ```bash
   npm start
   ```
6. Acesse a aplicação no navegador em [http://localhost:3000](http://localhost:3000).

## Testes

Os testes podem ser feitos utilizando o arquivo `app.http`, que contém os exemplos de requisições para testar os endpoints.
