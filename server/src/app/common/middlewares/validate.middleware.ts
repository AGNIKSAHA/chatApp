import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (
  schema: ZodSchema,
  source: "body" | "params" | "query" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data =
        source === "body"
          ? req.body
          : source === "params"
            ? req.params
            : req.query;
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        res.status(400).json({ errors });
        return;
      }
      res.status(400).json({ error: "Validation failed" });
    }
  };
};
