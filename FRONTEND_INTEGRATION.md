# Guia de Integração do Frontend

## 📋 Visão Geral

Este guia explica como integrar seu frontend com o backend que agora possui:
- ✅ Sistema de usuários
- ✅ Sistema de planos (gratuito/premium)
- ✅ Histórico de interações
- ✅ Controle de requisições

## 🚀 Passo a Passo da Integração

### **1. Configuração Base**

#### **1.1 URL do Backend**
```javascript
const BACKEND_URL = 'https://seu-backend.onrender.com';
```

#### **1.2 Função Helper para Requisições**
```javascript
async function apiRequest(endpoint, options = {}) {
  const url = `${BACKEND_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
```

### **2. Sistema de Usuários**

#### **2.1 Criar Usuário**
```javascript
async function createUser(email, name) {
  return apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify({ email, name })
  });
}

// Uso:
const user = await createUser('joao@exemplo.com', 'João Silva');
console.log('Usuário criado:', user.user.id);
```

#### **2.2 Buscar Usuário por Email (Login)**
```javascript
async function getUserByEmail(email) {
  return apiRequest(`/users/email/${email}`);
}

// Uso:
const user = await getUserByEmail('joao@exemplo.com');
if (user.user) {
  console.log('Usuário encontrado:', user.user);
} else {
  console.log('Usuário não encontrado');
}
```

#### **2.3 Buscar Usuário por ID**
```javascript
async function getUserById(userId) {
  return apiRequest(`/users/${userId}`);
}
```

#### **2.4 Atualizar Usuário**
```javascript
async function updateUser(userId, userData) {
  return apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
}

// Uso:
await updateUser(userId, { name: 'João Silva Atualizado' });
```

#### **2.5 Buscar Estatísticas do Usuário**
```javascript
async function getUserStats(userId) {
  return apiRequest(`/users/${userId}/stats`);
}

// Uso:
const stats = await getUserStats(userId);
console.log('Total de chats:', stats.stats.totalChats);
console.log('Total de quizzes:', stats.stats.totalQuizzes);
```

### **3. Sistema de Planos**

#### **3.1 Ver Todos os Planos**
```javascript
async function getAllPlans() {
  return apiRequest('/plans');
}

// Uso:
const plans = await getAllPlans();
console.log('Planos disponíveis:', plans.plans);
```

#### **3.2 Ver Plano do Usuário**
```javascript
async function getUserPlan(userId) {
  return apiRequest(`/plans/user/${userId}`);
}

// Uso:
const userPlan = await getUserPlan(userId);
console.log('Plano:', userPlan.userPlan.planType);
console.log('Requisições usadas:', userPlan.userPlan.requestsUsed);
console.log('Pode fazer requisição:', userPlan.userPlan.canMakeRequest);
```

#### **3.3 Verificar se Pode Fazer Requisição**
```javascript
async function canMakeRequest(userId) {
  return apiRequest(`/plans/user/${userId}/can-request`);
}

// Uso:
const canRequest = await canMakeRequest(userId);
if (canRequest.canMakeRequest) {
  console.log('Pode fazer requisição');
} else {
  console.log('Limite atingido');
}
```

#### **3.4 Fazer Upgrade para Premium**
```javascript
async function upgradeToPremium(userId, stripeCustomerId = null) {
  return apiRequest(`/plans/user/${userId}/upgrade`, {
    method: 'POST',
    body: JSON.stringify({ stripeCustomerId })
  });
}

