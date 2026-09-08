import { Controller, Get, Header, Param } from '@nestjs/common';
import { SeoService } from './seo.service';

@Controller()
export class SeoController {
  constructor(private readonly seo: SeoService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @Header('Cache-Control', 'no-cache')
  sitemap() {
    return this.seo.sitemap();
  }

  @Get('sitemaps/:part.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @Header('Cache-Control', 'no-cache')
  sitemapPart(@Param('part') part: string) {
    return this.seo.sitemap(Number(part));
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  robots() {
    return this.seo.robots();
  }
}
