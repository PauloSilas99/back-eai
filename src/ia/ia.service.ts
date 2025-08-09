import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';
import { PlansService } from '../plans/plans.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class IaService {
  private genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
    private readonly plansService: PlansService,
  ) {}

  async getGeminiResponse(prompt: string, userId?: string): Promise<string> {
    // Validar se o usuário existe se userId for fornecido
    if (userId) {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se o usuário pode fazer requisição
      await this.usersService.checkRequestLimit(userId);
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const response = await result.response;
    const responseText = response.text();

    // Salva a conversa no Supabase
    await this.saveChat(prompt, responseText, userId);

    // Incrementa o contador de requisições se houver userId
    if (userId) {
      await this.usersService.incrementRequestCount(userId);
    }

    return responseText;
  }

  async generateQuiz(topic: string, userId?: string): Promise<any> {
    // Validar se o usuário existe se userId for fornecido
    if (userId) {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se o usuário pode fazer requisição
      await this.usersService.checkRequestLimit(userId);
    }

    const prompt = `
      Gere um quiz de 15 perguntas de múltipla escolha sobre o tópico "${topic}".
      - 5 perguntas fáceis, 5 médias e 5 difíceis.
      - Cada pergunta deve ter alternativas a, b, c, d, e (apenas uma correta).
      - Indique a alternativa correta.
      - Formate a resposta como um array de objetos: 
        { nivel: "fácil|médio|difícil", pergunta: "...", alternativas: { a: "...", b: "...", c: "...", d: "...", e: "..." }, correta: "a|b|c|d|e" }
      Responda apenas com o JSON, sem explicações ou comentários.
    `;
    const response = await this.getGeminiResponse(prompt, userId);

    // Tenta extrair o primeiro array JSON da resposta
    const match = response.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const quiz = JSON.parse(match[0]);
        
        // Salva o quiz no Supabase
        await this.saveQuiz(topic, quiz, userId);
        
        return quiz;
      } catch (e) {
        console.error('Falha ao fazer parse do JSON extraído:', e);
        throw new Error('A resposta da IA não está em formato JSON válido.');
      }
    } else {
      console.error('Nenhum array JSON encontrado na resposta:', response);
      throw new Error('A resposta da IA não contém um array JSON.');
    }
  }

  async evaluateAnswer(question: string, answer: string, userId?: string): Promise<any> {
    // Validar se o usuário existe se userId for fornecido
    if (userId) {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se o usuário pode fazer requisição
      await this.usersService.checkRequestLimit(userId);
    }

    const prompt = `
      Avalie a seguinte resposta para a pergunta abaixo.
      Pergunta: "${question}"
      Resposta do usuário: "${answer}"
      Avalie o nível de complexidade da pergunta, avalie se a resposta está bem elaborada.O que pode ser acrescentado na resposta do usuário para melhorar seus estudos dessa materia.
      Dê um feedback objetivo, diga se está correta ou não, e explique o motivo.
      Responda apenas em JSON no formato:
      { "correta": true|false, "feedback": "...", "melhorar": "..." }
    `;
    const response = await this.getGeminiResponse(prompt, userId);

    // Tenta extrair o JSON da resposta
    const match = response.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const evaluation = JSON.parse(match[0]);
        
        // Salva a avaliação no Supabase
        await this.saveQuestionEvaluation(question, answer, evaluation, userId);
        
        return evaluation;
      } catch (e) {
        console.error('Falha ao fazer parse do JSON extraído:', e);
        throw new Error('A resposta da IA não está em formato JSON válido.');
      }
    } else {
      console.error('Nenhum JSON encontrado na resposta:', response);
      throw new Error('A resposta da IA não contém um objeto JSON.');
    }
  }

  async generateMindMapPrompt(topic: string, userId?: string): Promise<any> {
    // Validar se o usuário existe se userId for fornecido
    if (userId) {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se o usuário pode fazer requisição
      await this.usersService.checkRequestLimit(userId);
    }

    const prompt = `
      Gere um mapa mental sobre o tema "${topic}".
      Estruture o resultado em JSON, seguindo o formato:
      {
        "nodes": [
          { "id": "1", "label": "Tópico principal" },
          { "id": "2", "label": "Subtópico 1", "parent": "1" },
          { "id": "3", "label": "Subtópico 2", "parent": "1" }
          // ...outros nós...
        ]
      }
      Os nós devem representar os principais conceitos e ramificações do tema, prontos para serem usados em bibliotecas de mapas mentais como o React Flow.
      Responda apenas com o JSON, sem explicações ou comentários.
    `;
    const response = await this.getGeminiResponse(prompt, userId);

    // Extrai o JSON da resposta
    const match = response.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const mindmap = JSON.parse(match[0]);
        
        // Salva o mapa mental no Supabase
        await this.saveMindMap(topic, mindmap, userId);
        
        return mindmap;
      } catch (e) {
        console.error('Falha ao fazer parse do JSON extraído:', e);
        throw new Error('A resposta da IA não está em formato JSON válido.');
      }
    } else {
      console.error('Nenhum JSON encontrado na resposta:', response);
      throw new Error('A resposta da IA não contém um objeto JSON.');
    }
  }

  // Métodos para interagir com o Supabase

  async saveChat(prompt: string, response: string, userId?: string): Promise<any> {
    const chatData = {
      prompt,
      response,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    return await this.supabaseService.insert('chats', chatData);
  }

  async saveQuiz(topic: string, quiz: any, userId?: string): Promise<any> {
    const quizData = {
      topic,
      quiz_data: quiz,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    return await this.supabaseService.insert('quizzes', quizData);
  }

  async saveMindMap(topic: string, mindmap: any, userId?: string): Promise<any> {
    const mindmapData = {
      topic,
      mindmap_data: mindmap,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    return await this.supabaseService.insert('mindmaps', mindmapData);
  }

  async saveQuestionEvaluation(question: string, answer: string, evaluation: any, userId?: string): Promise<any> {
    const evaluationData = {
      question,
      answer,
      evaluation_data: evaluation,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    return await this.supabaseService.insert('question_evaluations', evaluationData);
  }

  async getChatHistory(userId?: string, limit: number = 10): Promise<any> {
    const query = userId ? { user_id: userId } : undefined;
    return await this.supabaseService.select('chats', query);
  }

  async getQuizHistory(userId?: string, limit: number = 10): Promise<any> {
    const query = userId ? { user_id: userId } : undefined;
    return await this.supabaseService.select('quizzes', query);
  }

  async getMindMapHistory(userId?: string, limit: number = 10): Promise<any> {
    const query = userId ? { user_id: userId } : undefined;
    return await this.supabaseService.select('mindmaps', query);
  }
}
