# Requisitos Não Funcionais (RNF)

Este documento especifica os critérios de operação, restrições e qualidades técnicas do sistema.

## 1. Arquitetura e Infraestrutura

### RNF01 - Compatibilidade de Plataforma
Distribuição via Android App Bundle (AAB). Suporte mínimo: Android API Level 21.

### RNF07 - Manutenibilidade e Modularização
A estrutura de código deve seguir o padrão de inversão de dependência para serviços de API, Storage e Cache Local.

### RNF08 - Provedor de Nuvem
Utilização da infraestrutura Supabase para banco de dados relacional (PostgreSQL) e armazenamento de objetos.

## 2. Desempenho e Segurança

### RNF03 - Desempenho do Supabase
O tempo de resposta das consultas em rede deve ser inferior a 500ms sob condições normais.
- **Relacionado a:** [RF01](./funcionais.md#rf01---listagem-de-viagens)

### RNF06 - Segurança
Implementação de Row Level Security (RLS). Operações de escrita permitidas apenas para usuários autenticados como administrador.
- **Relacionado a:** [RF08](./funcionais.md#rf08---gestao-de-conteudo-crud)

### RNF09 - Otimização de Ativos
Imagens devem ser submetidas a compressão via software antes do upload para o Storage para redução de consumo de banda.

## 3. Disponibilidade e UX

### RNF04 - Confiabilidade no Modo Offline
Garantir a persistência de estado e dados essenciais via AsyncStorage.
- **Relacionado a:** [RF06](./funcionais.md#rf06---operacao-em-modo-offline)

### RNF17 - Experiência de Usuário
Uso de estratégias de *Lazy Loading* e cache de imagens para otimização de renderização no feed.
- **Relacionado a:** [RF03](./funcionais.md#rf03---carrossel-de-imagens)