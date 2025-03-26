
FROM openjdk:18

WORKDIR /opt/server

COPY ./target/SSH_client-0.0.1-SNAPSHOT.jar /app/app.jar

EXPOSE 8080

CMD ["java", "-jar", "/app/app.jar"]
