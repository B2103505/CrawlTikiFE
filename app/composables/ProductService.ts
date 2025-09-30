type Product = {
  id: string
  name: string
  sku: string
  price: number
  price_original?: number
  discount: number
  sold: number
  discount_rate: number
  rating_average: number
  image: string
  createdAt: string
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

type ProductResponse = {
  data: Product[]
  pagination: Pagination
}

export const ProductService = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const getProducts = async (page = 1) => {
    const res = await $fetch<ProductResponse>(`/products?page=${page}`, { baseURL })
    return res.data
  }

  const searchProducts = async (params: {
    keyword?: string
    minPrice?: number
    maxPrice?: number
    minDiscount?: number
    maxDiscount?: number
    minRating?: number
    page?: number
  }) => {
    const queryObj: Record<string, string> = {}
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryObj[key] = String(value)
      }
    })

    const query = new URLSearchParams(queryObj).toString()
    const res = await $fetch<ProductResponse>(`/products/search?${query}`, { baseURL })
    return res.data
  }

  return { getProducts, searchProducts }
}
