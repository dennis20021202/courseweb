# 採用多階段建置 (Multi-stage Build) 以縮小映像檔體積

# --- 第一階段：建置 (Build) ---
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# 先複製 pom.xml 下載依賴 (利用 Docker cache 加速)
COPY pom.xml .
# 下載依賴 (離線模式準備)
RUN mvn dependency:go-offline

# 複製原始碼並打包
COPY src ./src
RUN mvn package -DskipTests

# --- 第二階段：執行 (Run) ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 從第一階段複製打包好的 jar 檔
# 注意：這裡假設打包出來的是 target/*.jar，通常 Spring Boot 預設會產生一個可執行 jar
COPY --from=builder /app/target/*.jar app.jar

# 設定啟動指令
ENTRYPOINT ["java", "-jar", "app.jar"]