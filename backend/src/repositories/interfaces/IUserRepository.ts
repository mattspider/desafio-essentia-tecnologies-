import { CreateUserData, User, UserWithPassword } from '../../models/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserWithPassword | null>;
  findById(id: number): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}
