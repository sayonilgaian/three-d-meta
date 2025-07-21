import 'dotenv/config'
import { buildApp } from './app'
import logger from '@/utils/logger'

const start = async () => {
    try {
        const app = await buildApp()

        const host = app.config.HOST
        const port = app.config.PORT

        await app.listen({ host, port })

        logger.info(`Server listening on http://${host}:${port}`)
        logger.info(`Documentation available at http://${host}:${port}/docs`)

    } catch (error) {
        logger.error(error, 'Failed to start server')
        process.exit(1)
    }
}

// Handle graceful shutdown
const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully`)
    process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

start()