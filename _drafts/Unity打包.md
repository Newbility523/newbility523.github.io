在 Android Studio 中，Java 版本通常在以下几个地方设置：

1. `JAVA_HOME` 环境变量：你可以在命令行中运行 `echo $JAVA_HOME`（在 Unix 或 Linux 系统中）或 `echo %JAVA_HOME%`（在 Windows 系统中）来查看 `JAVA_HOME` 环境变量的值。
2. `build.gradle` 文件：在你的项目的 `build.gradle` 文件中，可能会有一个 `sourceCompatibility` 和 `targetCompatibility` 属性设置了 Java 版本。你可以查看这些属性的值。
3. Android Studio 的设置：在 Android Studio 中，你可以通过 "File" -> "Project Structure" -> "SDK Location" 来查看和修改 JDK 的位置。
4. `gradle.properties` 文件：在你的项目的 `gradle.properties` 文件中，可能会有一个 `org.gradle.java.home` 属性设置了 Java 版本。你可以查看这个属性的值。

请注意，你需要在所有这些地方检查，因为它们可能会互相覆盖。例如，`build.gradle` 文件中的设置会覆盖 `JAVA_HOME` 环境变量，而 `gradle.properties` 文件中的设置会覆盖 `build.gradle` 文件和 `JAVA_HOME` 环境变量。