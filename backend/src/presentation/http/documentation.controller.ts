import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class DocumentationController {
  @Get()
  @Redirect('/docs', 302)
  documentation(): void {}
}
