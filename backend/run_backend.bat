@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "PATH=C:\Program Files\Java\jdk-17\bin;%PATH%"
mvnw.cmd spring-boot:run -Dmaven.test.skip=true
