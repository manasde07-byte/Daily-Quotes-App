// MainActivity.kt
package com.example.bengalistatus

import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.gms.ads.*
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback

class MainActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: QuoteAdapter
    private var mInterstitialAd: InterstitialAd? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize AdMob
        MobileAds.initialize(this) {}
        val adView = findViewById<AdView>(R.id.adView)
        adView.loadAd(AdRequest.Builder().build())
        loadInterstitialAd()

        recyclerView = findViewById(R.id.quoteRecyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)

        setupCategories()
        showQuotes("ভালোবাসা") // Default category
    }

    private fun setupCategories() {
        val categories = listOf("ভালোবাসা", "অনুপ্রেরণা", "জীবন", "মজা", "দুঃখ")
        val layout = findViewById<LinearLayout>(R.id.categoryLayout)

        for (cat in categories) {
            val btn = Button(this)
            btn.text = cat
            btn.setOnClickListener { showQuotes(cat) }
            layout.addView(btn)
        }
    }

    private fun showQuotes(category: String) {
        val quotes = getQuotesForCategory(category)
        adapter = QuoteAdapter(quotes, { text -> copyToClipboard(text) }, { text -> shareQuote(text) })
        recyclerView.adapter = adapter
    }

    private fun copyToClipboard(text: String) {
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        clipboard.setPrimaryClip(android.content.ClipData.newPlainText("Quote", text))
        Toast.makeText(this, "কপি হয়েছে!", Toast.LENGTH_SHORT).show()
        showInterstitial()
    }

    private fun shareQuote(text: String) {
        val intent = Intent(Intent.ACTION_SEND)
        intent.type = "text/plain"
        intent.putExtra(Intent.EXTRA_TEXT, text)
        startActivity(Intent.createChooser(intent, "শেয়ার করুন"))
        showInterstitial()
    }

    private fun loadInterstitialAd() {
        val adRequest = AdRequest.Builder().build()
        InterstitialAd.load(this, "ca-app-pub-3940256099942544/1033173712", adRequest, 
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(interstitialAd: InterstitialAd) {
                    mInterstitialAd = interstitialAd
                }
            })
    }

    private fun showInterstitial() {
        if (mInterstitialAd != null) {
            mInterstitialAd?.show(this)
            loadInterstitialAd()
        }
    }

    private fun getQuotesForCategory(category: String): List<String> {
        return when(category) {
            "ভালোবাসা" -> listOf("ভালোবাসা মানে একে অপরের পরিপূরক হওয়া।", "তুমি আমার জীবনের আলো।")
            "অনুপ্রেরণা" -> listOf("সাফল্য মানেই শেষ নয়।", "চেষ্টা করলে সব সম্ভব।")
            else -> listOf("একটি সুন্দর উক্তি এখানে থাকবে।")
        }
    }
}
