export const ProductService = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const getProducts = async (page = 1) => {
    return await $fetch(`/products?page=${page}`, { baseURL })
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
        queryObj[key] = String(value) // ép String
      }
    })

    const query = new URLSearchParams(queryObj).toString()
    return await $fetch(`/products/search?${query}`, { baseURL })
  }

  return { getProducts, searchProducts }
}
