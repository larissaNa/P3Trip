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

#### 1. Busca de Viagens na Home (`useHomeViewModel`)

* **Problema:** Dificuldade do usuário em encontrar viagens específicas em uma lista grande. O motor de busca permite filtrar instantaneamente as viagens exibidas na tela inicial digitando termos comuns (como "praia", "serra" ou o nome do destino), melhorando a experiência de navegação e descoberta.
* **Primeiros Testes:** Escritos em `useHomeViewModel.test.ts` antes de qualquer lógica de filtro existir (Fase Red):

  1. **Filtro por termo existente:** Ao chamar `search('praia')`, a lista retornava apenas as viagens que continham essa palavra no título ou destino.
  2. **Limpeza de busca:** Ao passar uma string vazia `search('')`, a lista voltava a exibir todas as viagens originais.
  3. **Filtro case-insensitive:** Validado implicitamente no primeiro teste, garantindo que a busca funcione independente de letras maiúsculas ou minúsculas.
* **Evolução (TDD):**

  1. **Fase Red (Falha):** O teste falhou inicialmente com `TypeError: result.current.search is not a function`, provando que a funcionalidade não existia.
  2. **Fase Green (Funcional):** Implementou-se a solução mais simples possível criando um estado `searchQuery` e um `useEffect` que observava esse estado para atualizar uma lista separada `filteredTravels`, apenas para fazer os testes passarem.
  3. **Fase Refactor (Otimizado):** Refatorou-se a lógica para usar `useMemo`, eliminando estado duplicado (`raw` e `filtered`) e o `useEffect`. A lista filtrada passou a ser um valor computado, reduzindo renderizações desnecessárias e garantindo sincronização com a lista original, sem alterar o comportamento validado pelos testes.

#### 2. Notificações Push (`Push Notifications`)

* **Problema:** Necessidade de gerenciar o registro de notificações Push, garantindo que o app tenha permissão, um token válido e canais configurados (Android) para receber alertas.
* **Primeiros Testes:** Escritos para validar os seguintes cenários:

  1. Bloqueio de execução em dispositivos não físicos.
  2. Sucesso ao obter token quando a permissão é concedida.
  3. Retorno nulo quando a permissão é negada.
  4. Configuração correta do canal de notificação no Android.
  5. Registro dos listeners de notificações.
* **Evolução (TDD):**

  1. **Fase Red (Inexistente):** A funcionalidade não existia, fazendo todos os testes falharem inicialmente.
  2. **Fase Green (Funcional):** Implementou-se uma lógica direta e funcional para garantir a aprovação dos testes.
  3. **Fase Refactor (Organizado):** A lógica foi reorganizada em métodos menores e mais legíveis (`ensurePermissions`, `getPushToken`), mantendo o comportamento validado pelos testes e melhorando a manutenibilidade do código.

### Executando os Testes

Para rodar a suíte de testes automatizados:

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (desenvolvimento)
npm test -- --watch

# Executar testes e verificar cobertura
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
