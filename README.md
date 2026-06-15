# GoLyrics

> **Overlay de letras em tempo real para o OBS Studio**, integrado com o software Holyrics via HTTP Polling.

---

## ✨ Visão Geral

O **GoLyrics** é uma solução de overlay para transmissões ao vivo e apresentações no OBS Studio. Ele recebe as letras exibidas no Holyrics em tempo real e as renderiza na tela com animações, estilos tipográficos personalizados e suporte a marcações especiais de formatação — tudo controlado por um painel web intuitivo.

A arquitetura é composta por **dois arquivos HTML independentes**:

| Arquivo           | Função                                                                 |
|-------------------|------------------------------------------------------------------------|
| `control.html`    | Painel de controle: configura estilos, conecta ao Holyrics e gerencia temas |
| `overlay.html`    | Página do overlay: renderiza as letras no OBS via Browser Source       |

A comunicação entre eles é feita através da **BroadcastChannel API** do navegador, permitindo comunicação em tempo real entre abas da mesma origem, sem necessidade de servidor.

---

## 📁 Estrutura do Projeto

```
GoLyrics/
├── control.html      # Painel de controle da aplicação
├── control.css       # Estilos do painel de controle 
├── control.js        # Lógica do painel: estado, conexão e broadcast
├── overlay.html      # Página do overlay (Browser Source no OBS)
├── overlay.css       # Estilos do overlay + animações CSS
└── overlay.js        # Lógica do overlay: renderização e animações
```

---

## 🚀 Como Usar

### 1. Configurar o OBS

1. No OBS Studio, adicione uma **Fonte de Navegador (Browser Source)**.
2. Aponte para o arquivo `overlay.html` usando o caminho local:
   ```
   file:///C:/caminho/para/GoLyrics/overlay.html
   ```
3. Defina a resolução para **1920×1080** (ou a resolução da sua cena).

### 2. Abrir o Painel de Controle

1. No OBS Studio, vá em Painéis > Painéis Personalizados com URL > Adicionar . . .
2. Coloque a URL do arquivo `control.html`.
3. Clique em Aplicar.

### 3. Conectar ao Holyrics

1. No painel, insira a URL do Holyrics no campo de conexão (ex.: `http://192.168.10.9:80/view/text`).
   - A URL é salva automaticamente para a próxima sessão.
2. Ative o toggle no cabeçalho para iniciar a conexão.
3. O indicador ao lado do campo mostrará o status da conexão.

### 4. Personalizar e Transmitir

Ajuste as opções de estilo no painel — as alterações são aplicadas no overlay em **tempo real**.

---

## 🎨 Funcionalidades do Painel de Controle

### Gerenciamento de Temas
- **Salvar Tema**: Salva todas as configurações de estilo atuais com um nome personalizado no `localStorage`.
- **Carregar Tema**: Aplica um tema salvo previamente ao overlay instantaneamente.
- **Apagar Tema**: Remove um tema salvo da lista.

### Margens de Segurança
- Controle individual das margens superior, inferior, esquerda e direita (em `%`).
- Botão de **visualização de margens** no OBS: exibe uma grade de referência diretamente no overlay para alinhamento preciso.

### Estilização Global
Controle completo da tipografia e aparência do texto:

| Propriedade       | Descrição                                         |
|-------------------|---------------------------------------------------|
| Fonte Principal   | Nome de qualquer fonte do Google Fonts            |
| Tamanho           | Tamanho em pixels                                 |
| Cor do Texto      | Seletor de cor com preview hexadecimal            |
| Sombra            | Predefinições: Sem sombra, Suave, Média, Forte    |
| Contorno (Stroke) | Espessura e cor do contorno do texto              |
| Espaçamento       | Letter-spacing em pixels                          |
| Altura da Linha   | Line-height com valor numérico                    |
| Opacidade         | Opacidade de 0% a 100%                            |
| Alinhamento H/V   | Esquerda/Centro/Direita e Topo/Meio/Baixo         |
| Formatação        | Maiúsculas, Negrito, Itálico, Sublinhado, Tachado |

### Caixa de Texto
Adiciona um fundo ao redor das letras, com dois modos:
- **Bloco Inteiro**: Caixa única envolvendo todo o bloco de texto.
- **Por Linha (Destacado)**: Caixa individual por linha, com suporte a `box-decoration-break`.

Controles: cor, opacidade, preenchimento (padding) e arredondamento.

### Animações
Define o efeito de entrada e saída das letras:

| Entrada       | Saída        |
|---------------|--------------|
| Fade In       | Fade Out     |
| Slide Up      | Slide Up     |
| Slide Down    | Slide Down   |
| Zoom In       | Zoom Out     |
| Blur In       | Blur Out     |

Também permite configurar a **duração** da animação (0.1s – 3s).

### Preview e Teste Manual
Área de texto para enviar letras manualmente ao overlay, sem precisar do Holyrics. Útil para ajustar estilos antes da transmissão.

### Módulo de Estilização Especial
Permite definir estilos diferenciados para palavras marcadas com caracteres especiais no texto:

| Marcação      | Estilo |
|---------------|--------|
| `*asteriscos*` | Estilo 1 — cor, fonte e formatação próprias |
| `{chaves}`     | Estilo 2 — cor, fonte e formatação próprias |
| `~til~`        | Estilo 3 — cor, fonte e formatação próprias |

Cada estilo possui opção de **herdar a formatação global** (negrito, maiúsculas etc.) ou definir uma formatação própria.

---

## 🖥️ Funcionalidades do Overlay

- **Renderização automática** de letras recebidas via BroadcastChannel.
- **Animações de entrada e saída** com keyframes CSS.
- **Limpeza automática** da tela quando o Holyrics retorna `type: "empty"` ou `text: ""` (música removida).
- **Carregamento dinâmico de fontes** do Google Fonts sob demanda.
- **Suporte a marcações** `*`, `{}` e `~` convertidas para `<span>` com classes de estilo.
- **Guia de margens** togglável via painel de controle.

---

## 💾 Persistência de Dados

Todos os dados são armazenados no `localStorage` do navegador, sem necessidade de servidor ou banco de dados:

| Chave                | Conteúdo                                    |
|----------------------|---------------------------------------------|
| `holyrics_url`       | URL de conexão com o Holyrics               |
| `holyrics_themes`    | Objeto JSON com todos os temas salvos       |

---

## 🛠️ Tecnologias Utilizadas

- **HTML**.
- **CSS**.
- **JavaScript**.
- **Google Fonts**.
- **BroadcastChannel API**.

---

## 📝 Licença

Este projeto é de uso livre e pessoal. Sinta-se à vontade para adaptar e distribuir conforme sua necessidade.

---

Me siga no instagram @https.victor073

<div align="center">
  Feito com ❤️ para facilitar a apresentação de letras em cultos e eventos ao vivo.
</div>

<div align="center">
  A Deus, nosso criador e mantenedor.
</div>
