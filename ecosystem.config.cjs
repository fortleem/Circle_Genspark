// PM2 config for Cirkle (دواير) — Cloudflare Pages dev with D1 local binding
module.exports = {
  apps: [
    {
      name: "cirkle-webapp",
      script: "npx",
      args: "wrangler pages dev dist --d1=cirkle-production --local --ip 0.0.0.0 --port 3000",
      env: { NODE_ENV: "development", PORT: "3000" },
      watch: false,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 5,
    },
  ],
};
