module.exports = {
  apps: [
    {
      name: 'pepcoach-backend',
      script: './backend/src/index.js',
      cwd: '/home/user/webapp/pepcoach',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      env_file: './.env'
    },
    {
      name: 'pepcoach-frontend',
      script: './node_modules/.bin/http-server',
      args: './frontend -p 8080 --cors',
      cwd: '/home/user/webapp/pepcoach',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};