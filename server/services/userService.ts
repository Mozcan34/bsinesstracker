import { db } from "../db";
import { users, type InsertUser } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export class UserService {
  // Yeni kullanıcı oluştur
  async createUser(userData: InsertUser) {
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Kullanıcıyı oluştur
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        phone: users.phone,
        position: users.position,
        createdAt: users.createdAt,
      });

    return user;
  }

  // Kullanıcı adı ve şifre ile kullanıcıyı doğrula
  async validateUser(username: string, password: string) {
    // Kullanıcıyı bul
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return null;
    }

    // Şifreyi kontrol et
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    // Hassas bilgileri çıkar
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Kullanıcı adına göre kullanıcıyı bul
  async findByUsername(username: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return null;
    }

    // Hassas bilgileri çıkar
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // E-posta adresine göre kullanıcıyı bul
  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return null;
    }

    // Hassas bilgileri çıkar
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
} 