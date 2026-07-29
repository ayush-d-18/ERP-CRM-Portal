import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { verifyToken, requireRole, AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errors";

const router = Router();

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().optional(),
  unitPrice: z.number().positive(),
  minStockLevel: z.number().int().nonnegative().optional(),
  warehouse: z.string().optional(),
});

const stockMovementSchema = z.object({
  quantity: z.number().int().positive(),
  type: z.enum(["IN", "OUT"]),
  reason: z.string().optional(),
});

router.get(
  "/",
  verifyToken,
  async (req: AuthRequest, res, next) => {
    try {
      const search = (req.query.search as string) || "";
      const category = (req.query.category as string) || "";

      const whereConditions: any = {};
      if (search) {
        whereConditions.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ];
      }
      if (category) {
        whereConditions.category = category;
      }

      const products = await prisma.product.findMany({
        where: whereConditions,
        orderBy: { createdAt: "desc" },
      });

      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  verifyToken,
  requireRole("ADMIN", "WAREHOUSE"),
  async (req: AuthRequest, res, next) => {
    try {
      const data = productSchema.parse(req.body);
      const product = await prisma.product.create({
        data: {
          name: data.name,
          sku: data.sku,
          category: data.category,
          unitPrice: data.unitPrice,
          minStockLevel: data.minStockLevel || 10,
          warehouse: data.warehouse,
        },
      });
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const err: ApiError = new Error("Validation error");
        err.status = 400;
        err.errors = error.issues;
        return next(err);
      }
      next(error);
    }
  }
);

router.get(
  "/:id",
  verifyToken,
  async (req: AuthRequest, res, next) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: req.params.id as string },
        include: {
          movements: {
            include: { createdBy: true },
            orderBy: { createdAt: "desc" },
            take: 50,
          },
        },
      });

      if (!product) {
        const error: ApiError = new Error("Product not found");
        error.status = 404;
        throw error;
      }

      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  verifyToken,
  requireRole("ADMIN", "WAREHOUSE"),
  async (req: AuthRequest, res, next) => {
    try {
      const data = productSchema.parse(req.body);
      const product = await prisma.product.update({
        where: { id: req.params.id as string },
        data: {
          name: data.name,
          sku: data.sku,
          category: data.category,
          unitPrice: data.unitPrice,
          minStockLevel: data.minStockLevel,
          warehouse: data.warehouse,
        },
      });
      res.json({ success: true, data: product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const err: ApiError = new Error("Validation error");
        err.status = 400;
        err.errors = error.issues;
        return next(err);
      }
      next(error);
    }
  }
);

router.post(
  "/:id/stock",
  verifyToken,
  requireRole("ADMIN", "WAREHOUSE"),
  async (req: AuthRequest, res, next) => {
    try {
      const { quantity, type, reason } = stockMovementSchema.parse(req.body);

      const product = await prisma.product.findUnique({
        where: { id: req.params.id as string },
      });

      if (!product) {
        const error: ApiError = new Error("Product not found");
        error.status = 404;
        throw error;
      }

      if (type === "OUT" && product.currentStock < quantity) {
        const error: ApiError = new Error(
          "Insufficient stock for this movement"
        );
        error.status = 400;
        throw error;
      }

      const newStock =
        type === "IN" ? product.currentStock + quantity : product.currentStock - quantity;

      const [movement, updatedProduct] = await prisma.$transaction([
        prisma.stockMovement.create({
          data: {
            productId: req.params.id as string,
            quantity,
            type,
            reason,
            createdById: req.user!.id,
          },
          include: { createdBy: true },
        }),
        prisma.product.update({
          where: { id: req.params.id as string },
          data: { currentStock: newStock },
        }),
      ]);

      res.json({
        success: true,
        data: { movement, product: updatedProduct },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const err: ApiError = new Error("Validation error");
        err.status = 400;
        err.errors = error.issues;
        return next(err);
      }
      next(error);
    }
  }
);

export default router;
