import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <View style={styles.header}>
          <Text style={styles.title}>PolyBloom Terminal</Text>
          <Text style={styles.subtitle}>Crypto Bloomberg Terminal</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.featureBox}>
            <Text style={styles.featureTitle}>📊 Live Markets</Text>
            <Text style={styles.featureDesc}>
              Real-time data from CoinGecko & Binance
            </Text>
          </View>

          <View style={styles.featureBox}>
            <Text style={styles.featureTitle}>🎰 Polymarket</Text>
            <Text style={styles.featureDesc}>
              Prediction markets and CLOB trading
            </Text>
          </View>

          <View style={styles.featureBox}>
            <Text style={styles.featureTitle}>🤖 OpenClaw</Text>
            <Text style={styles.featureDesc}>
              AI trading strategies with safety rails
            </Text>
          </View>

          <View style={styles.featureBox}>
            <Text style={styles.featureTitle}>⏮️ Backtester</Text>
            <Text style={styles.featureDesc}>
              Historical simulation & replay
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2d3748",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00ff9f",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#a0aec0",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  featureBox: {
    backgroundColor: "#1a202c",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2d3748",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00ff9f",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: "#cbd5e0",
  },
});
