<h1 align="center" style="font-size: 32px;">Achei Quem Queira (AQQ)</h1>

<p align="center">
  <strong>Plataforma de Desapego Local e Economia Circular</strong>
</p>

<p align="center">
  Conectando pessoas que desejam liberar espaço com quem pode reaproveitar recursos próximos de sua comunidade.
</p>

---

## Sobre o Projeto

O **Achei Quem Queira (AQQ)** é uma plataforma de desapego local desenvolvida com foco em economia circular, reaproveitamento de recursos e fortalecimento das comunidades.

Diferente de marketplaces tradicionais, o AQQ não foi projetado apenas para compra e venda.

Seu objetivo é facilitar a circulação local de itens que ainda possuem utilidade, permitindo que materiais, móveis, eletrodomésticos, ferramentas, sobras de obra e diversos outros recursos encontrem um novo destino antes de se tornarem descarte.

A plataforma incentiva:

* Reaproveitamento de recursos;
* Redução do desperdício;
* Economia circular;
* Conexões locais;
* Transparência sobre o estado real dos itens;
* Desapego rápido e consciente.

---

## Problema que o AQQ Resolve

Milhares de itens permanecem inutilizados em residências, empresas e obras.

Muitas vezes esses recursos:

* Ocupam espaço;
* Geram descarte inadequado;
* Possuem valor para outras pessoas;
* Não encontram interessados próximos.

O AQQ atua como uma ponte entre quem deseja desapegar e quem procura oportunidades de reaproveitamento na própria região.

---

## Diferencial: Sistema de Qualidade em 4 Graus

Uma das principais características do projeto é o sistema de classificação transparente dos itens.

| Grau                    | Descrição                                               |
| ----------------------- | ------------------------------------------------------- |
| Defeituoso              | Item não funcional                                      |
| Funcional com Problemas | Funciona parcialmente                                   |
| Problemas Estéticos     | Funciona normalmente, porém apresenta desgastes visuais |
| Funcional               | Pronto para uso                                         |

Esse modelo permite que até mesmo itens danificados possam ser reaproveitados por profissionais, recicladores, reformadores e pequenos empreendedores.

---

## Principais Funcionalidades

### Usuários

* Cadastro de usuários
* Login
* Validação de telefone
* Validação de identidade
* Perfil público

### Anúncios

* Publicação de itens
* Upload de imagens
* Classificação inteligente de categoria
* Busca por categorias e subcategorias
* Controle de status

### Pesquisa

* Pesquisa textual
* Filtros por:

  * Categoria
  * Subcategoria
  * Estado
  * Cidade
  * Bairro
  * Qualidade
  * Faixa de preço

### Negociação

* Sistema de propostas
* Chat integrado
* Fluxo de negociação
* Controle de retirada
* Conclusão de negociações


### Notificações

* Eventos do sistema
* Atualizações de propostas
* Atualizações de negociações
* Mensagens recebidas

---

## Tecnologias Utilizadas

### Front-End

* HTML5
* CSS3
* JavaScript ES6+
* Bootstrap 5

### Back-End

* Node.js
* Express.js 4

### Persistência

* LocalStorage
* JSON

### Arquitetura

* Componentização
* Serviços especializados
* Separação por responsabilidades
* Páginas independentes
* Navegação desacoplada via NavStorage

---

## Arquitetura do Projeto

```text
public
├── css
├── data
├── icons
├── images
├── js
│   ├── components
│   ├── core
│   ├── data
│   ├── models
│   ├── services
│   └── validation
└── pages
```

### Componentes

```text
components
├── base
├── chat
├── dashboard
├── list-pages
├── profile
├── search
└── ui
```

### Serviços

```text
services
├── auth-service
├── catalog-service
├── category-classifier-service
├── chat-service
├── item-service
├── location-service
├── negotiation-service
├── notification-service
├── proposal-service
├── reputation-service
├── review-service
└── user-service
```

---

## Fluxo Principal

1. Usuário realiza cadastro.
2. Valida telefone.
3. Valida identidade.
4. Publica um anúncio.
5. Interessados enviam propostas.
6. Um chat é criado automaticamente.
7. O processo de negociação é iniciado.
8. As partes realizam a retirada.
9. A negociação é concluída.

---

## Executando o Projeto

### Pré-requisitos

* Node.js
* npm

### Instalação

```bash
npm install
```

### Inicialização

```bash
npm start
```

Após iniciar o servidor, acesse:

```text
http://localhost:4040
```

---

## Usuários Recomendados para Demonstração

### Larissa Barbosa Melo

```text
Email:
larissa.melo@hotmail.com

Senha:
12345
```

### Bruno Teixeira Pinto

```text
Email:
bruno.pinto@hotmail.com

Senha:
12345
```

### Demais Usuários

```text
Senha padrão:
12345
```

---

## Navegadores Suportados

| Navegador       | Suporte |
| --------------- | ------- |
| Google Chrome   | ✅       |
| Microsoft Edge  | ✅       |
| Mozilla Firefox | ✅       |
| Opera           | ✅       |

Recomenda-se a utilização das versões mais recentes.

---

## Dados de Demonstração

O projeto acompanha dados simulados para demonstração das funcionalidades:

* Usuários
* Itens
* Propostas
* Chats
* Mensagens
* Negociações
* Avaliações
* Notificações

Esses dados têm finalidade exclusivamente demonstrativa.

---

## Objetivos do Projeto

O AQQ busca contribuir para:

* Redução do desperdício;
* Reaproveitamento de recursos;
* Economia circular;
* Fortalecimento das comunidades locais;
* Transparência em negociações;
* Destinação consciente de materiais e objetos.

---

## Concurso

Projeto desenvolvido para:

**MoviTalent Tech 2026**
**Fase 2**

---

## Licença

Este projeto está licenciado sob os termos definidos no arquivo LICENSE presente neste repositório.