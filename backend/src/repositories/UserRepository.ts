import { injectable } from 'tsyringe';
import { prisma } from '../infrastructure/database/prisma/client';
import { CreateUserData, User, UserWithPassword } from '../models/User';
import { IUserRepository } from './interfaces/IUserRepository';

@injectable()
export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const user = await prisma.user.findUnique({ where: { email } });

    return user ? this.toUserWithPassword(user) : null;
  }

  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });

    return user ? this.toUser(user) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    });

    return this.toUser(user);
  }

  private toUser(user: {
    id: number;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toUserWithPassword(user: {
    id: number;
    email: string;
    name: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserWithPassword {
    return {
      ...this.toUser(user),
      password: user.password,
    };
  }
}
