import { Controller, Post, Get, Body, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CodegenWorkflowService } from './codegen-workflow.service';
import { BaseResponse } from '../common/response/base-response';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: CodegenWorkflowService) {}

  @Post('execute')
  async execute(@Body('prompt') prompt: string) {
    const result = await this.workflowService.execute(prompt);
    return BaseResponse.success(result);
  }

  @Get('execute-flux')
  async executeFlux(
    @Query('prompt') prompt: string,
    @Res() response: Response,
  ) {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');

    try {
      for await (const event of this.workflowService.executeStream(prompt)) {
        response.write(
          `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`,
        );
      }
    } catch (err) {
      response.write(
        `event: workflow-error\ndata: ${JSON.stringify({ error: err instanceof Error ? err.message : String(err) })}\n\n`,
      );
    } finally {
      response.end();
    }
  }

  @Get('execute-sse')
  async executeSse(@Query('prompt') prompt: string, @Res() response: Response) {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');

    try {
      for await (const event of this.workflowService.executeStream(prompt)) {
        response.write(
          `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`,
        );
      }
    } catch (err) {
      response.write(
        `event: workflow-error\ndata: ${JSON.stringify({ error: err instanceof Error ? err.message : String(err) })}\n\n`,
      );
    } finally {
      response.end();
    }
  }
}
