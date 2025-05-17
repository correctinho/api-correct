import express, { Response, Request, NextFunction, Router } from 'express'
import {router} from './routes'
import cors from 'cors'
import swaggerUI from 'swagger-ui-express'
import { join } from 'path';

import swaggerDocument from '../swagger.json'

const app = express()
app.use(express.json({
  limit:'200mb'
}))
app.use(cors())


app.use(router)

app.get('/', (req: Request, res: Response) => {
    res.send("Application running successfully")
})

app.use('/images', express.static(join(process.cwd(), 'src/infra/databases/images')));

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

export { app }
