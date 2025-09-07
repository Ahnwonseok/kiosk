# 1단계: 빌드
FROM gradle:8.10.2-jdk17 AS builder
WORKDIR /app

COPY build.gradle settings.gradle ./
COPY gradle gradle
RUN gradle build -x test --no-daemon || return 0

COPY . .
RUN gradle bootJar -x test --no-daemon

# 2단계: 실행
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN useradd -ms /bin/bash spring
USER spring

# JAR 이름을 kiosk.jar로 고정
COPY --from=builder /app/build/libs/*.jar kiosk.jar

EXPOSE 8081
ENTRYPOINT ["java","-jar","kiosk.jar"]
