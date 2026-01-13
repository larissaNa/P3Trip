# P3Trip

## Descrição
P3Trip é um aplicativo mobile desenvolvido para facilitar a descoberta e o agendamento de pacotes de viagens, saindo da cidade de Piripiri. A plataforma permite que usuários explorem roteiros turísticos, comparem opções, visualizem detalhes dos destinos e realizem agendamentos de forma simples e rápida.

O projeto visa fomentar o turismo local, oferecendo uma interface intuitiva para que os viajantes encontrem sua próxima aventura.

## Funcionalidades
- **Catálogo de Viagens:** Visualização de pacotes de viagens disponíveis com fotos e descrições.
- **Detalhes da Viagem:** Informações completas sobre roteiro, valores e datas.
- **Favoritos (Salvar Viagens):** Possibilidade de salvar viagens para visualização posterior, com suporte offline.
- **Agendamento via WhatsApp:** Integração direta para iniciar conversa de reserva com mensagem pré-definida.
- **Modo Offline:** Visualização de viagens salvas mesmo sem conexão com a internet.

## Tecnologias Utilizadas
- **Linguagem:** TypeScript
- **Framework:** React Native (Expo)
- **Gerenciamento de Estado:** React Hooks & Context (MVVM Pattern)
- **Banco de Dados / Backend:** Supabase
- **Armazenamento Local:** AsyncStorage
- **Navegação:** React Navigation
- **Testes:** Jest, React Test Renderer

## Arquitetura MVVM

Este projeto foi desenvolvido seguindo estritamente o padrão de arquitetura **MVVM (Model-View-ViewModel)**, conforme exigido na disciplina de **Programação para Dispositivos Móveis**.

A escolha desta arquitetura visa promover a separação de responsabilidades, testabilidade e manutenibilidade do código.

- **Model (`src/model`):** Responsável pela lógica de dados e regras de negócio. Inclui as Entidades (`Travel`), Serviços (`TravelService`) e Repositórios. É independente da interface do usuário.
- **View (`src/view`):** Responsável pela interface visual (UI). As Views (Telas e Componentes) são "burras" e apenas observam os dados fornecidos pela ViewModel, sem conter lógica de negócios complexa.
- **ViewModel (`src/viewmodel`):** Atua como intermediário entre a View e a Model. Ela expõe os dados e comandos para a View e interage com a Model para buscar ou salvar dados. No projeto, as ViewModels são implementadas como Custom Hooks (ex: `useHomeViewModel`), gerenciando o estado da tela e efeitos colaterais.

Essa estrutura garante que a lógica de apresentação esteja desacoplada da lógica de negócios e da interface visual, facilitando testes unitários e a evolução do projeto.

## Instalação

Para executar este projeto localmente, siga os passos abaixo:

1. **Pré-requisitos:**
   - Node.js instalado (LTS recomendado).
   - Gerenciador de pacotes npm ou yarn.
   - Dispositivo físico ou emulador (Android/iOS) configurado.

