// server/routes/assistantRoute.js
import axios from "axios"
import express from "express"

const router = express.Router()

// Обработчик для POST-запроса на /api/assistant
router.post("/", async (req, res) => {
	console.log("Получен запрос на /api/assistant")
	const { message } = req.body
	try {
		const response = await axios.post(
			"https://api.openai.com/v1/completions",
			{
				model: "text-davinci-003",
				prompt: message,
				max_tokens: 150,
				temperature: 0.7,
			},
			{
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
				},
			}
		)
		const assistantReply = response.data.choices[0].text.trim()
		res.json({ reply: assistantReply })
	} catch (error) {
		console.error("Ошибка при вызове OpenAI:", error)
		res.status(500).json({ error: error.message })
	}
})

export default router