import app from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`🚀 Hisaba API running on http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/health`);
});
