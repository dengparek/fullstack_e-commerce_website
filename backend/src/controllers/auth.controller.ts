import type { Request, Response } from "express";

export const CreateUser = (req: Request, res: Response) => {
  res.json("User created successfully");
};

export const LoginUser = (req: Request, res: Response) => {};

export const SignOutUser = (req: Request, res: Response) => {};
