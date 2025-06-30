/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Body } from '@nestjs/common';
import { IaService } from './ia.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly iaService: IaService) {}

  @Post()
  async chat(@Body() body: { prompt: string }) {
    const result = await this.iaService.getGeminiResponse(body.prompt);
    return { response: result };
  }

  @Post('quiz')
  async quiz(@Body('topic') topic: string) {
    const quiz = await this.iaService.generateQuiz(topic);
    return { quiz };
  }

  @Post('questao')
  async answer(@Body() body: { question: string; answer: string }) {
    const result = await this.iaService.evaluateAnswer(body.question, body.answer);
    return { result };
  }

  @Post('mindmap')
  async mindmap(@Body('topic') topic: string) {
    const mindmap = await this.iaService.generateMindMapPrompt(topic);
    return { mindmap };
  }
}
