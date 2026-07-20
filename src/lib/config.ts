export const BOOKS_API_URL =
  process.env.BOOKS_API_URL ?? "http://10.203.18.229:3000/api/books";

export const ORDERS_API_URL =
  process.env.ORDERS_API_URL ?? "http://10.203.18.229:3000/api/orders";

export const CUSTOMERS_API_URL =
  process.env.CUSTOMERS_API_URL ?? "http://10.203.18.229:3000/api/customers";

export const USERS_API_URL =
  process.env.USERS_API_URL ?? "http://10.203.18.229:3000/api/users";

export const AUTH_SECRET =
  process.env.AUTH_SECRET ?? "bookshop-dev-auth-secret-change-me";

export const AUTH_COOKIE_NAME = "bookshop_session";
