import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { verifyToken, requireRole, AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errors";

const router = Router();

const challanItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const createChallanSchema = z.object({
  customerId: z.string(),
  items: z.array(challanItemSchema),
});

router.get(
  "/",
  verifyToken,
  async (req: AuthRequest, res, next) => {
    try {
      const status = (req.query.status as string) || "";
      const page = parseInt((req.query.page as string) || "1");
      const limit = parseInt((req.query.limit as string) || "10");
      const skip = (page - 1) * limit;

      const whereConditions: any = {};
      if (status && status !== "All") {
        whereConditions.status = status;
      }

      const challans = await prisma.salesChallan.findMany({
        where: whereConditions,
        skip,
        take: limit,
        include: {
          customer: true,
          createdBy: true,
          items: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const total = await prisma.salesChallan.count({
        where: whereConditions,
      });

      res.json({
        success: true,
        data: challans,
        pagination: { page, limit, total },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  verifyToken,
  requireRole("ADMIN", "SALES"),
  async (req: AuthRequest, res, next) => {
    try {
      const { customerId, items } = createChallanSchema.parse(req.body);

      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        const error: ApiError = new Error("Customer not found");
        error.status = 404;
        throw error;
      }

      const challanNumber = `CH-${Date.now()}`;
      let totalAmount = 0;

      const challanItems: any[] = [];
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          const error: ApiError = new Error(
            `Product ${item.productId} not found`
          );
          error.status = 404;
          throw error;
        }

        const itemTotal = product.unitPrice * item.quantity;
        totalAmount += itemTotal;

        challanItems.push({
          productId: item.productId,
          productName: product.name,
          productSku: product.sku,
          unitPrice: product.unitPrice,
          quantity: item.quantity,
          totalPrice: itemTotal,
        });
      }

      const challan = await prisma.salesChallan.create({
        data: {
          challanNumber,
          customerId,
          createdById: req.user!.id,
          totalAmount,
          items: {
            createMany: {
              data: challanItems as any,
            },
          },
        },
        include: {
          customer: true,
          createdBy: true,
          items: { include: { product: true } },
        },
      });

      res.status(201).json({ success: true, data: challan });
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
      const challan = await prisma.salesChallan.findUnique({
        where: { id: req.params.id as string },
        include: {
          customer: true,
          createdBy: true,
          items: { include: { product: true } },
        },
      });

      if (!challan) {
        const error: ApiError = new Error("Challan not found");
        error.status = 404;
        throw error;
      }

      res.json({ success: true, data: challan });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  verifyToken,
  requireRole("ADMIN", "SALES"),
  async (req: AuthRequest, res, next) => {
    try {
      const { items } = createChallanSchema.parse(req.body);

      const challan = await prisma.salesChallan.findUnique({
        where: { id: req.params.id as string },
      });

      if (!challan) {
        const error: ApiError = new Error("Challan not found");
        error.status = 404;
        throw error;
      }

      if (challan.status !== "DRAFT") {
        const error: ApiError = new Error("Can only update DRAFT challans");
        error.status = 400;
        throw error;
      }

      await prisma.challanItem.deleteMany({
        where: { challanId: req.params.id as string },
      });

      let totalAmount = 0;
      const challanItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          const error: ApiError = new Error(
            `Product ${item.productId} not found`
          );
          error.status = 404;
          throw error;
        }

        const itemTotal = product.unitPrice * item.quantity;
        totalAmount += itemTotal;

        challanItems.push({
          productId: item.productId,
          productName: product.name,
          productSku: product.sku,
          unitPrice: product.unitPrice,
          quantity: item.quantity,
          totalPrice: itemTotal,
        });
      }

      const updatedChallan = await prisma.salesChallan.update({
        where: { id: req.params.id as string },
        data: {
          totalAmount,
          items: {
            createMany: {
              data: challanItems,
            },
          },
        },
        include: {
          customer: true,
          createdBy: true,
          items: { include: { product: true } },
        },
      });

      res.json({ success: true, data: updatedChallan });
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
  "/:id/confirm",
  verifyToken,
  requireRole("ADMIN", "SALES"),
  async (req: AuthRequest, res, next) => {
    try {
      const challan = await prisma.salesChallan.findUnique({
        where: { id: req.params.id as string },
        include: { items: true },
      }) as any;

      if (!challan) {
        const error: ApiError = new Error("Challan not found");
        error.status = 404;
        throw error;
      }

      if (challan.status !== "DRAFT") {
        const error: ApiError = new Error("Only DRAFT challans can be confirmed");
        error.status = 400;
        throw error;
      }

      for (const item of challan.items as any[]) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.currentStock < item.quantity) {
          const error: ApiError = new Error(
            `Insufficient stock for product: ${item.productName}`
          );
          error.status = 400;
          throw error;
        }
      }

      const movements: any[] = [];
      for (const item of challan.items as any[]) {
        movements.push({
          productId: item.productId,
          quantity: item.quantity,
          type: "OUT" as const,
          reason: `Challan: ${challan.challanNumber}`,
          createdById: req.user!.id,
        });
      }

      await prisma.$transaction(async (tx) => {
        for (const item of challan.items as any[]) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: {
                decrement: item.quantity,
              },
            },
          });
        }

        for (const movement of movements) {
          await tx.stockMovement.create({
            data: movement,
          });
        }

        await tx.salesChallan.update({
          where: { id: req.params.id as string },
          data: { status: "CONFIRMED" },
        });
      });

      const updatedChallan = await prisma.salesChallan.findUnique({
        where: { id: req.params.id as string },
        include: {
          customer: true,
          createdBy: true,
          items: { include: { product: true } },
        },
      });

      res.json({ success: true, data: updatedChallan });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:id/cancel",
  verifyToken,
  requireRole("ADMIN"),
  async (req: AuthRequest, res, next) => {
    try {
      const challan = await prisma.salesChallan.findUnique({
        where: { id: req.params.id as string },
        include: { items: true },
      });

      if (!challan) {
        const error: ApiError = new Error("Challan not found");
        error.status = 404;
        throw error;
      }

      if (challan.status === "CANCELLED") {
        const error: ApiError = new Error("Challan is already cancelled");
        error.status = 400;
        throw error;
      }

      if (challan.status === "CONFIRMED") {
        await prisma.$transaction(async (tx) => {
          for (const item of challan.items as any[]) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                currentStock: {
                  increment: item.quantity,
                },
              },
            });

            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                quantity: item.quantity,
                type: "IN",
                reason: `Challan cancelled: ${challan.challanNumber}`,
                createdById: req.user!.id,
              },
            });
          }

          await tx.salesChallan.update({
            where: { id: req.params.id as string },
            data: { status: "CANCELLED" },
          });
        });
      } else {
        await prisma.salesChallan.update({
          where: { id: req.params.id as string },
          data: { status: "CANCELLED" },
        });
      }

      const updatedChallan = await prisma.salesChallan.findUnique({
        where: { id: req.params.id as string },
        include: {
          customer: true,
          createdBy: true,
          items: { include: { product: true } },
        },
      });

      res.json({ success: true, data: updatedChallan });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
