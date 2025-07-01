import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class IaService {
  private genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

  async getGeminiResponse(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(prompt);
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const response = await result.response;

    return response.text();
  }

  async generateQuiz(topic: string): Promise<any> {
    const prompt = `
      Gere um quiz de 15 perguntas de múltipla escolha sobre o tópico "${topic}".
      - 5 perguntas fáceis, 5 médias e 5 difíceis.
      - Cada pergunta deve ter alternativas a, b, c, d, e (apenas uma correta).
      - Indique a alternativa correta.
      - Formate a resposta como um array de objetos: 
        { nivel: "fácil|médio|difícil", pergunta: "...", alternativas: { a: "...", b: "...", c: "...", d: "...", e: "..." }, correta: "a|b|c|d|e" }
      Responda apenas com o JSON, sem explicações ou comentários.
    `;
    const response = await this.getGeminiResponse(prompt);

    // Tenta extrair o primeiro array JSON da resposta
    const match = response.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        console.error('Falha ao fazer parse do JSON extraído:', e);
        throw new Error('A resposta da IA não está em formato JSON válido.');
      }
    } else {
      console.error('Nenhum array JSON encontrado na resposta:', response);
      throw new Error('A resposta da IA não contém um array JSON.');
    }
  }

  async evaluateAnswer(question: string, answer: string): Promise<any> {
    const prompt = `
      Avalie a seguinte resposta para a pergunta abaixo.
      Pergunta: "${question}"
      Resposta do usuário: "${answer}"
      Avalie o nível de complexidade da pergunta, avalie se a resposta está bem elaborada.O que pode ser acrescentado na resposta do usuário para melhorar seus estudos dessa materia.
      Dê um feedback objetivo, diga se está correta ou não, e explique o motivo.
      Responda apenas em JSON no formato:
      { "correta": true|false, "feedback": "...", "melhorar": "..." }
    `;
    const response = await this.getGeminiResponse(prompt);

    // Tenta extrair o JSON da resposta
    const match = response.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        console.error('Falha ao fazer parse do JSON extraído:', e);
        throw new Error('A resposta da IA não está em formato JSON válido.');
      }
    } else {
      console.error('Nenhum JSON encontrado na resposta:', response);
      throw new Error('A resposta da IA não contém um objeto JSON.');
    }
  }

  async generateMindMapPrompt(topic: string): Promise<any> {
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
    const response = await this.getGeminiResponse(prompt);

    // Extrai o JSON da resposta
    const match = response.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        console.error('Falha ao fazer parse do JSON extraído:', e);
        throw new Error('A resposta da IA não está em formato JSON válido.');
      }
    } else {
      console.error('Nenhum JSON encontrado na resposta:', response);
      throw new Error('A resposta da IA não contém um objeto JSON.');
    }
  }
}