2. **Clone o repositório:**
   ```bash
   git clone https://github.com/larissaNa/P3Trip.git
   cd P3Trip
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

4. **Configuração de Ambiente:**
   - O projeto utiliza Supabase. Certifique-se de configurar as chaves de API necessárias no arquivo `src/infra/supabase/supabase.ts` ou variáveis de ambiente conforme necessário.

## Uso

1. **Iniciar o projeto:**
   ```bash
   npx expo start
   ```

2. **Executar no dispositivo:**
   - Utilize o aplicativo **Expo Go** no seu celular para escanear o QR Code gerado no terminal.
   - Ou pressione `a` para abrir no emulador Android, ou `i` para o simulador iOS.

## Estrutura do Projeto

A estrutura de pastas segue uma arquitetura limpa e modular:

```
src/
├── infra/          # Configurações de infraestrutura (ex: Supabase)
├── model/          # Camada de Dados
│   ├── entities/     # Definições de tipos e interfaces (Models)
│   ├── repositories/ # Acesso a dados (API/Local)
│   └── services/     # Regras de negócio e orquestração de dados
├── view/           # Camada de Apresentação (UI)
│   ├── components/   # Componentes reutilizáveis (Cards, Navbar)
│   └── *.tsx         # Telas da aplicação (Screens)
├── viewmodel/      # Camada de Lógica de Apresentação (Hooks)
│   └── *.ts          # Lógica de estado e interação das telas
└── navigator/      # Configuração de rotas e navegação
```

## Documentação de Testes

### Estratégia Geral de Testes
O projeto adota uma estratégia de testes focada na **garantia da lógica de negócios** e **resiliência da interface**. Utilizamos **Jest** como runner e **React Test Renderer** para testar Hooks e Componentes.

### Distribuição de Testes (Unitários vs Integração)
- **Testes Unitários (Maioria):** Focados na camada `ViewModel`, `Services` e `Repositories`.
  - *Justificativa:* A lógica complexa de estado, manipulação de dados e regras de negócio reside aqui. Testes unitários são rápidos e isolam falhas com precisão.
- **Testes de Integração:** Validam o fluxo completo entre as camadas **View ↔ ViewModel ↔ Services ↔ Repositories**.
  - *Localização:* `__test__/integration/`
  - *Justificativa:* Garantem que a interface do usuário (View) interage corretamente com a lógica de negócios e persistência, simulando cenários reais de uso (ex: carregar lista, favoritar viagem, persistência offline) utilizando mocks para dependências externas (Supabase, Navegação).

### Executando os Testes
Para rodar a suíte de testes completa:
```bash
npm test
```

### Funcionalidades Desenvolvidas com TDD

Aplicamos o Test-Driven Development (TDD) em funcionalidades críticas para garantir robustez desde o início.

#### 1. Gerenciamento de Viagens Salvas (`useSavedTripsViewModel`)
- **Problema:** Necessidade de carregar viagens salvas apenas quando a tela ganha foco, lidar com estados de carregamento e falhas silenciosas.
- **Primeiro Teste:** `carrega viagens salvas no foco com sucesso`. O teste falhou inicialmente pois a lógica não existia.
- **Evolução:**
  1. Implementou-se o `loadSaved` básico -> Teste passou.
  2. Adicionou-se o `useFocusEffect` para recarregar ao voltar para a tela -> Novos testes de recarga.
  3. Adicionou-se tratamento de erro (`try/catch`) para garantir que a lista fique vazia em caso de falha, sem quebrar o app.

#### 2. Ações de Detalhes da Viagem (`useTravelDetailsViewModel`)
- **Problema:** O usuário precisa favoritar viagens (toggle) com feedback instantâneo (Optimistic UI) e abrir o WhatsApp com mensagem formatada.
- **Primeiro Teste:** `toggleSave alterna o estado e chama o service`.
- **Evolução:**
  1. Implementou-se a troca de estado local -> Teste passou.
  2. Criou-se o teste `reverte o estado quando service retorna false` para garantir consistência de dados.
  3. Implementou-se a lógica de reversão (rollback) no `catch` e `if(!ok)`.
  4. Implementou-se a função `openWhatsApp` garantindo a codificação correta da URL (URL Encoding) através de testes específicos de string.

### Executando os Testes

Para rodar a suíte de testes automatizados:

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (desenvolvimento)
npm test -- --watch

# Executar testes e verificar cobertura (opcional se configurado)
npm test -- --coverage

#Executar testes de imtegração
npx jest __test__/integration/SavedTripsIntegration.test.tsx
```

## Contribuição
1. Faça um Fork do projeto.
2. Crie uma Branch para sua Feature (`git checkout -b feature/NovaFeature`).
3. Faça o Commit de suas mudanças (`git commit -m 'Adiciona NovaFeature'`).
4. Faça o Push para a Branch (`git push origin feature/NovaFeature`).
5. Abra um Pull Request.

## Licença
Este projeto está sob a licença MIT.

## Autoria

Este projeto foi desenvolvido pela equipe:

- **Maria Isabelly de Brito Rodrigues**
- **Larissa Souza Nascimento**
- **Luís Guilherme Sampaio Fontenele**
- **Vanessa Pereira Cunha**
- **Júlio César Cerqueira Pires**
