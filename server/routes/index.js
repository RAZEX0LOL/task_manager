import express from "express"
import assistantRoute from "./assistantRoute.js"
import taskRoutes from "./taskRoute.js"
import userRoutes from "./userRoute.js"

const router = express.Router()

router.use("/user", userRoutes)
router.use("/task", taskRoutes)
router.use("/assistant", assistantRoute)

export default router