/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { IaService } from './ia.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly iaService: IaService) {}

  @Post()
  async chat(@Body() body: { prompt: string; userId?: string }) {
    const result = await this.iaService.getGeminiResponse(body.prompt, body.userId);
    return { response: result };
  }

  @Post('quiz')
  async quiz(@Body() body: { topic: string; userId?: string }) {
    const quiz = await this.iaService.generateQuiz(body.topic, body.userId);
    return { quiz };
  }

  @Post('questao')
  async answer(@Body() body: { question: string; answer: string; userId?: string }) {
    const result = await this.iaService.evaluateAnswer(body.question, body.answer, body.userId);
    return { result };
  }

  @Post('mindmap')
  async mindmap(@Body() body: { topic: string; userId?: string }) {
    const mindmap = await this.iaService.generateMindMapPrompt(body.topic, body.userId);
    return { mindmap };
  }

  // Novos endpoints para histórico
  @Get('history')
  async getChatHistory(@Query('userId') userId?: string) {
    const history = await this.iaService.getChatHistory(userId);
    return { history };
  }

  @Get('quiz/history')
  async getQuizHistory(@Query('userId') userId?: string) {
    const history = await this.iaService.getQuizHistory(userId);
    return { history };
  }

  @Get('mindmap/history')
  async getMindMapHistory(@Query('userId') userId?: string) {
    const history = await this.iaService.getMindMapHistory(userId);
    return { history };
  }
}
