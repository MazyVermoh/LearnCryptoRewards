import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Telegram bot will be initialized safely
let telegramBot: any = null;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Root path health check only for API requests (not interfering with frontend)
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'MIND Token Educational Platform is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Health check endpoint for deployment
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint - doesn't interfere with static files
app.get('/api/status', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'MIND Token Educational Platform API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Telegram webhook endpoints (with error handling to prevent server startup issues)
app.post('/telegram/webhook', async (req: Request, res: Response) => {
  try {
    if (telegramBot) {
      await telegramBot.processUpdate(req.body);
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/telegram/info', async (req: Request, res: Response) => {
  try {
    if (!telegramBot) {
      return res.status(503).json({ error: 'Telegram bot not initialized' });
    }
    const botInfo = await telegramBot.getMe();
    res.json(botInfo);
  } catch (error) {
    console.error('Error getting bot info:', error);
    res.status(500).json({ error: 'Failed to get bot info' });
  }
});

app.post('/telegram/set-webhook', async (req: Request, res: Response) => {
  try {
    if (!telegramBot) {
      return res.status(503).json({ error: 'Telegram bot not initialized' });
    }
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }
    const result = await telegramBot.setWebhook(url);
    res.json(result);
  } catch (error) {
    console.error('Error setting webhook:', error);
    res.status(500).json({ error: 'Failed to set webhook' });
  }
});

(async () => {
  try {
    // Initialize telegram bot safely
    try {
      const telegramModule = await import("./telegram-bot.js");
      telegramBot = telegramModule.telegramBot;
      console.log('✅ Telegram bot initialized successfully');
    } catch (error) {
      console.warn('⚠️ Telegram bot not available:',error.message);
      console.warn('Telegram features will be disabled');
    }

    const server = await registerRoutes(app);

    // Setup environment-specific middleware
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Error handling middleware (must be last)
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      console.error('Server error:', err);
      res.status(status).json({ message });
    });

    // Server configuration
    const port = process.env.PORT || 5000;
    const host = "0.0.0.0";
    
    server.listen(port, host, () => {
      log(`🚀 MIND Token Educational Platform server running on http://${host}:${port}`);
      log(`📊 Health check available at http://${host}:${port}/`);
      log(`📊 API health check available at http://${host}:${port}/api/health`);
      log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    // Handle server startup errors
        server.on('error', (err: any) => {
          console.error('❌ Server startup error:', err);
          if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use`);
          }
          process.exit(1);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
          log('🛑 SIGTERM received, shutting down gracefully');
          server.close(() => {
            log('✅ Server closed');
            process.exit(0);
          });
        });

        process.on('SIGINT', () => {
          log('🛑 SIGINT received, shutting down gracefully');
          server.close(() => {
            log('✅ Server closed');
            process.exit(0);
          });
        });

      } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
      }
    })();
