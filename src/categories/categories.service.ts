import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 🗂 CategoriesService
 * Handles database operations related to job categories.
 * Uses Prisma ORM to fetch data from the 'category' table.
 */
@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 📋 Retrieve all categories from the database.
   * Ordered alphabetically by name for better UX.
   */
  async list() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
