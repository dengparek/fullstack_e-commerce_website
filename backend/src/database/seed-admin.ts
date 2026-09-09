import { eq } from "drizzle-orm";

import { db, pool } from "./db";
import { users } from "./schema/users";
import { hashPassword } from "../utils/password";

const ADMIN_NAME = process.env.ADMIN_NAME;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required");
}

const seedAdmin = async (): Promise<void> => {
  try {
    const existingAdmin = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log(`User with email ${ADMIN_EMAIL} already exists.`);
      return;
    }

    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    const [admin] = await db
      .insert(users)
      .values({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash,
        role: "admin",
        isActive: true,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    console.log("Admin user created successfully:");
    console.log(admin);
  } catch (error) {
    console.error("Failed to create admin user:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

void seedAdmin();
