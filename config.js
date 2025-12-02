// config.js - NUNCA compartilhe esse arquivo publicamente no GitHub!
// Em produção real, sirva esse arquivo só via backend ou use variáveis de ambiente

window.APP_CONFIG = {
  // Chave do Google Maps (restrinja no console do Google: só HTTP referer do seu domínio + Places + Maps JS API)
  GOOGLE_MAPS_API_KEY: "AIzaSyDXdUY1-1VqaKPzSWMnaeAZ_LZy4Cv9QBU", // ← COLOQUE A SUA AQUI

  // Configuração do Firebase (pegue em Project Settings > General > Your apps > Firebase SDK snippet > Config)
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
  },

  // Nome da coleção onde vão ficar as corridas (pode mudar se quiser)
  FIRESTORE_COLLECTION: "corridas",

  // Preço do mototáxi (você pode alterar depois no admin)
  PRECO_BASE: 6.00,        // bandeirada
  PRECO_POR_KM: 2.90       // por quilômetro
};
