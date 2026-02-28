# WishBox — Социальный вишлист

## Локальный запуск

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Docs: http://localhost:8000/docs

### Мобильное приложение (React Native)

Для запуска мобильного приложения (iOS) локально:

```bash
cd mobile
npm install
cd ios && bundle exec pod install && cd ..
npx react-native run-ios
```

> **Примечание:** Для корректной работы приложения убедитесь, что backend запущен локально или пропишите актуальные URL развернутого бекенда в `mobile/src/constants.ts`.

## Деплой

### Backend (Railway)

1. Создай новый проект на Railway
2. Add Service → GitHub repo → выбери `/backend`
3. Add PostgreSQL database
4. Переменные окружения:
   ```
   DATABASE_URL=<из Railway PostgreSQL>
   SECRET_KEY=<случайная строка 32+ символов>
   FRONTEND_URL=https://your-app.vercel.app
   ```

### Frontend (Vercel)

1. Импортируй repo на Vercel
2. Root Directory: `frontend`
3. Переменные окружения:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
   ```

## Продуктовые решения

**Анонимное резервирование** — регистрация не нужна, чтобы зарезервировать подарок. Только имя (и опционально email).

**Приватность** — хозяин вишлиста видит `is_reserved: true/false`, но никогда не видит имена резервировщиков. Для групповых подарков видит только сумму.

**Удалённый товар с взносами** — мягкое удаление через `is_deleted`. Вносы сохраняются в БД. Показываем сообщение "товар удалён, свяжитесь с участниками для возврата".

**Целевая сумма не набрана** — подарок всё равно жизнеспособен; прогресс-бар показывает прогресс и мотивирует остальных.

**Реалтайм** — WebSocket соединение на уровне вишлиста. При резервировании/взносе все вкладки обновляются мгновенно.

**URL автозаполнение** — скрапинг через BeautifulSoup: OG-теги, JSON-LD, мета-теги цены. Поддерживает большинство российских магазинов.
