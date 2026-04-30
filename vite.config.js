import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    {
      name: 'save-json-plugin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/save-data') {
            let body = ''
            req.on('data', chunk => {
              body += chunk.toString()
            })
            req.on('end', () => {
              try {
                const data = JSON.parse(body)
                const filePath = path.resolve(__dirname, 'public/data.json')
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
                res.statusCode = 200
                res.end(JSON.stringify({ message: 'Saved successfully' }))
              } catch (err) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'Failed to save data' }))
              }
            })
          } else {
            next()
          }
        })
      }
    }
  ]
})
