# Surf Forecast RJ - Extensão do Chrome 🏄‍♂️

Extensão do Google Chrome que mostra, num popup, as condições de surf, swell, vento e a maré dos principais picos do Rio de Janeiro.

## 🌊 Picos inclusos

Arpoador, Praia do Diabo, Copacabana (P5 e P6), Leme, Grumari, Prainha, Recreio e Barra da Tijuca.

## ✨ O que ela mostra

- Altura, período e direção das ondas, com uma indicação geral da condição
- Vento (velocidade e direção)
- Gráfico de marés, com os valores de maré alta e baixa
- Lista de previsão para os próximos dias
- Pico escolhido fica salvo para a próxima vez que você abrir

Os dados vêm da [Open-Meteo](https://open-meteo.com/) (Marine e Forecast). São previsões de modelo e não substituem a observação local.

## 💻 Como instalar no Chrome

A extensão ainda não está na Chrome Web Store, então a instalação é manual:

1. **Baixe o projeto:** nesta página do GitHub, clique em **Code → Download ZIP**.
2. **Extraia o ZIP** em uma pasta do seu computador (clique com o botão direito → Extrair tudo).
3. No Chrome, abra `chrome://extensions`.
4. Ative o **Modo do desenvolvedor** (canto superior direito).
5. Clique em **Carregar sem compactação** e selecione a pasta extraída, a que contém o arquivo `manifest.json`.
6. Clique no ícone de quebra-cabeça 🧩 da barra do Chrome e fixe a extensão **Surf Forecast RJ** para ter acesso rápido.

### Atualizar para uma versão nova

Baixe o ZIP de novo, substitua os arquivos da pasta e, em `chrome://extensions`, clique no botão de recarregar (🔄) da extensão.

## ❓ Problemas comuns

- **"Não foi possível carregar o manifesto":** você selecionou a pasta errada. Escolha a pasta que tem o `manifest.json` direto dentro dela.
- **Popup sem dados:** verifique sua conexão e use o botão de atualizar do popup.

## 🛠️ Para desenvolvedores

Arquivos principais: `manifest.json` (Manifest V3), `popup.html`, `popup.css` e `popup.js`. A extensão pede apenas a permissão `storage` e acesso às APIs da Open-Meteo.

## 📊 Versão web

Existe também um painel web, com 13 picos, favoritos e exportação em CSV, em um projeto separado.
