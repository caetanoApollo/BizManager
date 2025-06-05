<p align="center"><img src="URL_DO_SEU_LOGO_AQUI" alt="BizManager Logo" width="150"/></p><h1 align="center">BizManager 📈</h1><p align="center">  ✨ Transforme a gestão do seu microempreendimento com o BizManager! ✨</p><p align="center"><a href="URL_PARA_SEU_ARQUIVO_DE_LICENCA">    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License: MIT">
  </a>
  <a href="URL_DO_STATUS_DO_BUILD_SE_HOUVER_CI_CD">
    <img src="https://img.shields.io/github/actions/workflow/status/caetanoApollo/BizManager/SEU_ARQUIVO_WORKFLOW.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white" alt="Build Status">
  </a>
  <a href="URL_DO_PACKAGE_JSON_DO_CLIENTE_OU_PROJETO_PRINCIPAL">
    <img src="https://img.shields.io/github/package-json/v/caetanoApollo/BizManager?filename=client/package.json&style=for-the-badge&logo=npm" alt="Client Version">
  </a>
  <a href="URL_DO_PACKAGE_JSON_DO_SERVIDOR">
    <img src="https://img.shields.io/github/package-json/v/caetanoApollo/BizManager?filename=server/package.json&style=for-the-badge&logo=npm" alt="Server Version">
  </a>
  <br>
  <img src="https://img.shields.io/badge/React%20Native-%2361DAFB.svg?style=for-the-badge&logo=react&logoColor=white" alt="React Native">
  <img src="https://img.shields.io/badge/Expo-%23000020.svg?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/Node.js-%23339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-%23000000.svg?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/MySQL-%234479A1.svg?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/TypeScript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</p><p align="center">  O BizManager é um aplicativo robusto e intuitivo, desenhado especificamente para empoderar microempreendedores, centralizando e simplificando a administração de seus negócios. Com ele, você otimiza processos, ganha eficiência operacional e obtém uma visão clara do desempenho financeiro e administrativo da sua empresa.</p>## 📖 Índice* [🎯 Sobre o Projeto](#-sobre-o-projeto)* [✨ Funcionalidades Principais](#-funcionalidades-principais)* [🎨 Identidade Visual](#-identidade-visual)* [🛠️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)* [🚀 Começando](#-começando)    * [📋 Pré-requisitos](#-pré-requisitos)    * [🔧 Instalação e Configuração](#-instalação-e-configuração)    * [ධ Executando a Aplicação](#-executando-a-aplicação)* [🔩 Estrutura do Projeto](#-estrutura-do-projeto)* [🔗 Endpoints da API](#-endpoints-da-api)* [🗺️ Roadmap (Exemplo)](#️-roadmap-exemplo)* [🤝 Contribuindo (Exemplo)](#-contribuindo-exemplo)* [❓ FAQ (Exemplo)](#-faq-exemplo)* [🧑🏽‍💻 Autor](#-autor)* [📄 Licença](#-licença)
