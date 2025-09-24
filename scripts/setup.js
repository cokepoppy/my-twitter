#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('🚀 Setting up My Twitter Clone...')
console.log('=================================\n')

const runCommand = (command, cwd = process.cwd()) => {
  try {
    console.log(`Running: ${command}`)
    execSync(command, { cwd, stdio: 'inherit' })
    return true
  } catch (error) {
    console.error(`Error running command: ${command}`)
    console.error(error.message)
    return false
  }
}

const checkDependencies = () => {
  console.log('📋 Checking dependencies...')

  // Check Node.js version
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])

  if (majorVersion < 18) {
    console.error('❌ Node.js 18 or higher is required')
    process.exit(1)
  }

  console.log('✅ Node.js version:', nodeVersion)

  // Check if MySQL is available
  try {
    execSync('mysql --version', { stdio: 'pipe' })
    console.log('✅ MySQL is available')
  } catch (error) {
    console.warn('⚠️  MySQL is not available in PATH. Make sure MySQL is installed and running.')
  }

  // Check if Redis is available
  try {
    execSync('redis-cli --version', { stdio: 'pipe' })
    console.log('✅ Redis is available')
  } catch (error) {
    console.warn('⚠️  Redis is not available in PATH. Make sure Redis is installed and running.')
  }
}

const setupEnvironment = () => {
  console.log('\n🔧 Setting up environment files...')

  // Backend .env
  const backendEnvPath = path.join(__dirname, '..', 'backend', '.env')
  const backendEnvExamplePath = path.join(__dirname, '..', 'backend', '.env.example')

  if (!fs.existsSync(backendEnvPath) && fs.existsSync(backendEnvExamplePath)) {
    fs.copyFileSync(backendEnvExamplePath, backendEnvPath)
    console.log('✅ Created backend/.env from backend/.env.example')
  }

  // Frontend .env
  const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env')
  const frontendEnvExamplePath = path.join(__dirname, '..', 'frontend', '.env.example')

  if (!fs.existsSync(frontendEnvPath) && fs.existsSync(frontendEnvExamplePath)) {
    fs.copyFileSync(frontendEnvExamplePath, frontendEnvPath)
    console.log('✅ Created frontend/.env from frontend/.env.example')
  }
}

const installDependencies = () => {
  console.log('\n📦 Installing dependencies...')

  // Frontend dependencies
  console.log('\nInstalling frontend dependencies...')
  if (!runCommand('npm install', path.join(__dirname, '..', 'frontend'))) {
    console.error('❌ Failed to install frontend dependencies')
    process.exit(1)
  }

  // Backend dependencies
  console.log('\nInstalling backend dependencies...')
  if (!runCommand('npm install', path.join(__dirname, '..', 'backend'))) {
    console.error('❌ Failed to install backend dependencies')
    process.exit(1)
  }
}

const setupDatabase = () => {
  console.log('\n🗄️  Setting up database...')

  const backendDir = path.join(__dirname, '..', 'backend')

  // Generate Prisma client
  console.log('\nGenerating Prisma client...')
  if (!runCommand('npx prisma generate', backendDir)) {
    console.error('❌ Failed to generate Prisma client')
    process.exit(1)
  }

  // Run database migrations
  console.log('\nRunning database migrations...')
  if (!runCommand('npx prisma migrate dev', backendDir)) {
    console.error('❌ Failed to run database migrations')
    process.exit(1)
  }

  // Optional: Seed database
  rl.question('\nDo you want to seed the database with sample data? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\nSeeding database...')
      runCommand('npx prisma db seed', backendDir)
    }
    rl.close()
  })
}

const main = async () => {
  try {
    checkDependencies()
    setupEnvironment()
    installDependencies()
    setupDatabase()

    console.log('\n🎉 Setup completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Review and update environment files in backend/.env and frontend/.env')
    console.log('2. Make sure MySQL and Redis are running')
    console.log('3. Start the development servers:')
    console.log('   - Frontend: cd frontend && npm run dev')
    console.log('   - Backend: cd backend && npm run dev')
    console.log('4. Or use Docker: docker-compose up --build')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

main()