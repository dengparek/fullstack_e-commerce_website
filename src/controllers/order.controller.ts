import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

export const CreateOrder = (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(201).json({
      successful: false,
      message: "User name or password is required",
    });

    const existingUser = User.findOne({ email: email });
    if (existingUser) {
      res.json({
        message: "User already exist",
      });
    }

    const salt = bcrypt.salt(10);
    const hashedPassword = bcrypt.hash(password, salt);

    const newUser = new User.create({
      name,
      email,
      password: hashedPassword,
    });
    res.status(201).json({
      success: true,
      message: "User created suceesfully",
      data: User.data.select(-password),
    });
  }
};

export const getAllOrders = (req: Request, res: Response) => {};

export const getSingleOrder = (req: Request, res: Response) => {};

export const deleteOrder = (req: Request, res: Response) => {};

export const updateOrder = (req: Request, res: Response) => {};
