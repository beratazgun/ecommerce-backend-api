const cart = (userId: string) => `cart#${userId}`
const favorite = (userId: string) => `favorite#${userId}`
const address = (userId: string) => `address#${userId}`
const filter = (category: string) => `filter#${category}`
const formField = (category: string) => `formField#${category}`

export { cart, favorite, address, filter, formField }
