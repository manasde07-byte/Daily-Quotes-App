// QuoteAdapter.kt
package com.example.bengalistatus

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class QuoteAdapter(
    private val quotes: List<String>,
    private val onCopy: (String) -> Unit,
    private val onShare: (String) -> Unit
) : RecyclerView.Adapter<QuoteAdapter.QuoteViewHolder>() {

    class QuoteViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val quoteText: TextView = view.findViewById(R.id.quoteText)
        val copyBtn: Button = view.findViewById(R.id.copyBtn)
        val shareBtn: Button = view.findViewById(R.id.shareBtn)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): QuoteViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_quote, parent, false)
        return QuoteViewHolder(view)
    }

    override fun onBindViewHolder(holder: QuoteViewHolder, position: Int) {
        val quote = quotes[position]
        holder.quoteText.text = quote
        holder.copyBtn.setOnClickListener { onCopy(quote) }
        holder.shareBtn.setOnClickListener { onShare(quote) }
    }

    override fun getItemCount() = quotes.size
}
