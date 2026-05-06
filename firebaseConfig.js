/*
  Vale Chess 3D Career - Firebase placeholder
  Multiplayer online ainda nao ativo.

  Quando for ativar:
  1. Crie um projeto no Firebase.
  2. Cole aqui sua configuracao.
  3. Importe Firebase Realtime Database ou Firestore.
  4. Conecte GameState.createGame, joinGame, sendMove e onGameUpdate em script.js.

  Exemplo futuro:

  const firebaseConfig = {
    apiKey: "SUA_CHAVE",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "https://SEU_PROJETO.firebaseio.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "000000000000",
    appId: "APP_ID"
  };

  Sincronizacao prevista:
  - createGame(): cria documento/sala com FEN inicial, jogadores, status e tempo.
  - joinGame(gameId): entra em sala existente.
  - sendMove(move): grava jogada, FEN e timestamp.
  - onGameUpdate(callback): escuta alteracoes remotas e atualiza tabuleiro.
*/
window.firebaseConfig = null;
