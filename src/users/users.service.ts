import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class UsersService {
constructor(private prisma: PrismaService) {}
async upsertFromAuth0(sub: string, profile: { name?: string; email?: string; role?: 'customer'|'pro'|'admin' }) {
return this.prisma.user.upsert({
where: { auth0Sub: sub },
update: { name: profile.name ?? undefined, email: profile.email ?? undefined, role: (profile.role as any) ?? undefined },
create: { auth0Sub: sub, name: profile.name ?? 'User', email: profile.email, role: (profile.role as any) ?? 'customer' }
});
}
}