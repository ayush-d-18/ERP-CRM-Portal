import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { verifyToken, requireRole, AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errors";

const router = Router();

const customerSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(1),
  email: z.string().email(),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  customerType: z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]).optional(),
  address: z.string().optional(),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).optional(),
  followUpDate: z.string().datetime().optional(),
});

router.get(
  "/",
  verifyToken,
  async (req: AuthRequest, res, next) => {
    try {
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string) || "";
      const page = parseInt((req.query.page as string) || "1");
      const limit = parseInt((req.query.limit as string) || "10");
      const skip = (page - 1) * limit;

      const whereConditions: any = {};
      if (search) {
        whereConditions.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { mobile: { contains: search, mode: "insensitive" } },
        ];
      }
      if (status) {
        whereConditions.status = status;
      }

      const customers = await prisma.customer.findMany({
        where: whereConditions,
        skip,
        take: limit,
        include: { assignedTo: true },
        orderBy: { createdAt: "desc" },
      });

      const total = await prisma.customer.count({
        where: whereConditions,
      });

      res.json({
        success: true,
        data: customers,
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
      const data = customerSchema.parse(req.body);
      const customer = await prisma.customer.create({
        data: {
          name: data.name,
          mobile: data.mobile,
          email: data.email,
          businessName: data.businessName,
          gstNumber: data.gstNumber,
          customerType: data.customerType as any,
          address: data.address,
          status: data.status as any,
          assignedToId: req.user!.id,
          followUpDate: data.followUpDate
            ? new Date(data.followUpDate)
            : undefined,
        },
      });
      res.status(201).json({ success: true, data: customer });
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
      const customer = await prisma.customer.findUnique({
        where: { id: req.params.id as string },
        include: { assignedTo: true, challans: true },
      });

      if (!customer) {
        const error: ApiError = new Error("Customer not found");
        error.status = 404;
        throw error;
      }

      res.json({ success: true, data: customer });
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
      const data = customerSchema.parse(req.body);
      const customer = await prisma.customer.update({
        where: { id: req.params.id as string },
        data: {
          name: data.name,
          mobile: data.mobile,
          email: data.email,
          businessName: data.businessName,
          gstNumber: data.gstNumber,
          customerType: data.customerType as any,
          address: data.address,
          status: data.status as any,
          followUpDate: data.followUpDate
            ? new Date(data.followUpDate)
            : undefined,
        },
      });
      res.json({ success: true, data: customer });
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

router.delete(
  "/:id",
  verifyToken,
  requireRole("ADMIN"),
  async (req: AuthRequest, res, next) => {
    try {
      await prisma.customer.delete({
        where: { id: req.params.id as string },
      });
      res.json({ success: true, message: "Customer deleted" });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:id/notes",
  verifyToken,
  requireRole("ADMIN", "SALES"),
  async (req: AuthRequest, res, next) => {
    try {
      const { notes } = req.body;
      const customer = await prisma.customer.update({
        where: { id: req.params.id as string },
        data: { notes },
      });
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