## 🎯 Sobre o Projeto
Desenvolvido para ser uma ferramenta completa, o BizManager ataca as dores mais comuns dos pequenos negócios, oferecendo funcionalidades que vão desde o cadastro de clientes até a emissão de notas fiscais, tudo em uma interface amigável e acessível. Nosso objetivo é fornecer uma solução que não apenas gerencie, mas impulsione o crescimento de microempreendimentos.
## ✨ Funcionalidades Principais
O BizManager é recheado de funcionalidades pensadas para o dia a dia do microempreendedor:
* 🔐 **Cadastro e Autenticação Segura:**    * Cadastro simplificado de usuários (MEIs) e seus respectivos clientes.    * Autenticação robusta com bcrypt para hashing de senhas e recuperação de senha.* 👤 **Gestão de Clientes Completa:**    * Registro detalhado de clientes com informações personalizadas.    * Agendamento de serviços com integração direta ao Google Calendar.    * Histórico de interações para um relacionamento mais próximo e eficiente.* 📊 **Gestão Financeira Inteligente:**    * Controle preciso de receitas e despesas com categorização.    * Geração de relatórios financeiros detalhados, exportáveis em PDF e Excel (via Google Sheets).    * Dashboards visuais com gráficos para fácil entendimento da saúde financeira do negócio.* 📦 **Controle de Estoque Eficaz:**    * Cadastro de produtos com informações detalhadas (descrição, quantidade, preço de custo/venda, fornecedor, SKU).    * Notificações de reabastecimento para nunca perder uma venda (quantidade mínima configurável).    * Histórico de movimentação de estoque.* 🧾 **Emissão de Notas Fiscais Simplificada:**    * Integração com a API da Receita Federal para emissão de NF-e (Nota Fiscal Eletrônica).    * Geração e reemissão de notas fiscais eletrônicas diretamente pelo app.* ⚙️ **Configurações Personalizadas:**    * Gerenciamento de perfil de usuário e da empresa, incluindo logo/foto.    * Preferências de notificações e integrações com outras ferramentas.* 🗓️ **Agenda Integrada:**    * Visualização clara de compromissos, serviços agendados e prazos.    * Adição e edição de eventos/serviços diretamente na agenda do app.
## 🎨 Identidade Visual
O BizManager adota uma identidade visual moderna e profissional, utilizando a fonte **Bebas Neue** para títulos e elementos de destaque, transmitindo confiança e clareza.
### Paleta de Cores:
| Cor               | Hex                                                                      | Amostra                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Laranja Principal | `#F5A623`                                                                | <img src="https://readme-swatches.vercel.app/F5A623" width="20" height="20" alt="Laranja Principal Swatch"/>                           |
| Laranja Secundário| `#FFBC42`                                                                | <img src="https://readme-swatches.vercel.app/FFBC42" width="20" height="20" alt="Laranja Secundário Swatch"/>                         |
| Verde Água        | `#5D9B9B`                                                                | <img src="https://readme-swatches.vercel.app/5D9B9B" width="20" height="20" alt="Verde Água Swatch"/>                                   |
| Azul Escuro       | `#2A4D69`                                                                | <img src="https://readme-swatches.vercel.app/2A4D69" width="20" height="20" alt="Azul Escuro Swatch"/>                                 |

A tela de carregamento apresenta uma animação com barras coloridas e um gradiente de fundo que transita de Verde Água (`#5D9B9B`) para Azul Escuro (`#2A4D69`), criando uma primeira impressão dinâmica e agradável.
## 🛠️ Tecnologias Utilizadas
O projeto é construído com um conjunto de tecnologias modernas e eficientes para garantir performance, escalabilidade e uma ótima experiência de usuário:

