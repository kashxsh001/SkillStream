SkillStream Spring Boot + React bundle
Backend (Spring Boot):
 - Location: backend/
 - Run: mvn spring-boot:run (requires Maven & Java 17). Server runs on port 5000.
 - Configure Postgres via environment variables or application.properties:
    SPRING_DATASOURCE_URL (default jdbc:postgresql://localhost:5432/skillstream_db)
    SPRING_DATASOURCE_USERNAME (default postgres)
    SPRING_DATASOURCE_PASSWORD (default postgres)
    JWT_SECRET, JWT_EXPIRATION_MS (optional)

Frontend (React Vite):
 - Location: frontend/
 - Run: npm install && npm run dev (Vite). It expects backend at http://localhost:5000/api/v1