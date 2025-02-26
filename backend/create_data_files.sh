#!/bin/bash

# Create data directory if it doesn't exist
mkdir -p data

# Create data/homeapi.json
cat << 'EOF' > data/homeapi.json
{
  "title": "Get Your Kicks Now",
  "subtitle": "Latest Sport Shoes",
  "img": "/assets/sneaker.png",
  "btntext": "Explore Product",
  "videos": [
    { "imgsrc": "/assets/video/vcover1.jpg", "clip": "/assets/video/gif3.mp4" },
    { "imgsrc": "/assets/video/vcover2.jpg", "clip": "/assets/video/gif3.mp4" },
    { "imgsrc": "/assets/video/vcover3.jpg", "clip": "/assets/video/gif3.mp4" }
  ],
  "sociallinks": [
    { "icon": "/assets/facebook.svg" },
    { "icon": "/assets/messenger.svg" },
    { "icon": "/assets/instagram.svg" },
    { "icon": "/assets/twitter.svg" },
    { "icon": "/assets/youtube.svg" }
  ]
}
EOF

# Create data/popularsales.json
cat << 'EOF' > data/popularsales.json
{
  "title": "Popular Sales",
  "items": [
    {
      "id": "0p0x1",
      "title": "Nike Air Jordan's 1",
      "text": "Men's Basketball Shoes",
      "rating": "4.9",
      "btn": "Buy Now",
      "img": "/assets/hero.png",
      "price": "200",
      "color": "rgb(153, 155, 160)",
      "shadow": "shadow-lg shadow-black-700"
    },
    {
      "id": "0p0x2",
      "title": "Adidas Superstar",
      "text": "Men's Running Shoes",
      "rating": "4.5",
      "btn": "Buy Now",
      "img": "/assets/Addidas.png",
      "price": "200",
      "color": "rgb(153, 155, 160)",
      "shadow": "shadow-lg shadow-black-700"
    },
    {
      "id": "0p0x3",
      "title": "Puma RS-X Reinvention",
      "text": "Men's Running Shoes",
      "rating": "5+",
      "btn": "Buy Now",
      "img": "/assets/rsx.png",
      "price": "200",
      "color": "rgb(153, 155, 160)",
      "shadow": "shadow-lg shadow-black-700"
    }
  ]
}
EOF

# Create data/highlight.json
cat << 'EOF' > data/highlight.json
{
  "heading": "HIGHLIGHTS",
  "title": "NIKE AIR WITH LIMITLESS CHOICES",
  "text": "Our Purpose is to move the world forward. We take action by building community, protecting our planet and increasing access to sport.",
  "btn": "Explore More",
  "url": "https://www.nike.com/launch/t/nocta-hot-step-black-gold",
  "img": "/assets/hightlightimg.png"
}
EOF

# Create data/sneaker.json
cat << 'EOF' > data/sneaker.json
{
  "heading": "FEATURED",
  "title": "NIKE SNEAKERS AIR LANCING SHOES",
  "text": "The radiance lives on Nike Sneakers Air Lancing Shoes, the basketball OG that puts a fresh spin on what you know best: durably stitched overlays, clean finishes and the perfect amount of flash to make you shine.",
  "btn": "Explore More",
  "url": "https://sneakernews.com/2022/03/21/nike-lebron-2-retro-white-midnight-navy-varsity-crimson-dr0826-100/",
  "img": "/assets/sneaker.png"
}
EOF

# Create data/topratesales.json
cat << 'EOF' > data/topratesales.json
{
  "title": "Top Rated Sales",
  "items": [
    {
      "id": "0M0x1",
      "title": "Nike Air Low Premium",
      "text": "MEN Running Shoes",
      "rating": "5+",
      "btn": "Buy Now",
      "img": "/assets/product7.png",
      "price": "150",
      "color": "rgb(153, 155, 160)",
      "shadow": "shadow-lg shadow-black-700"
    },
    {
      "id": "0M0x2",
      "title": "Nike Air Force Green",
      "text": "MEN Running Shoes",
      "rating": "5+",
      "btn": "Buy Now",
      "img": "/assets/product2.png",
      "price": "150",
      "color": "rgb(153, 155, 160)",
      "shadow": "shadow-lg shadow-black-700"
    },
    {
      "id": "0M0x3",
      "title": "Nike Adapt BB Rose",
      "text": "MEN Running Shoes",
      "rating": "5+",
      "btn": "Buy Now",
      "img": "/assets/product3.png",
      "price": "150",
      "color": "rgb(153, 155, 160)",
      "shadow": "shadow-lg shadow-black-700"
    }
  ]
}
EOF

# Create data/story.json
cat << 'EOF' > data/story.json
{
  "title": "Top Stories",
  "news": [
    {
      "title": "Jayson Tatum Debuts",
      "text": "Jordan Brand's signature model for the past few years, Jayson Tatum will be dawning the Air Jordan 37 this season before potentially getting his first signature sneaker.",
      "img": "https://sneakernews.com/wp-content/uploads/2022/09/air-jordan-37-low.jpg",
      "url": "https://sneakernews.com/2022/09/14/air-jordan-37-low/",
      "like": "3/5",
      "time": "11 Mins",
      "by": "Jared Ebanks",
      "btn": "Read More"
    },
    {
      "title": "Bro’s Nike Zoom Freak 4",
      "text": "The upcoming take on the Zoom Freak 4 draws inspiration from Thanksgiving, using orange and brown for a holiday vibe.",
      "img": "https://sneakernews.com/wp-content/uploads/2022/09/nike-zoom-freak-4.jpg",
      "url": "https://sneakernews.com/2022/09/14/nike-zoom-freak-4/",
      "like": "5/5",
      "time": "41 Mins",
      "by": "Michael Le",
      "btn": "Read More"
    }
  ]
}
EOF

# Create data/footerAPI.json
cat << 'EOF' > data/footerAPI.json
{
  "titles": [
    { "title": "About Drip-Kicks" },
    { "title": "Get Help" },
    { "title": "Company" }
  ],
  "links": [
    [
      { "link": "News" },
      { "link": "Careers" },
      { "link": "Investors" },
      { "link": "Purpose" },
      { "link": "Sustainability" }
    ],
    [
      { "link": "Order Status" },
      { "link": "Shipping & Delivery" },
      { "link": "Payment Options" },
      { "link": "Gift Card Balance" },
      { "link": "Contact Us" },
      { "link": "FAQ" },
      { "link": "Blog" }
    ],
    [
      { "link": "Gift Cards" },
      { "link": "Promotions" },
      { "link": "Find A Store" },
      { "link": "Signup" },
      { "link": "Journal" },
      { "link": "Send Us Feedback" }
    ]
  ]
}
EOF

# Create data/user.json
cat << 'EOF' > data/user.json
[
  {
    "username": "vedant",
    "email": "vedant@example.com",
    "password": "hashedpassword123"
  },
  {
    "username": "johnDoe",
    "email": "johndoe@example.com",
    "password": "hashedpassword456"
  }
]
EOF

echo "Data files created successfully in the 'data' directory!"
