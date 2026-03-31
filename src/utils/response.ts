export const successResponse = <T>(data: T, message = 'Success') => ({
  success: true,
  message,
  data,
});

export const paginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => ({
  success: true,
  data,
  meta: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  },
});
