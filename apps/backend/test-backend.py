#!/usr/bin/env python3
"""
Simple test script to verify RAG_GOD backend is working
"""

import requests
import json
import time

def test_backend():
    base_url = "http://localhost:8000"
    
    print("Testing RAG_GOD Backend...")
    print("=" * 50)
    
    # Test 1: Status endpoint
    print("1. Testing /status endpoint...")
    try:
        response = requests.get(f"{base_url}/status", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Status: {data.get('status', 'unknown')}")
            print(f"   ✓ Mode: {data.get('mode', 'unknown')}")
            print(f"   ✓ Paper PnL: {data.get('paper_pnl', 'unknown')}")
        else:
            print(f"   ✗ Status code: {response.status_code}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test 2: Health check
    print("\n2. Testing /health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Health: {data.get('status', 'unknown')}")
        else:
            print(f"   ✗ Status code: {response.status_code}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test 3: Mode switching
    print("\n3. Testing /switch-mode endpoint...")
    try:
        response = requests.post(
            f"{base_url}/switch-mode",
            json={"new_mode": 1},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Switched to mode: {data.get('mode', 'unknown')}")
        else:
            print(f"   ✗ Status code: {response.status_code}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test 4: Mode info
    print("\n4. Testing /mode/0 endpoint...")
    try:
        response = requests.get(f"{base_url}/mode/0", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Mode 0 description: {data.get('description', 'unknown')}")
        else:
            print(f"   ✗ Status code: {response.status_code}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n" + "=" * 50)
    print("Backend test completed!")

if __name__ == "__main__":
    test_backend()