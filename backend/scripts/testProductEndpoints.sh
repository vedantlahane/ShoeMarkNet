#!/bin/bash

echo "🧪 PRODUCT ENDPOINTS TEST SUITE"
echo "================================"

BASE_URL="http://localhost:5000/api"

echo ""
echo "1️⃣  Testing Products Endpoints..."

echo "📋 Get All Products:"
curl -s "$BASE_URL/products?limit=3" | jq '.'

echo -e "\n🔍 Search Products:"
curl -s "$BASE_URL/products?search=nike&limit=2" | jq '.'

echo -e "\n⭐ Get Featured Products:"
curl -s "$BASE_URL/products/featured?limit=2" | jq '.'

echo -e "\n🆕 Get New Arrivals:"
curl -s "$BASE_URL/products/new-arrivals?limit=2" | jq '.'

echo -e "\n💰 Filter by Price Range:"
curl -s "$BASE_URL/products?minPrice=100&maxPrice=200&limit=2" | jq '.'

echo -e "\n🏷️  Filter by Brand:"
curl -s "$BASE_URL/products?brand=Nike&limit=2" | jq '.'

echo ""
echo "🎉 Product Endpoints Testing Completed!"
