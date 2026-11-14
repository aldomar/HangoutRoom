package com.family.hangoutroom

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.window.OnBackInvokedDispatcher
import org.json.JSONObject

/**
 * A full-screen WebView that runs the Hangout Room web app from the APK's assets.
 * Everything fun happens in index.html; this file only handles the Android bits:
 * saving (localStorage), back button, full screen, and backup file save/restore.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView
    private var fileCallback: ValueCallback<Array<Uri>>? = null   // waiting "Restore from file" picker
    private var pendingBackup: String? = null                      // backup text waiting to be saved

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        web = WebView(this)
        web.setBackgroundColor(Color.parseColor("#231B2E"))
        setContentView(web)
        goFullScreen()

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true            // needed for saves (localStorage)
            allowFileAccess = true              // load index.html from the APK
            mediaPlaybackRequiresUserGesture = false
            textZoom = 100                      // ignore the phone's font-size setting so layouts don't break
            setSupportZoom(false)
        }

        // Stay inside the app: block any link that tries to leave for the web.
        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean =
                request?.url?.scheme != "file"
        }

        // "Restore from file" in Settings uses an <input type=file>; WebView needs us to open the picker.
        web.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: WebChromeClient.FileChooserParams?
            ): Boolean {
                fileCallback?.onReceiveValue(null)
                fileCallback = filePathCallback
                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                }
                return try {
                    this@MainActivity.startActivityForResult(intent, REQ_OPEN_BACKUP)
                    true
                } catch (e: ActivityNotFoundException) {
                    fileCallback = null
                    false
                }
            }
        }

        web.addJavascriptInterface(Bridge(), "AndroidBridge")

        // Back button / back gesture on Android 13+.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            onBackInvokedDispatcher.registerOnBackInvokedCallback(
                OnBackInvokedDispatcher.PRIORITY_DEFAULT
            ) { handleBack() }
        }

        web.loadUrl("file:///android_asset/index.html")
    }

    /** Called from JavaScript as AndroidBridge.saveBackup(text, fileName). */
    inner class Bridge {
        @JavascriptInterface
        fun saveBackup(text: String, fileName: String) {
            runOnUiThread {
                pendingBackup = text
                val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "application/json"
                    putExtra(Intent.EXTRA_TITLE, fileName)
                }
                try {
                    startActivityForResult(intent, REQ_SAVE_BACKUP)
                } catch (e: ActivityNotFoundException) {
                    pendingBackup = null
                    toastInPage("Saving files isn't supported here - use Copy code")
                }
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        when (requestCode) {
            REQ_OPEN_BACKUP -> {
                val uri = if (resultCode == RESULT_OK) data?.data else null
                fileCallback?.onReceiveValue(uri?.let { arrayOf(it) })
                fileCallback = null
            }
            REQ_SAVE_BACKUP -> {
                val text = pendingBackup
                pendingBackup = null
                val uri = data?.data
                if (resultCode == RESULT_OK && uri != null && text != null) {
                    try {
                        contentResolver.openOutputStream(uri)?.use { it.write(text.toByteArray(Charsets.UTF_8)) }
                        toastInPage("Backup file saved 💾")
                    } catch (e: Exception) {
                        toastInPage("Hmm, could not save the backup file")
                    }
                }
            }
        }
    }

    /** Ask the web app to go "back" (close popup -> room -> profiles). Exit only from the profiles screen. */
    private fun handleBack() {
        web.evaluateJavascript("window.androidBack ? androidBack() : false") { handled ->
            if (handled != "true") finish()
        }
    }

    @Deprecated("Used only on Android 12 and older")
    override fun onBackPressed() {
        handleBack()
    }

    private fun toastInPage(msg: String) {
        web.evaluateJavascript("typeof toast==='function' && toast(${JSONObject.quote(msg)})", null)
    }

    private fun goFullScreen() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.insetsController?.let {
                it.hide(WindowInsets.Type.systemBars())
                it.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN)
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) goFullScreen()
    }

    override fun onResume() {
        super.onResume()
        web.onResume()
    }

    override fun onPause() {
        // Make sure the latest progress is written before Android pauses us.
        web.evaluateJavascript("typeof save==='function' && save()", null)
        web.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        web.destroy()
        super.onDestroy()
    }

    companion object {
        private const val REQ_OPEN_BACKUP = 41
        private const val REQ_SAVE_BACKUP = 42
    }
}
