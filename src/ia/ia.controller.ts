/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Body, Get, Query, UseGuards, Request } from '@nestjs/common';
import { IaService } from './ia.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly iaService: IaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async chat(@Body() body: { prompt: string }, @Request() req) {
    const userId = req.user.sub;
    const result = await this.iaService.getGeminiResponse(body.prompt, userId);
    return { response: result };
  }

  @Post('quiz')
  @UseGuards(JwtAuthGuard)
  async quiz(@Body() body: { topic: string }, @Request() req) {
    const userId = req.user.sub;
    const quiz = await this.iaService.generateQuiz(body.topic, userId);
    return { quiz };
  }

  @Post('questao')
  @UseGuards(JwtAuthGuard)
  async answer(@Body() body: { question: string; answer: string }, @Request() req) {
    const userId = req.user.sub;
    const result = await this.iaService.evaluateAnswer(body.question, body.answer, userId);
    return { result };
  }

  @Post('mindmap')
  @UseGuards(JwtAuthGuard)
  async mindmap(@Body() body: { topic: string }, @Request() req) {
    const userId = req.user.sub;
    const mindmap = await this.iaService.generateMindMapPrompt(body.topic, userId);
    return { mindmap };
  }

  // Novos endpoints para histórico
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getChatHistory(@Request() req) {
    const userId = req.user.sub;
    const history = await this.iaService.getChatHistory(userId);
    return { history };
  }

  @Get('quiz/history')
  @UseGuards(JwtAuthGuard)
  async getQuizHistory(@Request() req) {
    const userId = req.user.sub;
    const history = await this.iaService.getQuizHistory(userId);
    return { history };
  }

  @Get('mindmap/history')
  @UseGuards(JwtAuthGuard)
  async getMindMapHistory(@Request() req) {
    const userId = req.user.sub;
    const history = await this.iaService.getMindMapHistory(userId);
    return { history };
  }
}
