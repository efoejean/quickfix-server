import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CategoriesService } from './categories.service';

/**
 * 🗂 CategoriesController
 * Handles routes related to job categories.
 * Currently supports listing all categories.
 */
//@UseGuards(JwtAuthGuard) // ✅ Protects all routes with JWT authentication
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}


  @Get()
  async list() {
    return this.categories.list();
  }

  
}
