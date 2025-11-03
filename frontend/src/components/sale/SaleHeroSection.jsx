import React from "react";
import { motion } from "motion/react";
import { Flame, Clock, ShoppingBag, Sparkles } from "lucide-react";

const SaleHeroSection = ({ stats }) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 p-8 text-white shadow-2xl">
      {/* Animated background elements */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 animate-pulse"></div>
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-white/5 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Flame className="h-12 w-12 text-cyan-300" />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Limited Time Sale!
              </h1>
              <p className="text-white/90 text-lg">
                Up to {stats.maxDiscount}% off on premium footwear
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 text-center">
              <div className="text-3xl font-bold mb-1">{stats.total}</div>
              <div className="text-sm text-white/80">Items on Sale</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 text-center">
              <div className="text-3xl font-bold mb-1">{stats.maxDiscount}%</div>
              <div className="text-sm text-white/80">Max Discount</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 text-center">
              <div className="text-3xl font-bold mb-1">24hrs</div>
              <div className="text-sm text-white/80">Time Left</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 text-center">
              <div className="text-3xl font-bold mb-1">{stats.averageDiscount}%</div>
              <div className="text-sm text-white/80">Avg Savings</div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-6 py-3 text-white border border-white/30">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">Sale ends in 24 hours!</span>
              <Sparkles className="h-5 w-5" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SaleHeroSection;