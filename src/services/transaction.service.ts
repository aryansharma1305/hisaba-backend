import prisma from '../lib/prisma';
import { CreateTransactionInput, UpdateTransactionInput, ListTransactionInput } from '../utils/validators/transaction.validator';

export const listTransactions = async (params: ListTransactionInput) => {
  const { userId, page, limit, category, type, from, to } = params;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(category && { category }),
    ...(type && { type }),
    ...(from || to
      ? {
          transactionDate: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }
      : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total };
};

export const getTransactionById = async (id: string, userId: string) => {
  return prisma.transaction.findFirst({ where: { id, userId } });
};

export const createTransaction = async (data: CreateTransactionInput) => {
  return prisma.transaction.create({
    data: {
      ...data,
      transactionDate: new Date(data.transactionDate),
    },
  });
};

export const createBulkTransactions = async (items: CreateTransactionInput[]) => {
  const data = items.map((item) => ({
    ...item,
    transactionDate: new Date(item.transactionDate),
  }));
  return prisma.transaction.createMany({ data, skipDuplicates: true });
};

export const updateTransaction = async (
  id: string,
  userId: string,
  data: UpdateTransactionInput
) => {
  const tx = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!tx) return null;

  return prisma.transaction.update({
    where: { id },
    data: {
      ...data,
      ...(data.transactionDate && { transactionDate: new Date(data.transactionDate) }),
    },
  });
};

export const deleteTransaction = async (id: string, userId: string) => {
  const tx = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!tx) return null;
  return prisma.transaction.delete({ where: { id } });
};

export const deleteTransactionsBySource = async (userId: string, source: string) => {
  return prisma.transaction.deleteMany({
    where: {
      userId,
      source,
    },
  });
};
