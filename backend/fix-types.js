const fs = require('fs')
const path = require('path')

const filesToFix = [
  'src/routes/tweets.ts',
  'src/routes/users.ts',
  'src/routes/auth.ts',
  'src/routes/follows.ts',
  'src/routes/notifications.ts',
  'src/routes/messages.ts',
  'src/routes/search.ts'
]

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file)
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8')

    // Fix async function parameters
    content = content.replace(/async \((req: AuthRequest, res, next)\)/g, 'async (req: AuthRequest, res: any, next: any)')
    content = content.replace(/async \((req, res, next)\)/g, 'async (req: any, res: any, next: any)')
    content = content.replace(/async \(req: AuthRequest, res: any, next: any\)/g, 'async (req: AuthRequest, res: any, next: any)')

    // Fix callback parameters
    content = content.replace(/\((req, res, next) =>/g, '(req: any, res: any, next: any) =>')
    content = content.replace(/\((req: AuthRequest, res, next) =>/g, '(req: AuthRequest, res: any, next: any) =>')

    // Fix pagination type casting
    content = content.replace(/Number\(page\)/g, 'Number(page)')
    content = content.replace(/Number\(limit\)/g, 'Number(limit)')

    // Fix forEach parameters
    content = content.replace(/\(message\) =>/g, '(message: any) =>')
    content = content.replace(/\(follow\) =>/g, '(follow: any) =>')
    content = content.replace(/\(tweet\) =>/g, '(tweet: any) =>')
    content = content.replace(/\(user\) =>/g, '(user: any) =>')
    content = content.replace(/\(f\) =>/g, '(f: any) =>')

    // Fix query parameter types
    content = content.replace(/const \{ q, page = 1, limit = 20, type = 'all' \} = req\.query/g, "const { q, page = 1, limit = 20, type = 'all' } = req.query as any")
    content = content.replace(/const \{ page = 1, limit = 20 \} = req\.query/g, "const { page = 1, limit = 20 } = req.query as any")

    // Fix toUpperCase() calls
    content = content.replace(/\.toUpperCase\(\)/g, '.toString().toUpperCase()')

    fs.writeFileSync(filePath, content)
    console.log(`Fixed: ${file}`)
  }
})

console.log('Type fixes completed!')