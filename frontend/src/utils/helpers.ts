import axios from "axios";

export const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
};

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const initialFormState = {
  name: "",
  sku: "",
  slug: "",
  description: "",
  price: 0,
  stock: 0,
  categoryId: "",
  imageUrl: "",
  isActive: true,
};

export const formatCurrency = (
  amount: number,
  currency: string = "SSP",
  locale: string = "en-US",
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount || 0);
};
