plugins {
    id("com.android.application")
}

android {
    namespace = "com.family.hangoutroom"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.family.hangoutroom"
        minSdk = 26          // Android 8.0+
        targetSdk = 36
        versionCode = 32  // bump this (2, 3, ...) every time you install an update
        versionName = "1.31"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

/*
 * The web app lives at the repo root and is the single source of truth:
 * ../../index.html plus the ../../web/ folder (CSS and code) from here.
 * This task copies both into the APK's assets on every build, so you never edit two copies.
 * The output folder is emptied first, so a file deleted from web/ doesn't linger in the APK.
 */
abstract class CopyWebApp : DefaultTask() {
    @get:InputFile
    abstract val source: RegularFileProperty

    @get:InputDirectory
    abstract val webDir: DirectoryProperty

    @get:OutputDirectory
    abstract val outputDir: DirectoryProperty

    @TaskAction
    fun copy() {
        val out = outputDir.get().asFile
        out.deleteRecursively()
        out.mkdirs()
        source.get().asFile.copyTo(File(out, "index.html"), overwrite = true)
        webDir.get().asFile.copyRecursively(File(out, "web"), overwrite = true)
    }
}

val copyWebApp = tasks.register<CopyWebApp>("copyWebApp") {
    source.set(rootProject.file("../index.html"))
    webDir.set(rootProject.file("../web"))
}

androidComponents {
    onVariants { variant ->
        variant.sources.assets?.addGeneratedSourceDirectory(copyWebApp, CopyWebApp::outputDir)
    }
}
