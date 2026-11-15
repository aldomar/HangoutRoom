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
        versionCode = 6    // bump this (2, 3, ...) every time you install an update
        versionName = "1.5"
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
 * The web app lives at the repo root (../../index.html from here) and is the single source of truth.
 * This task copies it into the APK's assets on every build, so you never edit two copies.
 */
abstract class CopyWebApp : DefaultTask() {
    @get:InputFile
    abstract val source: RegularFileProperty

    @get:OutputDirectory
    abstract val outputDir: DirectoryProperty

    @TaskAction
    fun copy() {
        val out = outputDir.get().asFile
        out.mkdirs()
        source.get().asFile.copyTo(File(out, "index.html"), overwrite = true)
    }
}

val copyWebApp = tasks.register<CopyWebApp>("copyWebApp") {
    source.set(rootProject.file("../index.html"))
}

androidComponents {
    onVariants { variant ->
        variant.sources.assets?.addGeneratedSourceDirectory(copyWebApp, CopyWebApp::outputDir)
    }
}
