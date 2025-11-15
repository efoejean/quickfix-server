// src/users/users.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertProProfileDto } from './dto/upsert-pro-profile.dto';
import { ProVerificationStatus , Role} from '@prisma/client'; // 👈 add this

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

async upsertFromAuth0(
    sub: string,
    profile: { name?: string; email?: string; role?: 'customer' | 'pro' | 'admin' },
  ) {
    const { name, email, role } = profile;

    // 1️⃣ Try to find by auth0Sub first
    const existingBySub = await this.prisma.user.findUnique({
      where: { auth0Sub: sub },
    });

    if (existingBySub) {
      // ⚠️ DO NOT touch email here → avoids P2002 when another user has this email
      return this.prisma.user.update({
        where: { auth0Sub: sub },
        data: {
          name: name ?? existingBySub.name,
          ...(role ? { role: role as any } : {}),
        },
      });
    }

    // 2️⃣ If no user with this sub, try by email (if we have one)
    if (email) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingByEmail) {
        // Attach this Auth0 sub to the existing user (same person)
        return this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            auth0Sub: sub,
            name: name ?? existingByEmail.name,
            ...(role ? { role: role as any } : {}),
          },
        });
      }
    }

    // 3️⃣ Otherwise, create a brand new user
    return this.prisma.user.create({
      data: {
        auth0Sub: sub,
        name: name ?? 'User',
        role: (role as any) ?? 'customer',
        ...(email ? { email } : {}),
      },
    });
  }



  async findByAuth0Sub(auth0Sub: string) {
    return this.prisma.user.findUnique({
      where: { auth0Sub },
    });
  }

   async getProProfileForUser(userId: string) {
    return this.prisma.proProfile.findUnique({
      where: { userId },
    });
  }

  async upsertProProfileForUser(userId: string, dto: UpsertProProfileDto) {
    return this.prisma.proProfile.upsert({
      where: { userId },
      create: {
        userId,
        skills: dto.skills,
        bio: dto.bio,
        hourlyRate: dto.hourlyRate,
        minJobPrice: dto.minJobPrice,
        maxDistanceKm: dto.maxDistanceKm ?? 15,
        serviceAreaGeojson: dto.serviceAreaGeojson,
        portfolioMedia: dto.portfolioMedia ?? [],
        verificationStatus: ProVerificationStatus.unverified, 
      },
      update: {
        skills: dto.skills,
        bio: dto.bio,
        hourlyRate: dto.hourlyRate,
        minJobPrice: dto.minJobPrice,
        maxDistanceKm: dto.maxDistanceKm ?? 15,
        serviceAreaGeojson: dto.serviceAreaGeojson,
        portfolioMedia: dto.portfolioMedia ?? [],
        
      },
    });
  }

  async submitProProfileForUser(userId: string) {
    const pro = await this.prisma.proProfile.findUnique({
      where: { userId },
    });

    if (!pro) {
      throw new BadRequestException('No pro profile to submit.');
    }

    if (pro.verificationStatus === ProVerificationStatus.pending) {
      throw new BadRequestException('Profile already pending verification.');
    }

    
    return this.prisma.proProfile.update({
      where: { userId },
      data: {
        verificationStatus: ProVerificationStatus.pending,
      },
    });
  }

    // 🔎 List pro profiles (optionally filtered by status)
  async listProProfiles(status?: ProVerificationStatus) {
    return this.prisma.proProfile.findMany({
      where: status ? { verificationStatus: status } : {},
      include: {
        user: true, // so admin can see name, email, phone
      },
    });
  }

// ✅ Set pro profile status (verify / reject, etc.)
  async setProProfileStatus(
    proProfileId: string,
    status: ProVerificationStatus,
  ) {
    const data: any = {
      verificationStatus: status,
    };

    // When a profile is verified → upgrade user to "pro"
    if (status === ProVerificationStatus.verified) {
      data.user = {
        update: {
          role: Role.pro,
        },
      };
    }

    // (Optional) if you ever want to downgrade on reject:
    if (status === ProVerificationStatus.rejected) {
      data.user = {
        update: {
          role: Role.customer,
        },
      };
    }

    return this.prisma.proProfile.update({
      where: { id: proProfileId },
      data,
      include: { user: true },
    });
  }

}


