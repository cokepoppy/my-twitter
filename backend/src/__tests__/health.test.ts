import request from 'supertest'
import { createApp } from '../app'

describe('Health endpoint', () => {
  const app = createApp()

  it('GET /health returns OK', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('status', 'OK')
    expect(res.body).toHaveProperty('timestamp')
  })
})

