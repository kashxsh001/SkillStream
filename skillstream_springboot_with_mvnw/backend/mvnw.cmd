@ECHO OFF
SETLOCAL
set WRAPPER_JAR=.mvn\wrapper\maven-wrapper.jar
set WRAPPER_PROPERTIES=.mvn\wrapper\maven-wrapper.properties
if not exist %WRAPPER_JAR% (
  echo Downloading Maven Wrapper JAR...
  mkdir .mvn\wrapper
  powershell -Command "Invoke-WebRequest https://repo.maven.apache.org/maven2/io/takari/maven-wrapper/0.5.6/maven-wrapper-0.5.6.jar -OutFile %WRAPPER_JAR%"
  echo distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip > %WRAPPER_PROPERTIES%
)
java -cp %WRAPPER_JAR% org.apache.maven.wrapper.MavenWrapperMain %*