// Uso:
await upgradeToPremium(userId);
console.log('Upgrade realizado com sucesso!');
```

#### **3.5 Fazer Downgrade para Gratuito**
```javascript
async function downgradeToFree(userId) {
  return apiRequest(`/plans/user/${userId}/downgrade`, {
    method: 'POST'
  });
}
```

### **4. Sistema de IA (Atualizado)**

#### **4.1 Chat com IA**
```javascript
async function chat(prompt, userId = null) {
  const body = { prompt };
  if (userId) body.userId = userId;
  
  return apiRequest('/chat', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

// Uso:
const response = await chat('Explique o que é JavaScript', userId);
console.log('Resposta:', response.response);
```

#### **4.2 Gerar Quiz**
```javascript
async function generateQuiz(topic, userId = null) {
  const body = { topic };
  if (userId) body.userId = userId;
  
  return apiRequest('/chat/quiz', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

// Uso:
const quiz = await generateQuiz('História do Brasil', userId);
console.log('Quiz gerado:', quiz.quiz);
```

#### **4.3 Avaliar Resposta**
```javascript
async function evaluateAnswer(question, answer, userId = null) {
  const body = { question, answer };
  if (userId) body.userId = userId;
  
  return apiRequest('/chat/questao', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

// Uso:
const evaluation = await evaluateAnswer(
  'O que é JavaScript?',
  'JavaScript é uma linguagem de programação',
  userId
);
console.log('Avaliação:', evaluation.result);
```

#### **4.4 Gerar Mapa Mental**
```javascript
async function generateMindMap(topic, userId = null) {
  const body = { topic };
  if (userId) body.userId = userId;
  
  return apiRequest('/chat/mindmap', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

// Uso:
const mindmap = await generateMindMap('Ciclo da água', userId);
console.log('Mapa mental:', mindmap.mindmap);
```

### **5. Sistema de Histórico**

#### **5.1 Histórico de Chats**
```javascript
async function getChatHistory(userId = null) {
  const url = userId ? `/chat/history?userId=${userId}` : '/chat/history';
  return apiRequest(url);
}

// Uso:
const history = await getChatHistory(userId);
console.log('Histórico de chats:', history.history);
```

#### **5.2 Histórico de Quizzes**
```javascript
async function getQuizHistory(userId = null) {
  const url = userId ? `/chat/quiz/history?userId=${userId}` : '/chat/quiz/history';
  return apiRequest(url);
}
```

#### **5.3 Histórico de Mapas Mentais**
```javascript
async function getMindMapHistory(userId = null) {
  const url = userId ? `/chat/mindmap/history?userId=${userId}` : '/chat/mindmap/history';
  return apiRequest(url);
}
```

## 🔄 Fluxo de Uso Recomendado

### **Fluxo Completo de Integração:**

```javascript
// 1. Criar ou fazer login do usuário
let user;
try {
  // Tentar fazer login
  const loginResult = await getUserByEmail('joao@exemplo.com');
  user = loginResult.user;
} catch (error) {
  // Se não existir, criar novo usuário
  const createResult = await createUser('joao@exemplo.com', 'João Silva');
  user = createResult.user;
}

// 2. Verificar plano do usuário
const userPlan = await getUserPlan(user.id);
console.log(`Plano: ${userPlan.userPlan.planType}`);
console.log(`Requisições: ${userPlan.userPlan.requestsUsed}/${userPlan.userPlan.maxRequests}`);

// 3. Verificar se pode fazer requisição
const canRequest = await canMakeRequest(user.id);
if (!canRequest.canMakeRequest) {
  alert('Limite de requisições atingido. Faça upgrade para premium!');
  return;
}

// 4. Fazer requisição para IA
try {
  const response = await chat('Explique o que é JavaScript', user.id);
  console.log('Resposta da IA:', response.response);
} catch (error) {
  if (error.message.includes('Limite de requisições')) {
    alert('Limite atingido! Faça upgrade para continuar.');
  } else {
    alert('Erro: ' + error.message);
  }
}

// 5. Buscar histórico
const history = await getChatHistory(user.id);
console.log('Histórico:', history.history);
```

## 🛡️ Tratamento de Erros

### **Erros Comuns e Como Tratar:**

```javascript
async function handleApiCall(apiFunction, ...args) {
  try {
    return await apiFunction(...args);
  } catch (error) {
    if (error.message.includes('Limite de requisições')) {
      // Mostrar modal de upgrade
      showUpgradeModal();
    } else if (error.message.includes('Usuário não encontrado')) {
      // Redirecionar para registro
      redirectToRegister();
    } else if (error.message.includes('500')) {
      // Erro do servidor
      showErrorMessage('Erro interno do servidor. Tente novamente.');
    } else {
      // Outros erros
      showErrorMessage('Erro: ' + error.message);
    }
    throw error;
  }
}
```

## 📱 Exemplo de Componente React

```jsx
import React, { useState, useEffect } from 'react';

function ChatComponent() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Login do usuário
  const loginUser = async (email) => {
    try {
      const result = await getUserByEmail(email);
      setUser(result.user);
      await loadUserPlan(result.user.id);
    } catch (error) {
      alert('Erro ao fazer login: ' + error.message);
    }
  };

  // Carregar plano do usuário
  const loadUserPlan = async (userId) => {
    try {
      const result = await getUserPlan(userId);
      setUserPlan(result.userPlan);
    } catch (error) {
      console.error('Erro ao carregar plano:', error);
    }
  };

  // Enviar mensagem
  const sendMessage = async () => {
    if (!prompt.trim() || !user) return;

    setLoading(true);
    try {
      const result = await chat(prompt, user.id);
      setMessages(prev => [...prev, { prompt, response: result.response }]);
      setPrompt('');
      
      // Recarregar plano para atualizar contador
      await loadUserPlan(user.id);
    } catch (error) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!user ? (
        <div>
          <h3>Faça login para continuar</h3>
          <input 
            type="email" 
            placeholder="Email"
            onKeyPress={(e) => e.key === 'Enter' && loginUser(e.target.value)}
          />
        </div>
      ) : (
        <div>
          <div className="user-info">
            <h3>Bem-vindo, {user.name}!</h3>
            {userPlan && (
              <div>
                <p>Plano: {userPlan.planType === 'free' ? '🆓 Gratuito' : '⭐ Premium'}</p>
                <p>Requisições: {userPlan.requestsUsed}/{userPlan.maxRequests === -1 ? '∞' : userPlan.maxRequests}</p>
                {!userPlan.canMakeRequest && (
                  <button onClick={() => upgradeToPremium(user.id)}>
                    ⭐ Fazer Upgrade
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="chat">
            {messages.map((msg, index) => (
              <div key={index}>
                <p><strong>Você:</strong> {msg.prompt}</p>
                <p><strong>IA:</strong> {msg.response}</p>
              </div>
            ))}
          </div>

          <div className="input-area">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Digite sua pergunta..."
              disabled={loading || (userPlan && !userPlan.canMakeRequest)}
            />
            <button 
              onClick={sendMessage}
              disabled={loading || !prompt.trim() || (userPlan && !userPlan.canMakeRequest)}
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 🎯 Pontos Importantes

### **1. Gerenciamento de Estado**
- Sempre mantenha o `userId` em estado global (Context, Redux, etc.)
- Atualize o plano do usuário após cada requisição
- Mostre feedback visual do limite de requisições

### **2. UX/UI**
- Mostre contador de requisições restantes
- Alerte quando próximo do limite (ex: 4/5 requisições)
- Ofereça upgrade quando atingir limite
- Mostre loading states durante requisições

### **3. Segurança**
- Nunca exponha o `userId` em URLs públicas
- Valide dados antes de enviar para o backend
- Trate erros adequadamente

### **4. Performance**
- Cache o plano do usuário localmente
- Use debounce para requisições de chat
- Implemente retry logic para falhas de rede

## 🔧 Configuração Final

### **Variáveis de Ambiente (Frontend)**
```javascript
// .env
REACT_APP_BACKEND_URL=https://seu-backend.onrender.com
```

### **Uso no Código**
```javascript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
```

Agora seu frontend está pronto para se integrar completamente com o backend! 🚀 