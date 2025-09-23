import { Request, Response } from "express";
import { listReservationCards } from "../services/reservaService";

export async function getReservationCards(req: Request, res: Response) {
  const { userId, page, pageSize } = req.query;
  const data = await listReservationCards({
    userId: userId ? String(userId) : undefined,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  });
  res.json(data);
}
