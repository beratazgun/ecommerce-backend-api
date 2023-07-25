import { Router } from 'express'
import FavoriteController from '../controllers/favorite.controller'
import { isLoggedIn } from '../middlewares'
const router: Router = Router()
const favoriteController = new FavoriteController()

router.use(isLoggedIn)

router.post('/add', favoriteController.AddFavorite)
router.get('/get-all', favoriteController.GetFavorite)
router.post('/is-favorite', favoriteController.IsFavorite)
router.delete('/remove', favoriteController.RemoveFavorite)

export default router
