# Requisitos Funcionais (RF)

Este documento descreve as funcionalidades do sistema, divididas entre a aplicação móvel e o painel administrativo.

## 1. Aplicativo Móvel (Client)

### RF01 - Listagem de Viagens
O sistema deve recuperar dados da tabela `viagens` no Supabase e renderizar um feed vertical.
- **Rastreabilidade:** [RNF03](../requisitos/nao-funcionais.md#rnf03---desempenho-do-supabase)

### RF02 - Detalhes da Viagem
Ao selecionar um card, o sistema deve exibir: título, descrição, preço e galeria de imagens.

### RF03 - Carrossel de Imagens
Renderização de mídia via URLs (públicas ou assinadas) originadas do Supabase Storage.
- **Rastreabilidade:** [RNF17](../requisitos/nao-funcionais.md#rnf17---experiencia-de-usuario)

### RF04 - Persistência Local (Favoritos)
Permitir ao usuário salvar viagens de interesse no armazenamento local do dispositivo.
- **Tecnologia:** AsyncStorage.

### RF05 - Consulta de Viagens Salvas
Tela dedicada para exibição de registros armazenados localmente no dispositivo.

### RF06 - Operação em Modo Offline
O sistema deve garantir a disponibilidade de dados previamente cacheados e viagens salvas na ausência de conectividade.
- **Rastreabilidade:** [RNF04](../requisitos/nao-funcionais.md#rnf04---confiabilidade-no-modo-offline)

### RF07 - Notificações Push
Integração com Expo Push Notifications para alertas de novos cadastros via gatilhos do admin.
- **Rastreabilidade:** [RNF10](../requisitos/nao-funcionais.md#rnf10---notificacoes-responsivas)

### RF12 - Motor de Busca e Filtros
Implementação de filtros por destino, faixa de preço e busca textual por palavras-chave.

---

## 2. Painel Administrativo (Web)

### RF08 - Gestão de Conteúdo (CRUD)
Interface para cadastro, edição e exclusão de viagens (título, destino, preço e metadados).
- **Rastreabilidade:** [RNF06](../requisitos/nao-funcionais.md#rnf06---seguranca)

### RF10 - Gestão de Mídia (Storage)
Upload de múltiplos arquivos para buckets específicos do Supabase Storage.

### RF11 - Integridade de Dados (Cleanup)
A exclusão de um registro de viagem deve disparar a remoção automática dos objetos relacionados no Storage.