| Categoria      | Tecnologia / Biblioteca                                                                                                  | Descrição / Propósito                                                                                                                                                                                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📱 **Frontend** | ![React Native](https://img.shields.io/badge/React%20Native-%2361DAFB.svg?style=flat&logo=react&logoColor=white)         | Desenvolvimento mobile multiplataforma (Android/iOS).                                                                                                                                                                                                                                                                                              |
|                | ![Expo](https://img.shields.io/badge/Expo-%23000020.svg?style=flat&logo=expo&logoColor=white)                             | Framework e plataforma para facilitar o desenvolvimento e build.                                                                                                                                                                                                                                                                                          |
|                | ![React Native for Web](https://img.shields.io/badge/React%20Native%20for%20Web-%2361DAFB.svg?style=flat&logo=react&logoColor=white) | Para a versão web do aplicativo.                                                                                                                                                                                                                                                                                                                   |
|                | ![Expo Router](https://img.shields.io/badge/Expo%20Router-%23000020.svg?style=flat&logo=expo&logoColor=white)             | Navegação baseada em arquivos.                                                                                                                                                                                                                                                                                                                             |
|                | ![TypeScript](https://img.shields.io/badge/TypeScript-%233178C6.svg?style=flat&logo=typescript&logoColor=white)         | Tipagem estática para maior robustez e manutenibilidade do código.                                                                                                                                                                                                                                                                                         |
|                | `React Navigation`                                                                                                       | Utilizado indiretamente ou como base para Expo Router.                                                                                                                                                                                                                                                                                             |
|                | `Axios`                                                                                                                  | Cliente HTTP para requisições ao backend.                                                                                                                                                                                                                                                                                                          |
|                | `React Native Chart Kit`                                                                                                 | Visualização de gráficos financeiros.                                                                                                                                                                                                                                                                                                              |
|                | `Expo Linear Gradient`                                                                                                   | Criação de fundos com gradiente.                                                                                                                                                                                                                                                                                                                   |
|                | `Expo Vector Icons`                                                                                                      | Ampla gama de ícones para a interface.                                                                                                                                                                                                                                                                                                             |
| ⚙️ **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-%23339933.svg?style=flat&logo=nodedotjs&logoColor=white)                 | Ambiente de execução JavaScript no servidor.                                                                                                                                                                                                                                                                                                         |
|                | ![Express.js](https://img.shields.io/badge/Express.js-%23000000.svg?style=flat&logo=express&logoColor=white)             | Framework web para construção da API RESTful.                                                                                                                                                                                                                                                                                                       |
|                | `mysql2`                                                                                                                 | Driver Node.js para MySQL, com suporte a Promises.                                                                                                                                                                                                                                                                                                 |
|                | `bcrypt`                                                                                                                 | Hashing seguro de senhas.                                                                                                                                                                                                                                                                                                                          |
|                | `CORS` | Habilita requisições de diferentes origens. |
| | `dotenv` | Gerenciamento de variáveis de ambiente. |
| | `Multer` | Middleware para upload de arquivos (ex: foto de perfil). |
| 🗃️ **Banco de Dados** | ![MySQL](https://img.shields.io/badge/MySQL-%234479A1.svg?style=flat&logo=mysql&logoColor=white) | Sistema de gerenciamento de banco de dados relacional. |
| 🔗 **Integrações** | `API da Receita Federal` | Emissão de notas fiscais eletrônicas (NF-e). |
| | `Google Calendar API` | Agendamento de serviços e sincronização com calendário. |
| | `Google Sheets API` | Exportação de dados e relatórios. |
| | `Firebase Cloud Messaging (FCM)` | Envio de notificações push para engajamento. |

## 🚀 Começando

Siga estas instruções para ter o BizManager rodando em seu ambiente de desenvolvimento.

### 📋 Pré-requisitos

Antes de começar, garanta que você tem instalado:

* [Node.js](https://nodejs.org/) (Versão LTS recomendada) e npm/yarn.
* [MySQL Server](https://dev.mysql.com/downloads/mysql/) (Configurado e rodando).
* [Git](https://git-scm.com/).
* [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli` (se ainda não tiver).
* Uma conta no [Firebase](https://firebase.google.com/) (Necessária para o gerenciamento de notificações - FCM).
* Um editor de código, como o [VS Code](https://code.visualstudio.com/).

### 🔧 Instalação e Configuração1. **Clone o Repositório:** ```bash
git clone [https://github.com/caetanoApollo/BizManager.git](https://github.com/caetanoApollo/BizManager.git)
cd BizManager
```
2. **Configuração do Backend (Servidor):** * Navegue até a pasta do servidor:
```bash
cd server
```
* Instale as dependências:
```bash
npm install
# ou
# yarn install
```
* Crie um arquivo `.env` na raiz da pasta `/server` com base no arquivo `.env.example` (se houver). Caso contrário, adicione as seguintes variáveis de ambiente, ajustando os valores conforme necessário:
```env
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASS=sua_senha_mysql
DB_NAME=bizmanager
PORT=3001
# Adicione outras variáveis de ambiente necessárias (JWT_SECRET, etc.)
```
* **Configuração do Banco de Dados:**
1. Crie um banco de dados chamado `bizmanager` no seu servidor MySQL.
```sql
CREATE DATABASE bizmanager;
```
2. Importe o schema do banco de dados utilizando o arquivo `server/bizmanager.sql`. Você pode usar uma ferramenta como MySQL Workbench, DBeaver, ou a linha de comando:
```bash
mysql -u seu_usuario_mysql -p bizmanager < server/bizmanager.sql
```
3. **Configuração do Frontend (Cliente):** * Navegue até a pasta do cliente (a partir da raiz do projeto):
```bash
cd ../client
# ou, se já estiver na raiz:
# cd client
```
* Instale as dependências:
```bash
npm install
# ou
# yarn install
```
* **Variável de Ambiente (API):**
* Verifique o arquivo `client/app/services/api.ts` (ou onde sua `BASE_URL` da API é definida).
* A `BASE_URL` está configurada como `http://192.168.2.119:3001`.
* **Para desenvolvimento local (emulador/navegador na mesma máquina que o backend):** Mude para `http://localhost:3001`.
* **Para testes em dispositivo físico na mesma rede Wi-Fi:** Utilize o endereço IP da máquina host onde o servidor backend está rodando (ex: `http://SEU_IP_LOCAL:3001`). Certifique-se de que seu firewall permite conexões nesta porta.
### ධ Executando a Aplicação1. **Backend (Servidor):** * No diretório `/server`:
```bash
npm start
```
* O servidor backend estará rodando na porta definida (padrão: `3001`). Verifique os logs no terminal para confirmar.
2. **Frontend (Cliente):** * No diretório `/client`:
```bash
npm start
# ou
expo start
```
* Siga as instruções no terminal do Expo para abrir o aplicativo:
* **Android:** Pressione `a` (emulador) ou escaneie o QR Code com o app Expo Go no seu dispositivo.
* **iOS:** Pressione `i` (simulador) ou escaneie o QR Code com o app Expo Go no seu dispositivo.
* **Web:** Pressione `w` para abrir no navegador.
## 🔩 Estrutura do Projeto

A estrutura do projeto está organizada da seguinte forma:



BizManager/ ├── client/                   # Código do frontend (React Native/Expo) │   ├── app/                  # Telas, componentes e lógica de navegação (Expo Router) │   │   ├── _layout.tsx       # Layout principal da aplicação │   │   ├── index.tsx         # Ponto de entrada/redirect para a tela de home/login │   │   ├── (tabs)/           # Exemplo de grupo de rotas para abas │   │   ├── (auth)/           # Exemplo de grupo de rotas para autenticação │   │   ├── components/       # Componentes reutilizáveis (botões, inputs, cards, etc.) │   │   └── screens/          # (Se não usar Expo Router totalmente baseado em arquivos) Telas da aplicação │   ├── assets/               # Imagens, fontes (BebasNeue), ícones │   ├── services/ │   │   └── api.ts            # Configuração e funções para chamadas à API backend │   ├── constants/            # Cores, temas, valores constantes │   ├── hooks/                # Hooks customizados │   ├── navigation/           # (Se usar React Navigation tradicional) │   ├── types/                # Definições de tipos TypeScript │   ├── app.json              # Configurações do projeto Expo │   └── package.json          # Dependências e scripts do frontend │ ├── server/                   # Código do backend (Node.js/Express) │   ├── src/                  # Código fonte do servidor │   │   ├── controllers/      # Lógica de controle das rotas │   │   ├── routes/           # Definições das rotas da API │   │   ├── models/           # (Opcional) Modelos de dados, interações com o BD │   │   ├── services/         # Lógica de negócios │   │   ├── middlewares/      # Middlewares do Express (autenticação, logs, erros) │   │   ├── config/           # Configurações (conexão com BD, variáveis de ambiente) │   │   └── db.js             # Configuração da conexão com o banco de dados MySQL │   ├── bizmanager.sql        # Script SQL para criação do schema do banco │   ├── server.js             # Ponto de entrada principal e configuração do Express │   └── package.json          # Dependências e scripts do backend │ ├── .gitignore                # Arquivos e pastas ignorados pelo Git └── README.md                 # Este arquivo!

 
 *(Esta é uma sugestão de estrutura mais detalhada. Ajuste conforme a realidade do seu projeto.)*

## 🔗 Endpoints da API

A seguir, alguns dos principais endpoints disponíveis no servidor backend. Para uma lista completa e detalhada, consulte o arquivo `server/src/routes/` ou a documentação da API (se houver).

* **Autenticação:**
    * `POST /api/auth/register`: Registra um novo usuário (MEI).        * *Body:* `nome`, `email`, `senha`, `telefone`, `cnpj`, `foto_perfil` (opcional, via form-data).    * `POST /api/auth/login`: Autentica um usuário existente.        * *Body:* `cnpj`, `senha`.    * `POST /api/auth/forgot-password`: Solicita recuperação de senha.    * `POST /api/auth/reset-password`: Redefine a senha.

* **Clientes:**
    * `GET /api/clients`: Lista todos os clientes do usuário logado.
    * `POST /api/clients`: Adiciona um novo cliente.
    * `GET /api/clients/:id`: Obtém detalhes de um cliente específico.
    * `PUT /api/clients/:id`: Atualiza um cliente.
    * `DELETE /api/clients/:id`: Remove um cliente.

* **Produtos (Estoque):**
    * `GET /api/products`: Lista todos os produtos.
    * `POST /api/products`: Adiciona um novo produto.
    * _... (demais endpoints CRUD para produtos)_

* **Serviços/Agendamentos:**
    * `GET /api/schedules`: Lista agendamentos.
    * `POST /api/schedules`: Cria um novo agendamento.
    * _... (demais endpoints CRUD para agendamentos)_

*(Consulte `server/server.js` ou os arquivos de rota em `server/src/routes/` para mais detalhes sobre as requisições e respostas de cada endpoint).*

## 🗺️ Roadmap (Exemplo)

Aqui estão alguns dos nossos planos futuros para o BizManager:

* [ ] **Módulo de Vendas (PDV):** Implementar um Ponto de Venda simplificado.
* [ ] **Relatórios Avançados:** Adicionar mais opções de filtros e customização nos relatórios.
* [ ] **Integração com Meios de Pagamento:** Permitir processamento de pagamentos online.
* [X] **Versão Web:** Lançamento da versão web inicial (Concluído com React Native for Web).
* [ ] **App Offline:** Permitir funcionalidades básicas em modo offline.

## 🤝 Contribuindo (Exemplo)
Contribuições são o que tornam a comunidade open source um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será **muito apreciada**.

Se você tiver uma sugestão para melhorar este projeto, por favor, faça um fork do repositório e crie uma pull request. Você também pode simplesmente abrir uma issue com a tag "enhancement".
Não se esqueça de dar uma estrela ao projeto! Obrigado novamente!

1. Faça um Fork do projeto (`https://github.com/caetanoApollo/BizManager/fork`)
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra uma Pull Request

Consulte o arquivo `CONTRIBUTING.md` (você pode criar este arquivo com mais detalhes) para mais informações sobre como contribuir, padrões de código e o processo de submissão de PRs.

## ❓ FAQ (Exemplo)

<details>
<summary><strong>O BizManager é gratuito?</strong></summary>
Atualmente, o BizManager é um projeto open source e pode ser utilizado gratuitamente. Planos futuros podem incluir funcionalidades premium, mas o core sempre buscará ser acessível.
</details>

<details>
<summary><strong>Quais plataformas o BizManager suporta?</strong></summary>
O BizManager é desenvolvido com React Native e Expo, suportando Android, iOS e Web.
</details>

<details>
<summary><strong>Como posso solicitar uma nova funcionalidade?</strong></summary>
Você pode abrir uma "Issue" no nosso repositório do GitHub com a tag "feature request" descrevendo a funcionalidade desejada.
</details>

## 🧑🏽‍💻 Autor

**Caetano Apollo da Silveira**

* GitHub: [@CaetanoApollo](https://github.com/caetanoApollo)
* LinkedIn: [caetanoapollo](https://www.linkedin.com/in/caetanoapollo/)
* E-mail: [caetanosilveira1908@gmail.com](mailto:caetanosilveira1908@gmail.com)
* Notion (Planejamento do Projeto): [PP Desenvolvimento BizManager](URL_DO_SEU_NOTION_SE_PUBLICO)

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](URL_PARA_SEU_ARQUIVO_DE_LICENCA_NO_REPO) para mais detalhes.

---