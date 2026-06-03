import { useState, useEffect, useRef } from "react";

// ── GOOGLE LOGIN HELPER ──────────────────────────────────────────
// Simulates Google Sign-In flow using a popup window approach
// In production replace with real Firebase / Google Auth SDK
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // replace when ready

const SYSTEM_PROMPT = `You are AutoIQ's master mechanic AI with 30 years experience. When someone describes a car problem:
1. Most Likely Cause (with probability %)
2. Other Possible Causes
3. Estimated Repair Cost (USD)
4. Safe to drive? Yes / No / Caution
5. DIY Difficulty: Easy / Medium / Hard / Professional Only
6. First step to take right now
7. Estimated time to fix
Be practical, clear, and helpful for non-mechanics. Use line breaks between sections.`;

const ADS = [
  { id: 1, brand: "Castrol EDGE", headline: "Engineered for Maximum Performance", sub: "Full Synthetic Motor Oil — Trusted by 10M+ drivers", color: "#e53935", bg: "linear-gradient(135deg,#1a0505,#2d0a0a)", cta: "Shop Now", logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=70" },
  { id: 2, brand: "Bosch Auto Parts", headline: "OEM Quality. Guaranteed.", sub: "Genuine Bosch spare parts for every make & model", color: "#1976d2", bg: "linear-gradient(135deg,#020d1a,#041830)", cta: "Find Parts", logo: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=120&q=70" },
  { id: 3, brand: "Michelin Tyres", headline: "A Better Way Forward", sub: "Premium tyres engineered for every road condition", color: "#1565c0", bg: "linear-gradient(135deg,#010510,#030a20)", cta: "View Range", logo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&q=70" },
];

const BRANDS = [
  { name: "Toyota", type: "Reliable", country: "Japan", img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=300&q=70", color: "#eb0a1e", popular: ["Camry","Corolla","Land Cruiser","Hilux","RAV4"] },
  { name: "BMW", type: "Luxury", country: "Germany", img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&q=70", color: "#0066cc", popular: ["3 Series","5 Series","X5","M3","7 Series"] },
  { name: "Mercedes-Benz", type: "Luxury", country: "Germany", img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=300&q=70", color: "#c0c0c0", popular: ["C-Class","E-Class","GLE","S-Class","AMG GT"] },
  { name: "Ford", type: "Truck/SUV", country: "USA", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300&q=70", color: "#003087", popular: ["F-150","Mustang","Explorer","Ranger","Bronco"] },
  { name: "Porsche", type: "Sports", country: "Germany", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&q=70", color: "#c8102e", popular: ["911","Cayenne","Panamera","Macan","Taycan"] },
  { name: "Land Rover", type: "Luxury SUV", country: "UK", img: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=300&q=70", color: "#005a2b", popular: ["Defender","Range Rover","Discovery","Evoque","Sport"] },
  { name: "Ferrari", type: "Supercar", country: "Italy", img: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=300&q=70", color: "#dc0000", popular: ["F8 Tributo","SF90","Roma","488","Purosangue"] },
  { name: "Lamborghini", type: "Supercar", country: "Italy", img: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=300&q=70", color: "#e8a000", popular: ["Huracán","Urus","Revuelto","Sterrato","SV"] },
  { name: "Chevrolet", type: "American", country: "USA", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&q=70", color: "#c8a900", popular: ["Silverado","Corvette","Camaro","Tahoe","Blazer"] },
  { name: "Honda", type: "Reliable", country: "Japan", img: "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=300&q=70", color: "#cc0000", popular: ["Civic","CR-V","Accord","Pilot","HR-V"] },
  { name: "Audi", type: "Luxury", country: "Germany", img: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&q=70", color: "#bb0a1e", popular: ["A4","Q5","A6","RS6","Q7"] },
  { name: "Jeep", type: "Off-Road SUV", country: "USA", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300&q=70", color: "#4a7c2f", popular: ["Wrangler","Grand Cherokee","Gladiator","Compass","Renegade"] },
  { name: "Nissan", type: "Reliable", country: "Japan", img: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=300&q=70", color: "#c3002f", popular: ["Patrol","GTR","Altima","Kicks","Navara"] },
  { name: "Volkswagen", type: "European", country: "Germany", img: "https://images.unsplash.com/photo-1471079485616-0f0aaa5e7d02?w=300&q=70", color: "#009fe3", popular: ["Golf","Polo","Tiguan","Passat","ID.4"] },
  { name: "Hyundai", type: "Value", country: "South Korea", img: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=300&q=70", color: "#002c5f", popular: ["Tucson","Santa Fe","Elantra","Sonata","Palisade"] },
  { name: "Kia", type: "Value", country: "South Korea", img: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=300&q=70", color: "#bb162b", popular: ["Sportage","Sorento","Carnival","EV6","Stinger"] },
  { name: "Tesla", type: "Electric", country: "USA", img: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=300&q=70", color: "#cc0000", popular: ["Model 3","Model Y","Model S","Model X","Cybertruck"] },
  { name: "Mazda", type: "Reliable", country: "Japan", img: "https://images.unsplash.com/photo-1622200853827-c3b040bc2faf?w=300&q=70", color: "#910000", popular: ["CX-5","Mazda3","CX-9","MX-5","CX-30"] },
  { name: "Subaru", type: "AWD", country: "Japan", img: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=300&q=70", color: "#013983", popular: ["Outback","Forester","WRX","Crosstrek","Impreza"] },
  { name: "Volvo", type: "Safety", country: "Sweden", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&q=70", color: "#003057", popular: ["XC90","XC60","S90","V90","EX90"] },
  { name: "Bentley", type: "Ultra Luxury", country: "UK", img: "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=300&q=70", color: "#b8a96a", popular: ["Continental GT","Bentayga","Flying Spur","Mulsanne","Azure"] },
  { name: "Rolls-Royce", type: "Ultra Luxury", country: "UK", img: "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=300&q=70", color: "#8b7355", popular: ["Phantom","Ghost","Wraith","Dawn","Cullinan"] },
  { name: "McLaren", type: "Supercar", country: "UK", img: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=300&q=70", color: "#ff8000", popular: ["720S","765LT","Artura","GT","P1"] },
  { name: "Aston Martin", type: "Sports Luxury", country: "UK", img: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=300&q=70", color: "#004f39", popular: ["DB11","Vantage","DBS","DBX","Vanquish"] },
  { name: "Bugatti", type: "Hypercar", country: "France", img: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=300&q=70", color: "#0a1f5c", popular: ["Chiron","Veyron","Divo","Centodieci","Mistral"] },
  { name: "Dodge", type: "American Muscle", country: "USA", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&q=70", color: "#c8102e", popular: ["Challenger","Charger","Durango","RAM","Viper"] },
  { name: "GMC", type: "Truck", country: "USA", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300&q=70", color: "#d4af37", popular: ["Sierra","Yukon","Canyon","Acadia","Terrain"] },
  { name: "Lexus", type: "Japanese Luxury", country: "Japan", img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=300&q=70", color: "#1a1a2e", popular: ["LX600","RX","ES","LS","LC500"] },
  { name: "Infiniti", type: "Japanese Luxury", country: "Japan", img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=300&q=70", color: "#8b0000", popular: ["QX80","Q50","QX60","Q60","QX55"] },
  { name: "Cadillac", type: "American Luxury", country: "USA", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&q=70", color: "#8b7355", popular: ["Escalade","CT5","XT5","Lyriq","CT4"] },
  { name: "Peugeot", type: "European", country: "France", img: "https://images.unsplash.com/photo-1471079485616-0f0aaa5e7d02?w=300&q=70", color: "#003189", popular: ["308","3008","2008","508","408"] },
  { name: "Mitsubishi", type: "Reliable", country: "Japan", img: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=300&q=70", color: "#c8102e", popular: ["Outlander","Pajero","L200","Eclipse Cross","ASX"] },
  { name: "Suzuki", type: "Budget Reliable", country: "Japan", img: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=300&q=70", color: "#003b6f", popular: ["Swift","Vitara","Jimny","Baleno","S-Cross"] },
  { name: "Skoda", type: "European Value", country: "Czech Republic", img: "https://images.unsplash.com/photo-1471079485616-0f0aaa5e7d02?w=300&q=70", color: "#4caf50", popular: ["Octavia","Kodiaq","Karoq","Superb","Enyaq"] },
  { name: "Renault", type: "European", country: "France", img: "https://images.unsplash.com/photo-1471079485616-0f0aaa5e7d02?w=300&q=70", color: "#efdf00", popular: ["Clio","Megane","Kadjar","Captur","Zoe"] },
];

// Videos — search term used instead of ID so YouTube search always finds working results
const VIDEOS = [
  { search: "how to change engine oil chrisfix", title: "How to Change Engine Oil — Complete Guide", channel: "ChrisFix", views: "18M", duration: "14:32", cat: "Maintenance", thumb: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&q=70" },
  { search: "how to replace brake pads rotors chrisfix", title: "Replace Brake Pads & Rotors — Full DIY", channel: "ChrisFix", views: "22M", duration: "19:47", cat: "Brakes", thumb: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=320&q=70" },
  { search: "how to replace spark plugs chrisfix", title: "How to Replace Spark Plugs — Step by Step", channel: "ChrisFix", views: "11M", duration: "12:18", cat: "Engine", thumb: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=320&q=70" },
  { search: "how to replace car battery chrisfix", title: "How to Replace a Car Battery", channel: "ChrisFix", views: "9M", duration: "8:54", cat: "Electrical", thumb: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=320&q=70" },
  { search: "how to replace air filter chrisfix", title: "Replace Air Filter — 5 Minute DIY", channel: "ChrisFix", views: "7M", duration: "5:21", cat: "Maintenance", thumb: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=320&q=70" },
  { search: "how car engine works animation", title: "How a Car Engine Works — Animated", channel: "Engineering Explained", views: "31M", duration: "9:40", cat: "Education", thumb: "https://images.unsplash.com/photo-1537434710188-e6d2fbea9db1?w=320&q=70" },
  { search: "how automatic transmission works engineering explained", title: "Automatic Transmission Explained", channel: "Engineering Explained", views: "15M", duration: "11:22", cat: "Transmission", thumb: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=320&q=70" },
  { search: "how disc brakes work animation", title: "How Disc Brakes Work — Animation", channel: "Engineering Explained", views: "8M", duration: "7:14", cat: "Brakes", thumb: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=320&q=70" },
  { search: "check engine light causes scotty kilmer", title: "Check Engine Light — All Common Causes", channel: "Scotty Kilmer", views: "12M", duration: "10:05", cat: "Diagnostics", thumb: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=320&q=70" },
  { search: "how to detail car like pro chrisfix", title: "How to Detail Your Car Like a Pro", channel: "ChrisFix", views: "14M", duration: "22:10", cat: "Detailing", thumb: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=320&q=70" },
  { search: "BMW engine explained engineering explained", title: "BMW Engine — Full Breakdown", channel: "Engineering Explained", views: "5M", duration: "16:30", cat: "Luxury", thumb: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=320&q=70" },
  { search: "why toyota reliable scotty kilmer", title: "Toyota Reliability — Why They Last So Long", channel: "Scotty Kilmer", views: "8M", duration: "9:12", cat: "Toyota", thumb: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=320&q=70" },
  { search: "how turbocharger works animation", title: "How Turbochargers Work — Animation", channel: "Engineering Explained", views: "19M", duration: "8:44", cat: "Education", thumb: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=320&q=70" },
  { search: "how to replace windshield wipers chrisfix", title: "Replace Windshield Wipers — Easy DIY", channel: "ChrisFix", views: "6M", duration: "4:15", cat: "Maintenance", thumb: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&q=70" },
  { search: "how to fix flat tyre chrisfix", title: "How to Fix a Flat Tyre — Complete Guide", channel: "ChrisFix", views: "13M", duration: "11:30", cat: "Tyres", thumb: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=320&q=70" },
];

const VIDEO_CATS = ["All","Maintenance","Brakes","Engine","Electrical","Education","Transmission","Diagnostics","Luxury","Detailing","Toyota","Tyres"];

const REPAIRS = [
  { title:"Oil & Filter Change", time:"30 min", diff:"Easy", cost:"$35–80", img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70", steps:["Warm engine 2 min then switch off","Place drain pan under drain plug","Remove plug — let oil fully drain","Replace drain plug with new washer","Remove old oil filter — install new one","Add correct oil grade and quantity","Run engine 30 sec — check for leaks","Check dipstick and adjust level"] },
  { title:"Brake Pad Replacement", time:"1–2 hrs", diff:"Medium", cost:"$150–300", img:"https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=300&q=70", steps:["Loosen wheel nuts before jacking","Jack car safely — use axle stands","Remove wheel to access caliper","Remove caliper bolts — hang with wire","Slide out worn brake pads","Compress caliper piston with C-clamp","Install new pads with anti-squeal compound","Reinstall caliper — torque to spec","Pump pedal firmly before driving"] },
  { title:"Spark Plug Replacement", time:"45 min", diff:"Medium", cost:"$50–150", img:"https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&q=70", steps:["Let engine cool 2+ hours completely","Remove ignition coils or plug wires","Use spark plug socket to remove old plugs","Check gap on new plugs with feeler gauge","Apply thin coat of anti-seize to threads","Thread new plugs in by hand first","Torque to manufacturer spec only","Reinstall coils — test engine"] },
  { title:"Air Filter Replacement", time:"10 min", diff:"Easy", cost:"$20–45", img:"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&q=70", steps:["Find air box near engine intake","Unclip or unscrew air box lid","Remove old filter — note orientation","Wipe inside of air box with cloth","Install new filter in correct orientation","Clip lid securely — check all clips"] },
  { title:"Battery Replacement", time:"20 min", diff:"Easy", cost:"$100–200", img:"https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=300&q=70", steps:["Turn ignition fully off","Disconnect NEGATIVE terminal first (black)","Disconnect POSITIVE terminal (red)","Remove battery hold-down clamp","Lift out old battery — use both hands","Clean terminal posts with wire brush","Lower new battery into position","Connect POSITIVE first then NEGATIVE","Test all electrical systems"] },
  { title:"Tyre Rotation", time:"45 min", diff:"Medium", cost:"$20–50", img:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&q=70", steps:["Loosen all wheel nuts slightly","Jack each corner — use axle stands","Remove all four wheels","Move front wheels to rear — same side","Move rear wheels to front — cross pattern","Reinstall all wheels hand tight","Lower car — torque nuts to spec","Check tyre pressure on all four"] },
];

const WARNINGS = [
  { e:"🔴", name:"Check Engine", sev:"Check Soon", sc:"#ff9800", desc:"Your car's computer detected a fault. Could be minor (loose gas cap) or serious (engine misfire). Get OBD2 diagnostic scan to find exact code.", img:"https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&q=70" },
  { e:"🔴", name:"Oil Pressure", sev:"STOP NOW", sc:"#f44336", desc:"CRITICAL — Pull over immediately and turn off engine. Driving with low oil pressure destroys your engine within minutes. Do not restart until inspected.", img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70" },
  { e:"🔴", name:"Engine Temp", sev:"STOP NOW", sc:"#f44336", desc:"Engine overheating. Pull over safely and turn off immediately. Do NOT open bonnet for 30 minutes. Call recovery if temp doesn't drop.", img:"https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&q=70" },
  { e:"🟡", name:"Battery", sev:"Today", sc:"#ff9800", desc:"Charging system fault. Battery or alternator issue. Car may not restart if you switch off. Drive directly to nearest garage now.", img:"https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=300&q=70" },
  { e:"🟡", name:"ABS Warning", sev:"This Week", sc:"#ff9800", desc:"Anti-lock brake system fault. Normal braking still works but ABS is disabled. Get diagnosed before you need emergency braking.", img:"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&q=70" },
  { e:"🟡", name:"Tyre Pressure", sev:"Today", sc:"#ff9800", desc:"One or more tyres are significantly low. Check all four with a gauge. Inflate to the placard pressure shown inside your door jamb.", img:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&q=70" },
  { e:"🔴", name:"Brake System", sev:"STOP NOW", sc:"#f44336", desc:"Brake fluid critically low or serious brake fault. Do NOT drive. Check fluid reservoir immediately. Call a mechanic — do not attempt to drive.", img:"https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=300&q=70" },
  { e:"🟡", name:"Service Due", sev:"Book Soon", sc:"#4caf50", desc:"Scheduled maintenance required. Book service within 500 miles. Ignoring leads to bigger and more expensive problems down the line.", img:"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&q=70" },
  { e:"🟡", name:"Fuel Level", sev:"Refuel Now", sc:"#ff9800", desc:"Fuel critically low. Running on empty damages your fuel pump over time. Refuel as soon as possible — do not let it reach empty.", img:"https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=300&q=70" },
  { e:"🟡", name:"Airbag / SRS", sev:"This Week", sc:"#ff9800", desc:"Supplemental restraint system fault. Airbags may not deploy in a crash. Get diagnosed urgently — this is a safety critical system.", img:"https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&q=70" },
];

const PREMIUM_FEATURES = [
  { icon:"🤖", title:"Unlimited AI Mechanic", desc:"Unlimited questions to AutoIQ AI. No daily cap. Available 24/7 anytime anywhere.", free:false },
  { icon:"📊", title:"Full Vehicle Health Report", desc:"Complete 50-point inspection checklist with personalized recommendations for your car.", free:false },
  { icon:"🔔", title:"Service Reminders", desc:"Custom maintenance alerts based on your car make, model, mileage and service history.", free:false },
  { icon:"💰", title:"Repair Cost Estimator", desc:"Accurate repair cost ranges for your specific make and model in your local area.", free:false },
  { icon:"📹", title:"Ad-Free Video Library", desc:"Watch all 100+ repair tutorial videos with zero advertisements interrupting your learning.", free:false },
  { icon:"🗂️", title:"Personal Garage", desc:"Save multiple vehicles with full service history, notes, mileage tracker and documents.", free:false },
  { icon:"🛣️", title:"Road Trip Checker", desc:"Pre-trip vehicle inspection checklist. Know your car is ready before any long journey.", free:false },
  { icon:"📞", title:"Priority Mechanic Chat", desc:"Skip the queue. Premium users get instant responses with highest priority AI processing.", free:false },
  { icon:"🔍", title:"OBD2 Code Library", desc:"Full database of 15,000+ fault codes explained in plain language with fix guides.", free:false },
  { icon:"🌍", title:"All 35 Car Brands", desc:"Complete guides, common issues, and maintenance for every car brand on our platform.", free:true },
];

function EngineAnim({ type }) {
  const [step, setStep] = useState(0);
  const [activePart, setActivePart] = useState(null);
  useEffect(() => { const t = setInterval(() => setStep(s => (s+1)%4), 1400); return () => clearInterval(t); }, []);
  const or = "#ff6b2b";
  const parts = {
    engine: [
      { l:"Spark Plug", x:50, y:12, d:"Ignites the air-fuel mixture at precisely the right moment, creating a controlled explosion that powers the piston." },
      { l:"Intake Valve", x:28, y:28, d:"Opens during intake stroke to allow the air-fuel mixture into the cylinder from the intake manifold." },
      { l:"Exhaust Valve", x:72, y:28, d:"Opens to release burnt combustion gases out through the exhaust manifold after each power stroke." },
      { l:"Piston", x:50, y:52, d:"Moves up and down converting explosion energy into mechanical motion that drives your wheels." },
      { l:"Connecting Rod", x:50, y:68, d:"Links piston to crankshaft, transferring downward force of combustion into rotation." },
      { l:"Crankshaft", x:50, y:84, d:"Converts piston's up-down motion into rotation. Connected to transmission then driveshaft then wheels." },
    ],
    brakes: [
      { l:"Caliper", x:78, y:38, d:"Hydraulic clamp gripping the rotor. Contains pistons that push brake pads against the spinning disc." },
      { l:"Brake Pads", x:22, y:38, d:"Friction material pressed against the rotor. Replace every 25,000–70,000 miles." },
      { l:"Brake Rotor", x:50, y:50, d:"Steel disc rotating with the wheel. Calipers clamp it to create friction and slow the vehicle." },
      { l:"Brake Line", x:50, y:18, d:"Carries high-pressure hydraulic fluid from master cylinder to each caliper when pedal is pressed." },
    ],
    transmission: [
      { l:"Torque Converter", x:14, y:50, d:"Fluid coupling allowing engine to idle while car is stationary without stalling the engine." },
      { l:"Planetary Gears", x:42, y:50, d:"Interlocking gear sets creating different ratios for optimal acceleration and fuel economy." },
      { l:"Hydraulic Pump", x:68, y:30, d:"Pressurises fluid to operate clutch packs and actuate smooth gear changes automatically." },
      { l:"Output Shaft", x:86, y:50, d:"Delivers final rotational output to driveshaft and wheels at the correct gear ratio." },
    ],
  };
  const pts = parts[type] || parts.engine;
  return (
    <div>
      <div style={{ background:"#0a0d12", border:"1px solid rgba(255,107,43,0.15)", borderRadius:16, overflow:"hidden", marginBottom:12 }}>
        <svg viewBox="0 0 100 100" style={{ width:"100%", height:220, display:"block" }}>
          {type==="engine" && <>
            <rect x="28" y="8" width="44" height="76" rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,107,43,0.2)" strokeWidth="0.8" />
            <rect x="36" y="15" width="28" height="44" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,107,43,0.15)" strokeWidth="0.5" />
            <rect x="40" y={step%2===0?20:32} width="20" height="20" rx="2" fill="rgba(255,107,43,0.15)" stroke={or} strokeWidth="1" style={{ transition:"y 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
            <line x1="50" y1={step%2===0?40:52} x2="50" y2="74" stroke="rgba(255,107,43,0.5)" strokeWidth="1.5" strokeLinecap="round" style={{ transition:"all 0.6s ease" }} />
            <ellipse cx="50" cy="77" rx="9" ry="5" fill="none" stroke="rgba(255,107,43,0.6)" strokeWidth="1.5" />
            <circle cx="50" cy="16" r="2.5" fill={step===2?"#ffeb3b":"rgba(255,107,43,0.3)"} style={{ transition:"fill 0.15s" }} />
            {step===2 && <ellipse cx="50" cy="28" rx="12" ry="7" fill="rgba(255,100,0,0.12)" stroke="rgba(255,100,0,0.3)" strokeWidth="0.5" />}
            <rect x="28" y="22" width="8" height="3" rx="1" fill={step===0?or:"rgba(255,107,43,0.2)"} style={{ transition:"fill 0.3s" }} />
            <rect x="64" y="22" width="8" height="3" rx="1" fill={step===3?or:"rgba(255,107,43,0.2)"} style={{ transition:"fill 0.3s" }} />
          </>}
          {type==="brakes" && <>
            <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
            <circle cx="50" cy="50" r="32" fill="none" stroke={or} strokeWidth="10" strokeDasharray={`${step*50} 201`} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition:"stroke-dasharray 0.8s ease", filter:"drop-shadow(0 0 4px rgba(255,107,43,0.5))" }} />
            <circle cx="50" cy="50" r="18" fill="rgba(255,255,255,0.03)" stroke="rgba(255,107,43,0.2)" strokeWidth="1" />
            <circle cx="50" cy="50" r="6" fill="rgba(255,107,43,0.4)" />
            <rect x="73" y="40" width="12" height="20" rx="3" fill="rgba(255,107,43,0.15)" stroke={or} strokeWidth="1" />
            <rect x="15" y="40" width="12" height="20" rx="3" fill="rgba(255,107,43,0.15)" stroke={or} strokeWidth="1" />
          </>}
          {type==="transmission" && <>
            {[{cx:14,r:12},{cx:40,r:16},{cx:65,r:9},{cx:84,r:6}].map((g,i) => (
              <g key={i}>
                <circle cx={g.cx} cy={50} r={g.r} fill="rgba(255,255,255,0.02)" stroke={`rgba(255,107,43,${i===step%4?"0.8":"0.2"})`} strokeWidth="1.5" style={{ transition:"stroke 0.4s" }} />
                {Array.from({length:6}).map((_,t) => { const a=(t/6)*Math.PI*2; return <line key={t} x1={g.cx+Math.cos(a)*(g.r-2)} y1={50+Math.sin(a)*(g.r-2)} x2={g.cx+Math.cos(a)*g.r} y2={50+Math.sin(a)*g.r} stroke={`rgba(255,107,43,${i===step%4?"0.5":"0.12"})`} strokeWidth="0.8" />; })}
                <circle cx={g.cx} cy={50} r="2.5" fill={`rgba(255,107,43,${i===step%4?"0.9":"0.3"})`} />
              </g>
            ))}
          </>}
          {pts.map((p,i) => (
            <g key={i} style={{ cursor:"pointer" }} onClick={() => setActivePart(activePart===i?null:i)}>
              <circle cx={p.x} cy={p.y} r="5" fill={activePart===i?or:"rgba(255,107,43,0.2)"} stroke={or} strokeWidth="1" style={{ transition:"all 0.2s" }} />
              <circle cx={p.x} cy={p.y} r="2" fill={activePart===i?"#fff":or} />
              {activePart===i && <circle cx={p.x} cy={p.y} r="9" fill="none" stroke={or} strokeWidth="0.5" opacity="0.4" />}
            </g>
          ))}
        </svg>
        {type==="engine" && (
          <div style={{ display:"flex", gap:1, padding:"0 12px 12px" }}>
            {["Intake","Compress","Power","Exhaust"].map((s,i) => (
              <div key={i} style={{ flex:1, padding:"5px 3px", borderRadius:6, background:step===i?"rgba(255,107,43,0.15)":"rgba(255,255,255,0.02)", border:`1px solid ${step===i?"rgba(255,107,43,0.4)":"rgba(255,255,255,0.05)"}`, textAlign:"center", fontSize:8, color:step===i?or:"rgba(255,255,255,0.25)", transition:"all 0.3s" }}>{s}</div>
            ))}
          </div>
        )}
      </div>
      {activePart!==null ? (
        <div style={{ background:"rgba(255,107,43,0.06)", border:"1px solid rgba(255,107,43,0.25)", borderRadius:12, padding:"12px 14px", marginBottom:10 }}>
          <div style={{ fontSize:13, fontWeight:700, color:or, marginBottom:4 }}>{pts[activePart].l}</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.65 }}>{pts[activePart].d}</div>
        </div>
      ) : (
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", textAlign:"center", marginBottom:10 }}>Tap any orange dot to learn about each part</div>
      )}
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:4 }}>
        {pts.map((p,i) => (
          <button key={i} onClick={() => setActivePart(activePart===i?null:i)} style={{ background:activePart===i?"rgba(255,107,43,0.1)":"rgba(255,255,255,0.03)", border:`1px solid ${activePart===i?"rgba(255,107,43,0.4)":"rgba(255,255,255,0.07)"}`, borderRadius:8, padding:"5px 10px", fontSize:10, color:activePart===i?or:"rgba(255,255,255,0.4)", cursor:"pointer", transition:"all 0.2s", fontFamily:"inherit" }}>{p.l}</button>
        ))}
      </div>
    </div>
  );
}

function AdBanner({ ad, type="strip" }) {
  if (!ad) return null;
  if (type==="strip") return (
    <div style={{ background:ad.bg, border:`1px solid ${ad.color}25`, borderRadius:12, padding:"11px 14px", margin:"14px 0", display:"flex", alignItems:"center", gap:12, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", right:-24, top:-24, width:80, height:80, borderRadius:"50%", background:`radial-gradient(circle, ${ad.color}20, transparent)` }} />
      <img src={ad.logo} alt="" style={{ width:40, height:40, borderRadius:8, objectFit:"cover", border:`1px solid ${ad.color}30` }} />
      <div style={{ flex:1 }}>
        <div style={{ fontSize:8, color:"rgba(255,255,255,0.2)", letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:1 }}>Sponsored · {ad.brand}</div>
        <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{ad.headline}</div>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:1 }}>{ad.sub}</div>
      </div>
      <div style={{ background:ad.color, color:"#fff", padding:"6px 12px", borderRadius:8, fontSize:10, fontWeight:700, flexShrink:0, cursor:"pointer" }}>{ad.cta}</div>
    </div>
  );
  return (
    <div style={{ background:ad.bg, border:`1px solid ${ad.color}35`, borderRadius:16, padding:"18px 16px", marginBottom:14, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-40, right:-40, width:140, height:140, borderRadius:"50%", background:`radial-gradient(circle, ${ad.color}12, transparent)` }} />
      <div style={{ fontSize:8, color:"rgba(255,255,255,0.2)", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:10 }}>Advertisement · {ad.brand}</div>
      <img src={ad.logo} alt="" style={{ width:56, height:40, objectFit:"cover", borderRadius:8, marginBottom:10, border:`1px solid ${ad.color}30` }} />
      <div style={{ fontSize:20, fontWeight:800, color:"#fff", marginBottom:4 }}>{ad.headline}</div>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginBottom:14 }}>{ad.sub}</div>
      <button style={{ background:ad.color, color:"#fff", border:"none", padding:"9px 20px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}>{ad.cta} →</button>
    </div>
  );
}

export default function AutoIQ() {
  const [screen, setScreen] = useState("home");
  const [engineType, setEngineType] = useState("engine");
  const [activeRepair, setActiveRepair] = useState(null);
  const [activeBrand, setActiveBrand] = useState(null);
  const [activeWarning, setActiveWarning] = useState(null);
  const [videoCat, setVideoCat] = useState("All");
  const [playingVideo, setPlayingVideo] = useState(null);
  const [messages, setMessages] = useState([{ role:"assistant", text:"Hey! I'm AutoIQ — your personal AI master mechanic. Describe any car problem, sound, warning light, or issue and I'll diagnose it instantly. What's going on with your vehicle?" }]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [adIdx, setAdIdx] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [brandFilter, setBrandFilter] = useState("All");
  const [brandSearch, setBrandSearch] = useState("");
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, isTyping]);
  useEffect(() => { const t = setInterval(() => setAdIdx(i => (i+1)%ADS.length), 7000); return () => clearInterval(t); }, []);

  // Google login simulation — replace with real Firebase Auth in production
  const handleGoogleLogin = () => {
    setUser({
      name: "AutoIQ User",
      email: "user@gmail.com",
      photo: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&q=80",
      joinDate: new Date().toLocaleDateString("en-US", { month:"long", year:"numeric" })
    });
    setShowLogin(false);
    setShowProfile(false);
  };
  const handleLogout = () => { setUser(null); setShowProfile(false); };

  const sendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const userMsg = { role:"user", text:chatInput };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setChatInput(""); setIsTyping(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYSTEM_PROMPT, messages:updated.map(m => ({ role:m.role==="assistant"?"assistant":"user", content:m.text })) })
      });
      const data = await res.json();
      setMessages(p => [...p, { role:"assistant", text:data.content?.[0]?.text || "Can you describe more details?" }]);
    } catch { setMessages(p => [...p, { role:"assistant", text:"Connection issue. Please try again." }]); }
    setIsTyping(false);
  };

  const dc = d => ({ Easy:"#66bb6a", Medium:"#ffa726", Hard:"#ef5350", "Professional Only":"#ab47bc" }[d] || "#ffa726");
  const filteredVideos = videoCat==="All" ? VIDEOS : VIDEOS.filter(v => v.cat===videoCat);
  const BRAND_TYPES = ["All","Reliable","Luxury","Sports","Supercar","Truck/SUV","Electric","Ultra Luxury","American","Off-Road SUV","AWD","Safety","European","Value","Hypercar","American Muscle","American Luxury","Japanese Luxury","Sports Luxury","Budget Reliable","European Value"];
  const filteredBrands = BRANDS.filter(b => {
    const matchType = brandFilter==="All" || b.type===brandFilter;
    const matchSearch = !brandSearch || b.name.toLowerCase().includes(brandSearch.toLowerCase());
    return matchType && matchSearch;
  });

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@500;600;700;800&display=swap');
    @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    *{box-sizing:border-box;margin:0;padding:0;}
    :root{--bg:#07090d;--s1:#0d1018;--s2:#131720;--s3:#1a1f2a;--bd:rgba(255,255,255,0.07);--bd2:rgba(255,255,255,0.12);--tx:#dde2ea;--mt:#5a6478;--or:#ff6b2b;--bl:#4fc3f7;--gr:#66bb6a;--gold:#f0b90b;}
    body{background:var(--bg);color:var(--tx);font-family:'Barlow',sans-serif;-webkit-font-smoothing:antialiased;}
    .app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);}
    .hdr{background:var(--s1);border-bottom:1px solid var(--bd);padding:0 16px;height:52px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;}
    .logo{display:flex;align-items:center;gap:9px;}
    .logo-ic{width:32px;height:32px;background:linear-gradient(135deg,#ff6b2b,#ff9500);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 3px 12px rgba(255,107,43,0.35);}
    .logo-tx{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;letter-spacing:0.06em;}
    .logo-tx span{color:var(--or);}
    .logo-tag{font-size:8px;color:var(--mt);letter-spacing:0.15em;text-transform:uppercase;margin-top:-3px;}
    .hdr-right{display:flex;align-items:center;gap:7px;}
    .ai-pill{display:flex;align-items:center;gap:5px;background:rgba(255,107,43,0.1);border:1px solid rgba(255,107,43,0.25);padding:5px 10px;border-radius:20px;font-size:10px;color:var(--or);font-weight:700;letter-spacing:0.06em;}
    .ai-dot{width:5px;height:5px;background:var(--or);border-radius:50%;animation:pulse 1.5s ease infinite;box-shadow:0 0 5px var(--or);}
    .pro-pill{background:linear-gradient(135deg,rgba(240,185,11,0.2),rgba(240,185,11,0.1));border:1px solid rgba(240,185,11,0.35);padding:5px 10px;border-radius:20px;font-size:10px;color:var(--gold);font-weight:700;cursor:pointer;}
    .nav{display:flex;background:var(--s1);border-bottom:1px solid var(--bd);overflow-x:auto;}
    .nav::-webkit-scrollbar{display:none;}
    .nb{flex-shrink:0;padding:11px 13px;border:none;background:none;color:var(--mt);font-size:11px;font-weight:600;cursor:pointer;font-family:'Barlow',sans-serif;border-bottom:2px solid transparent;transition:all 0.2s;white-space:nowrap;margin-bottom:-1px;}
    .nb.on{color:var(--or);border-bottom-color:var(--or);}
    .content{padding:16px 16px 82px;}
    .slbl{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;color:var(--mt);letter-spacing:0.2em;text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
    .slbl::after{content:'';flex:1;height:1px;background:var(--bd);}
    .hero-wrap{position:relative;margin:-16px -16px 16px;}
    .hero-wrap img{width:100%;height:200px;object-fit:cover;display:block;filter:brightness(0.3);}
    .hero-ov{position:absolute;inset:0;background:linear-gradient(180deg,transparent 0%,var(--bg) 100%);}
    .hero-cnt{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:18px;}
    .hero-title{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:800;letter-spacing:0.04em;line-height:1.05;margin-bottom:4px;}
    .hero-title span{color:var(--or);}
    .hero-sub{font-size:12px;color:rgba(255,255,255,0.45);}
    .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
    .stat{background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:11px 8px;text-align:center;}
    .sv{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:700;color:var(--or);line-height:1;}
    .sl{font-size:9px;color:var(--mt);margin-top:2px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;}
    .tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
    .tile{border-radius:14px;overflow:hidden;height:108px;cursor:pointer;position:relative;transition:transform 0.2s;}
    .tile:hover{transform:translateY(-2px);}
    .tile img{width:100%;height:100%;object-fit:cover;display:block;}
    .tile-ov{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:12px;}
    .tile-t{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;color:#fff;}
    .tile-s{font-size:10px;color:rgba(255,255,255,0.55);margin-top:1px;}
    .search-inp{width:100%;background:var(--s2);border:1px solid var(--bd2);border-radius:10px;padding:10px 14px;color:var(--tx);font-size:13px;outline:none;font-family:'Barlow',sans-serif;margin-bottom:10px;}
    .search-inp::placeholder{color:var(--mt);}
    .filter-row{display:flex;gap:6px;overflow-x:auto;margin-bottom:12px;padding-bottom:2px;}
    .filter-row::-webkit-scrollbar{display:none;}
    .ftab{flex-shrink:0;padding:5px 12px;border-radius:16px;border:1px solid var(--bd);background:var(--s2);font-size:10px;font-weight:600;color:var(--mt);cursor:pointer;transition:all 0.2s;font-family:'Barlow',sans-serif;white-space:nowrap;}
    .ftab.on{background:rgba(255,107,43,0.1);border-color:rgba(255,107,43,0.3);color:var(--or);}
    .brands-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
    .brand-card{border-radius:12px;overflow:hidden;cursor:pointer;position:relative;height:90px;border:2px solid transparent;transition:all 0.25s;}
    .brand-card img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(0.5) brightness(0.4);}
    .brand-card.sel img,.brand-card:hover img{filter:saturate(1) brightness(0.6);}
    .brand-card.sel{border-color:var(--or);}
    .brand-ov{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:7px;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);}
    .brand-n{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:#fff;line-height:1.1;}
    .brand-t{font-size:8px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.06em;}
    .brand-info{background:rgba(255,107,43,0.05);border:1px solid rgba(255,107,43,0.2);border-radius:12px;padding:14px;margin-bottom:14px;animation:fu 0.3s ease;}
    .repair-card{background:var(--s2);border:1px solid var(--bd);border-radius:14px;overflow:hidden;margin-bottom:10px;cursor:pointer;transition:border-color 0.2s;}
    .repair-card.open{border-color:rgba(255,107,43,0.3);}
    .repair-hdr{display:flex;align-items:center;gap:0;}
    .repair-img{width:80px;height:72px;object-fit:cover;display:block;flex-shrink:0;}
    .repair-meta{flex:1;padding:10px 10px;}
    .repair-title{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700;margin-bottom:4px;}
    .rtags{display:flex;flex-wrap:wrap;gap:5px;}
    .rtag{font-size:9px;font-weight:700;padding:2px 8px;border-radius:6px;letter-spacing:0.06em;}
    .repair-chev{font-size:20px;color:var(--mt);padding-right:12px;transition:transform 0.2s;}
    .repair-body{padding:14px;border-top:1px solid var(--bd);}
    .step{display:flex;gap:10px;margin-bottom:8px;}
    .step-n{width:22px;height:22px;border-radius:50%;background:rgba(255,107,43,0.1);border:1px solid rgba(255,107,43,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--or);flex-shrink:0;}
    .step-t{font-size:12px;color:rgba(255,255,255,0.6);line-height:1.55;padding-top:2px;}
    .vtabs{display:flex;gap:6px;overflow-x:auto;margin-bottom:14px;padding-bottom:2px;}
    .vtabs::-webkit-scrollbar{display:none;}
    .vtab{flex-shrink:0;padding:6px 13px;border-radius:20px;border:1px solid var(--bd);background:var(--s2);font-size:11px;font-weight:600;color:var(--mt);cursor:pointer;transition:all 0.2s;font-family:'Barlow',sans-serif;}
    .vtab.on{background:rgba(255,107,43,0.1);border-color:rgba(255,107,43,0.3);color:var(--or);}
    .vcard{background:var(--s2);border:1px solid var(--bd);border-radius:12px;overflow:hidden;cursor:pointer;margin-bottom:10px;transition:border-color 0.2s;}
    .vcard:hover{border-color:var(--bd2);}
    .vthumb{position:relative;width:100%;height:0;padding-bottom:56.25%;overflow:hidden;}
    .vthumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
    .vplay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);}
    .vplay-btn{width:50px;height:50px;border-radius:50%;background:rgba(255,107,43,0.9);display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 20px rgba(255,107,43,0.4);}
    .vdur{position:absolute;bottom:6px;right:8px;background:rgba(0,0,0,0.8);color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;}
    .vinfo{padding:10px 12px;}
    .vtitle{font-size:13px;font-weight:600;margin-bottom:4px;line-height:1.4;}
    .vmeta{display:flex;justify-content:space-between;align-items:flex-end;}
    .vchan{font-size:10px;color:var(--or);font-weight:600;}
    .vviews{font-size:10px;color:var(--mt);}
    .vcat-tag{font-size:9px;color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.05);padding:2px 7px;border-radius:5px;margin-top:3px;display:inline-block;}
    .modal{position:fixed;inset:0;background:rgba(0,0,0,0.93);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;}
    .modal-inner{width:100%;max-width:400px;background:var(--s1);border-radius:16px;overflow:hidden;}
    .modal-close{width:100%;padding:13px;background:var(--s2);border:none;color:var(--mt);font-size:13px;cursor:pointer;font-family:'Barlow',sans-serif;font-weight:600;}
    .iframe-wrap{position:relative;padding-bottom:56.25%;height:0;}
    .iframe-wrap iframe{position:absolute;inset:0;width:100%;height:100%;border:none;}
    .warn-card{display:flex;background:var(--s2);border:1px solid var(--bd);border-radius:12px;overflow:hidden;cursor:pointer;margin-bottom:8px;transition:border-color 0.2s;}
    .warn-card.open{border-color:rgba(255,107,43,0.3);}
    .warn-img{width:70px;height:72px;object-fit:cover;flex-shrink:0;filter:saturate(0.3) brightness(0.4);}
    .warn-card.open .warn-img{filter:saturate(0.8) brightness(0.55);}
    .warn-body{flex:1;padding:10px 12px;}
    .warn-top{display:flex;align-items:center;gap:8px;margin-bottom:4px;}
    .warn-name{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;flex:1;}
    .warn-sev{font-size:9px;font-weight:700;padding:2px 8px;border-radius:8px;letter-spacing:0.06em;}
    .warn-desc{font-size:11px;color:rgba(255,255,255,0.5);line-height:1.6;margin-top:4px;display:none;}
    .warn-card.open .warn-desc{display:block;}
    .sys-tabs{display:flex;gap:8px;margin-bottom:14px;}
    .systab{flex:1;padding:9px 8px;border-radius:10px;border:1px solid var(--bd);background:var(--s2);font-size:11px;font-weight:600;color:var(--mt);cursor:pointer;transition:all 0.2s;text-align:center;font-family:'Barlow',sans-serif;}
    .systab.on{background:rgba(255,107,43,0.1);border-color:rgba(255,107,43,0.3);color:var(--or);}
    .chat-intro{background:var(--s2);border:1px solid var(--bd);border-radius:10px;padding:10px 14px;text-align:center;font-size:12px;color:var(--mt);margin-bottom:14px;}
    .chat-msgs{display:flex;flex-direction:column;gap:12px;padding-bottom:150px;}
    .bub{max-width:85%;padding:12px 14px;font-size:13px;line-height:1.65;white-space:pre-wrap;}
    .bub.ai{align-self:flex-start;background:var(--s3);border:1px solid var(--bd2);border-radius:16px 16px 16px 4px;}
    .bub.user{align-self:flex-end;background:linear-gradient(135deg,rgba(255,107,43,0.2),rgba(255,107,43,0.08));border:1px solid rgba(255,107,43,0.25);border-radius:16px 16px 4px 16px;color:#fff0e8;}
    .typing{align-self:flex-start;background:var(--s3);border:1px solid var(--bd2);border-radius:16px 16px 16px 4px;padding:14px 16px;display:flex;gap:4px;}
    .td{width:6px;height:6px;background:var(--mt);border-radius:50%;animation:pulse 1s ease infinite;}
    .td:nth-child(2){animation-delay:0.15s;}.td:nth-child(3){animation-delay:0.3s;}
    .cbar{position:fixed;bottom:60px;left:50%;transform:translateX(-50%);width:100%;max-width:430px;padding:10px 14px;background:rgba(7,9,13,0.97);backdrop-filter:blur(20px);border-top:1px solid var(--bd);display:flex;gap:8px;z-index:99;}
    .ci{flex:1;background:var(--s3);border:1px solid var(--bd2);border-radius:24px;padding:11px 16px;color:var(--tx);font-size:13px;outline:none;font-family:'Barlow',sans-serif;}
    .ci:focus{border-color:rgba(255,107,43,0.4);}
    .ci::placeholder{color:var(--mt);}
    .send{width:42px;height:42px;border-radius:50%;border:none;background:linear-gradient(135deg,#ff6b2b,#ff9500);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(255,107,43,0.35);flex-shrink:0;}
    .premium-hero{border-radius:16px;padding:24px 20px;margin-bottom:16px;text-align:center;position:relative;overflow:hidden;background:linear-gradient(135deg,#1a1200,#2a1a00);}
    .premium-hero-border{position:absolute;inset:0;border-radius:16px;border:1px solid rgba(240,185,11,0.3);background:linear-gradient(135deg,rgba(240,185,11,0.08),transparent);}
    .premium-glow{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:200px;height:120px;background:radial-gradient(circle,rgba(240,185,11,0.15),transparent);pointer-events:none;}
    .crown{font-size:36px;margin-bottom:8px;}
    .premium-title{font-family:'Barlow Condensed',sans-serif;font-size:28px;font-weight:800;color:var(--gold);letter-spacing:0.06em;margin-bottom:4px;}
    .premium-sub{font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:16px;}
    .premium-price{font-family:'Barlow Condensed',sans-serif;font-size:42px;font-weight:800;color:#fff;line-height:1;}
    .premium-period{font-size:13px;color:rgba(255,255,255,0.4);}
    .upgrade-btn{width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#f0b90b,#f8d33a);color:#000;font-size:15px;font-weight:800;cursor:pointer;font-family:'Barlow Condensed',sans-serif;letter-spacing:0.06em;margin-top:16px;transition:all 0.2s;box-shadow:0 4px 20px rgba(240,185,11,0.3);}
    .upgrade-btn:hover{box-shadow:0 6px 28px rgba(240,185,11,0.5);}
    .feature-row{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--bd);}
    .feature-row:last-child{border-bottom:none;}
    .feature-ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;background:rgba(255,107,43,0.08);border:1px solid rgba(255,107,43,0.15);}
    .feature-ico.premium-feat{background:rgba(240,185,11,0.08);border-color:rgba(240,185,11,0.2);}
    .feature-title{font-size:13px;font-weight:700;margin-bottom:2px;}
    .feature-desc{font-size:11px;color:var(--mt);line-height:1.55;}
    .free-tag{font-size:9px;font-weight:700;padding:2px 8px;border-radius:6px;background:rgba(102,187,106,0.12);color:#66bb6a;margin-left:6px;}
    .pro-tag{font-size:9px;font-weight:700;padding:2px 8px;border-radius:6px;background:rgba(240,185,11,0.12);color:var(--gold);margin-left:6px;}
    .ad-screen{}
    .ad-hero{background:linear-gradient(135deg,rgba(255,107,43,0.07),rgba(255,107,43,0.02));border:1px solid rgba(255,107,43,0.18);border-radius:14px;padding:20px;margin-bottom:16px;text-align:center;}
    .ad-big{font-family:'Barlow Condensed',sans-serif;font-size:36px;font-weight:800;color:var(--or);letter-spacing:0.05em;}
    .tier{background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:10px;display:flex;gap:12px;}
    .tier-ico{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
    .tier-t{font-size:14px;font-weight:700;margin-bottom:3px;}
    .tier-d{font-size:11px;color:var(--mt);line-height:1.65;}
    .tier-p{font-size:11px;font-weight:700;padding:3px 10px;border-radius:8px;margin-top:6px;display:inline-block;font-family:'Barlow Condensed',sans-serif;}
    .how-to-box{background:rgba(79,195,247,0.04);border:1px solid rgba(79,195,247,0.15);border-radius:12px;padding:14px;margin-top:4px;}
    .how-to-step{display:flex;gap:10px;margin-bottom:10px;align-items:flex-start;}
    .how-num{width:24px;height:24px;border-radius:50%;background:rgba(79,195,247,0.12);border:1px solid rgba(79,195,247,0.25);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--bl);flex-shrink:0;}
    .how-txt{font-size:12px;color:rgba(255,255,255,0.55);line-height:1.6;padding-top:2px;}
    .contact-box{background:rgba(255,107,43,0.04);border:1px solid rgba(255,107,43,0.15);border-radius:10px;padding:16px;margin-top:8px;}
    .contact-email{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;color:var(--or);word-break:break-all;}
    .contact-detail{font-size:11px;color:var(--mt);line-height:1.8;margin-top:6px;}
    .bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:rgba(7,9,13,0.97);backdrop-filter:blur(30px);border-top:1px solid var(--bd);display:flex;z-index:100;padding-bottom:env(safe-area-inset-bottom,0);}
    .bnb{flex:1;padding:10px 2px 8px;border:none;background:none;color:var(--mt);font-size:8px;font-weight:700;cursor:pointer;font-family:'Barlow',sans-serif;display:flex;flex-direction:column;align-items:center;gap:3px;letter-spacing:0.08em;text-transform:uppercase;transition:color 0.2s;position:relative;}
    .bnb.on{color:var(--or);}
    .bnb.on::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:18px;height:2px;background:var(--or);border-radius:0 0 2px 2px;box-shadow:0 0 8px var(--or);}
    .bni{font-size:18px;}
    .modal{display:none;}
    .iframe-wrap{display:none;}
    .modal-close{display:none;}
  `;

  return (
    <div className="app">
      <style>{css}</style>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#0d1018", border:"1px solid rgba(255,255,255,0.12)", borderRadius:20, padding:28, width:"100%", maxWidth:360, textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:10 }}>🔧</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:800, marginBottom:4 }}>Sign in to AutoIQ</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:24, lineHeight:1.6 }}>Save your garage, service history and preferences across all your devices</div>
            <button onClick={handleGoogleLogin} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:12, background:"#fff", color:"#333", border:"none", borderRadius:10, padding:"13px 20px", fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <button onClick={() => setShowLogin(false)} style={{ width:"100%", background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"11px 20px", fontSize:13, color:"rgba(255,255,255,0.4)", cursor:"pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfile && user && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#0d1018", border:"1px solid rgba(255,255,255,0.12)", borderRadius:20, padding:28, width:"100%", maxWidth:360, textAlign:"center" }}>
            <img src={user.photo} alt="" style={{ width:72, height:72, borderRadius:"50%", border:"3px solid var(--or)", marginBottom:12, objectFit:"cover" }}/>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:800, marginBottom:2 }}>{user.name}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:6 }}>{user.email}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginBottom:24 }}>Member since {user.joinDate}</div>
            {isPremium && <div style={{ background:"rgba(240,185,11,0.1)", border:"1px solid rgba(240,185,11,0.3)", borderRadius:8, padding:"6px 14px", display:"inline-block", fontSize:11, color:"#f0b90b", fontWeight:700, marginBottom:16 }}>👑 PRO Member</div>}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setShowProfile(false)} style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:11, fontSize:13, color:"rgba(255,255,255,0.5)", cursor:"pointer" }}>Close</button>
              <button onClick={handleLogout} style={{ flex:1, background:"rgba(246,70,93,0.1)", border:"1px solid rgba(246,70,93,0.25)", borderRadius:10, padding:11, fontSize:13, color:"#f6465d", fontWeight:700, cursor:"pointer" }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO MODAL REMOVED — videos now open YouTube search directly */}
      <div className="hdr">
        <div className="logo">
          <div className="logo-ic">🔧</div>
          <div>
            <div className="logo-tx">Auto<span>IQ</span></div>
            <div className="logo-tag">AI Master Mechanic</div>
          </div>
        </div>
        <div className="hdr-right">
          <div className="ai-pill"><div className="ai-dot"/>AI LIVE</div>
          {user ? (
            <img src={user.photo} alt="" onClick={() => setShowProfile(true)} style={{ width:30, height:30, borderRadius:"50%", border:"2px solid var(--or)", cursor:"pointer", objectFit:"cover" }}/>
          ) : (
            <div className="pro-pill" onClick={() => setShowLogin(true)}>Sign In</div>
          )}
        </div>
      </div>
      <div className="nav">
        {[["home","Home"],["diagnose","AI Mechanic"],["howit","How It Works"],["videos","Videos"],["repair","Repairs"],["brands","Cars"],["warnings","Lights"],["premium","Premium"],["ads","Advertise"]].map(([id,lbl]) => (
          <button key={id} className={`nb ${screen===id?"on":""}`} onClick={() => setScreen(id)}>{lbl}</button>
        ))}
      </div>
      <div className="content">

        {screen==="home" && <>
          <div className="hero-wrap">
            <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80" alt="" />
            <div className="hero-ov"/>
            <div className="hero-cnt">
              <div className="hero-title">Your <span>AI Mechanic</span><br/>Available 24/7</div>
              <div className="hero-sub">Diagnose any car problem instantly — completely free</div>
            </div>
          </div>
          <div className="stats">
            {[["35+","Car Brands"],["500+","Repairs"],["24/7","AI Support"]].map(([v,l],i) => <div key={i} className="stat"><div className="sv">{v}</div><div className="sl">{l}</div></div>)}
          </div>
          <AdBanner ad={ADS[adIdx]} type="strip"/>
          <div className="slbl">Quick Access</div>
          <div className="tiles">
            {[
              { t:"AI Mechanic", s:"Instant diagnosis", img:"https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400&q=70", sc:"diagnose", g:"linear-gradient(to top,rgba(255,107,43,0.85),rgba(0,0,0,0.2))" },
              { t:"How It Works", s:"Interactive 3D diagrams", img:"https://images.unsplash.com/photo-1537434710188-e6d2fbea9db1?w=400&q=70", sc:"howit", g:"linear-gradient(to top,rgba(79,195,247,0.85),rgba(0,0,0,0.2))" },
              { t:"Video Guides", s:"Top YouTube tutorials", img:"https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&q=70", sc:"videos", g:"linear-gradient(to top,rgba(244,67,54,0.85),rgba(0,0,0,0.2))" },
              { t:"35+ Car Brands", s:"All makes & models", img:"https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=70", sc:"brands", g:"linear-gradient(to top,rgba(102,187,106,0.85),rgba(0,0,0,0.2))" },
            ].map((t,i) => (
              <div key={i} className="tile" onClick={() => setScreen(t.sc)}>
                <img src={t.img} alt=""/>
                <div className="tile-ov" style={{ background:t.g }}>
                  <div className="tile-t">{t.t}</div>
                  <div className="tile-s">{t.s}</div>
                </div>
              </div>
            ))}
          </div>
          <AdBanner ad={ADS[(adIdx+1)%ADS.length]} type="card"/>
        </>}

        {screen==="diagnose" && <>
          <div className="chat-intro">Describe any sound, warning light, or problem — AI diagnoses it instantly and free</div>
          <div className="chat-msgs">
            {messages.map((m,i) => <div key={i} className={`bub ${m.role==="assistant"?"ai":"user"}`}>{m.text}</div>)}
            {isTyping && <div className="typing"><div className="td"/><div className="td"/><div className="td"/></div>}
            <div ref={messagesEnd}/>
          </div>
          <div className="cbar">
            <input className="ci" placeholder="e.g. My engine makes a knocking sound when I accelerate..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&sendMessage()}/>
            <button className="send" onClick={sendMessage}>↑</button>
          </div>
        </>}

        {screen==="howit" && <>
          <div className="sys-tabs">
            {[["engine","🔩 Engine"],["brakes","🔴 Brakes"],["transmission","⚙️ Gearbox"]].map(([id,lbl]) => (
              <div key={id} className={`systab ${engineType===id?"on":""}`} onClick={() => setEngineType(id)}>{lbl}</div>
            ))}
          </div>
          {/* Background image header */}
          <div style={{ position:"relative", borderRadius:16, overflow:"hidden", marginBottom:14, height:130, border:"1px solid rgba(255,107,43,0.25)" }}>
            <div style={{
              position:"absolute", inset:0,
              backgroundImage:`url(${{"engine":"https://images.unsplash.com/photo-1537434710188-e6d2fbea9db1?w=600&q=70","brakes":"https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&q=70","transmission":"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=70"}[engineType]})`,
              backgroundSize:"cover",
              backgroundPosition:"center",
              filter:"brightness(0.3)"
            }}/>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, padding:16 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:800, color:"#fff", letterSpacing:"0.04em", textAlign:"center" }}>
                {{ engine:"⚙️ 4-Stroke Engine", brakes:"🔴 Disc Brake System", transmission:"🔩 Automatic Gearbox" }[engineType]}
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", textAlign:"center" }}>Tap orange dots to explore each component</div>
            </div>
          </div>
          <EngineAnim type={engineType}/>
          <AdBanner ad={ADS[adIdx]} type="strip"/>
        </>}

        {screen==="videos" && <>
          <div className="slbl">Video Repair Library</div>
          <div style={{ background:"rgba(255,107,43,0.06)", border:"1px solid rgba(255,107,43,0.18)", borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:12, color:"rgba(255,200,150,0.8)", lineHeight:1.6 }}>
            Tap any video — it opens YouTube and plays automatically
          </div>
          <div className="vtabs">
            {VIDEO_CATS.map(c => <div key={c} className={`vtab ${videoCat===c?"on":""}`} onClick={() => setVideoCat(c)}>{c}</div>)}
          </div>
          <AdBanner ad={ADS[adIdx]} type="strip"/>
          {filteredVideos.map((v,i) => (
            <div key={i} className="vcard" onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(v.search)}`, '_blank')}>
              <div className="vthumb">
                <img src={v.thumb} alt={v.title} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                <div className="vplay"><div className="vplay-btn">▶</div></div>
                <div className="vdur">{v.duration}</div>
              </div>
              <div className="vinfo">
                <div className="vtitle">{v.title}</div>
                <div className="vmeta">
                  <div><div className="vchan">{v.channel}</div><span className="vcat-tag">{v.cat}</span></div>
                  <div className="vviews">{v.views} views</div>
                </div>
              </div>
            </div>
          ))}
        </>}

        {screen==="repair" && <>
          <div className="slbl">DIY Repair Guides</div>
          {REPAIRS.map((r,i) => (
            <div key={i} className={`repair-card ${activeRepair===i?"open":""}`} onClick={() => setActiveRepair(activeRepair===i?null:i)}>
              <div className="repair-hdr">
                <img className="repair-img" src={r.img} alt={r.title}/>
                <div className="repair-meta">
                  <div className="repair-title">{r.title}</div>
                  <div className="rtags">
                    <span className="rtag" style={{ background:`${dc(r.diff)}15`, color:dc(r.diff) }}>{r.diff}</span>
                    <span className="rtag" style={{ background:"rgba(255,255,255,0.05)", color:"var(--mt)" }}>{r.time}</span>
                    <span className="rtag" style={{ background:"rgba(255,255,255,0.05)", color:"var(--mt)" }}>{r.cost}</span>
                  </div>
                </div>
                <div className="repair-chev" style={{ transform:activeRepair===i?"rotate(90deg)":"none" }}>›</div>
              </div>
              {activeRepair===i && (
                <div className="repair-body">
                  {r.steps.map((s,j) => <div key={j} className="step"><div className="step-n">{j+1}</div><div className="step-t">{s}</div></div>)}
                </div>
              )}
            </div>
          ))}
          <AdBanner ad={ADS[(adIdx+2)%ADS.length]} type="strip"/>
        </>}

        {screen==="brands" && <>
          <div className="slbl">35 Car Brands — A to Z</div>
          <input className="search-inp" placeholder="Search brand name..." value={brandSearch} onChange={e => setBrandSearch(e.target.value)}/>
          <div className="filter-row">
            {["All","Reliable","Luxury","Sports","Supercar","SUV","Electric","Truck/SUV","Ultra Luxury","American"].map(f => (
              <div key={f} className={`ftab ${brandFilter===f?"on":""}`} onClick={() => setBrandFilter(f)}>{f}</div>
            ))}
          </div>
          {activeBrand && (
            <div className="brand-info">
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <img src={activeBrand.img} alt="" style={{ width:52, height:38, objectFit:"cover", borderRadius:8, border:`1px solid ${activeBrand.color}40` }}/>
                <div>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:800 }}>{activeBrand.name}</div>
                  <div style={{ fontSize:10, color:"var(--mt)", textTransform:"uppercase", letterSpacing:"0.1em" }}>{activeBrand.type} · {activeBrand.country}</div>
                </div>
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginBottom:8 }}>Popular models:</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:10 }}>
                {activeBrand.popular.map(m => <span key={m} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid var(--bd)", borderRadius:6, padding:"3px 10px", fontSize:11, color:"var(--tx)" }}>{m}</span>)}
              </div>
              <button onClick={() => setScreen("diagnose")} style={{ background:"var(--or)", color:"#fff", border:"none", padding:"8px 16px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}>Ask AI About {activeBrand.name} →</button>
            </div>
          )}
          <div style={{ fontSize:11, color:"var(--mt)", marginBottom:10 }}>Showing {filteredBrands.length} of {BRANDS.length} brands</div>
          <div className="brands-grid">
            {filteredBrands.map((b,i) => (
              <div key={i} className={`brand-card ${activeBrand?.name===b.name?"sel":""}`} onClick={() => setActiveBrand(activeBrand?.name===b.name?null:b)}>
                <img src={b.img} alt={b.name}/>
                <div className="brand-ov">
                  <div className="brand-n">{b.name}</div>
                  <div className="brand-t">{b.type}</div>
                </div>
              </div>
            ))}
          </div>
        </>}

        {screen==="warnings" && <>
          <div style={{ background:"rgba(239,83,80,0.06)", border:"1px solid rgba(239,83,80,0.18)", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12, color:"rgba(239,83,80,0.75)", lineHeight:1.65 }}>
            🔴 Red = pull over immediately  ·  🟡 Yellow = address soon  ·  Tap any light for details
          </div>
          {WARNINGS.map((w,i) => (
            <div key={i} className={`warn-card ${activeWarning===i?"open":""}`} onClick={() => setActiveWarning(activeWarning===i?null:i)}>
              <img className="warn-img" src={w.img} alt={w.name}/>
              <div className="warn-body">
                <div className="warn-top">
                  <span style={{ fontSize:18 }}>{w.e}</span>
                  <div className="warn-name">{w.name}</div>
                  <div className="warn-sev" style={{ background:`${w.sc}18`, color:w.sc }}>{w.sev}</div>
                </div>
                <div className="warn-desc">{w.desc}</div>
              </div>
            </div>
          ))}
          <AdBanner ad={ADS[(adIdx+1)%ADS.length]} type="strip"/>
        </>}

        {screen==="premium" && <>
          <div className="premium-hero">
            <div className="premium-hero-border"/>
            <div className="premium-glow"/>
            <div style={{ position:"relative" }}>
              <div className="crown">👑</div>
              <div className="premium-title">AutoIQ PRO</div>
              <div className="premium-sub">Everything you need. Unlimited. Ad-free.</div>
              <div style={{ display:"flex", justifyContent:"center", alignItems:"baseline", gap:4 }}>
                <div className="premium-price">$4.99</div>
                <div className="premium-period">/month</div>
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4 }}>or $39.99/year — save 33%</div>
              <button className="upgrade-btn" onClick={() => setIsPremium(true)}>
                {isPremium ? "✓ You are Premium" : "Upgrade to PRO — $4.99/month"}
              </button>
            </div>
          </div>

          <div className="slbl">What's Included</div>
          <div style={{ background:"var(--s2)", border:"1px solid var(--bd)", borderRadius:14, padding:"4px 14px", marginBottom:14 }}>
            {PREMIUM_FEATURES.map((f,i) => (
              <div key={i} className="feature-row">
                <div className={`feature-ico ${!f.free?"premium-feat":""}`}>{f.icon}</div>
                <div>
                  <div style={{ display:"flex", alignItems:"center" }}>
                    <div className="feature-title">{f.title}</div>
                    {f.free ? <span className="free-tag">FREE</span> : <span className="pro-tag">PRO</span>}
                  </div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="slbl">Compare Plans</div>
          <div style={{ background:"var(--s2)", border:"1px solid var(--bd)", borderRadius:12, overflow:"hidden", marginBottom:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px", background:"var(--s3)", padding:"10px 14px", borderBottom:"1px solid var(--bd)" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--mt)" }}>Feature</div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--mt)", textAlign:"center" }}>Free</div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--gold)", textAlign:"center" }}>PRO</div>
            </div>
            {[
              ["AI Mechanic","5/day","Unlimited"],
              ["Video Library","With ads","Ad-Free"],
              ["Car Brands","All 35","All 35"],
              ["Repair Guides","Basic","Advanced"],
              ["Service Reminders","✕","✓"],
              ["Personal Garage","1 car","Unlimited"],
              ["OBD2 Code Library","✕","15,000+"],
              ["Cost Estimator","✕","✓"],
              ["Road Trip Checker","✕","✓"],
            ].map(([feat,free,pro],i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px", padding:"10px 14px", borderBottom:"1px solid var(--bd)", background:i%2===0?"transparent":"rgba(255,255,255,0.01)" }}>
                <div style={{ fontSize:12, color:"var(--tx)" }}>{feat}</div>
                <div style={{ fontSize:11, color:free==="✕"?"rgba(255,255,255,0.2)":"var(--mt)", textAlign:"center" }}>{free}</div>
                <div style={{ fontSize:11, color:pro==="✕"?"rgba(255,255,255,0.2)":"var(--gold)", textAlign:"center", fontWeight:700 }}>{pro}</div>
              </div>
            ))}
          </div>
        </>}

        {screen==="ads" && <>
          <div className="ad-hero">
            <div style={{ fontSize:10, color:"var(--mt)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8 }}>Advertising on AutoIQ</div>
            <div className="ad-big">REACH MILLIONS</div>
            <div style={{ fontSize:12, color:"var(--mt)", marginTop:4 }}>of car owners actively seeking products & services</div>
          </div>

          <div className="slbl">How to Advertise</div>
          <div className="how-to-box">
            <div style={{ fontSize:11, color:"var(--bl)", fontWeight:700, marginBottom:10, letterSpacing:"0.08em", textTransform:"uppercase" }}>Simple 3-Step Process</div>
            {[
              ["Email us your interest","Send an email to akturbothrills@gmail.com with your brand name, budget, and what you want to promote."],
              ["We agree on a package","We discuss which ad type fits your goal and budget — banner, card, or category sponsor."],
              ["Send us your ad content","Provide your logo, headline, description, and CTA. We add your ad to the app within 24–48 hours."],
            ].map(([t,d],i) => (
              <div key={i} className="how-to-step">
                <div className="how-num">{i+1}</div>
                <div><div style={{ fontSize:12, fontWeight:700, color:"var(--tx)", marginBottom:2 }}>{t}</div><div className="how-txt">{d}</div></div>
              </div>
            ))}
          </div>

          <div className="slbl" style={{ marginTop:16 }}>Ad Packages & Pricing</div>
          {[
            { ico:"📢", t:"Strip Banner Ad", d:"Rotating banner between sections. Logo, headline, CTA. Rotates every 7 seconds with other advertisers. Reaches all users throughout their session.", p:"$299/month", c:"#4fc3f7", bg:"rgba(79,195,247,0.08)" },
            { ico:"🎯", t:"Feature Card Ad", d:"Large premium card on home screen and How It Works section. Full story with image, headline, description and CTA button. Maximum brand impact.", p:"$599/month", c:"#ff6b2b", bg:"rgba(255,107,43,0.08)" },
            { ico:"👑", t:"Category Sponsor", d:"Own all placements in one section exclusively. E.g. all Engine guides branded by Castrol. Full integration with custom content. Highest visibility.", p:"$1,499/month", c:"#f0b90b", bg:"rgba(240,185,11,0.08)" },
          ].map((t,i) => (
            <div key={i} className="tier">
              <div className="tier-ico" style={{ background:t.bg }}>{t.ico}</div>
              <div><div className="tier-t">{t.t}</div><div className="tier-d">{t.d}</div><div className="tier-p" style={{ background:t.bg, color:t.c }}>{t.p}</div></div>
            </div>
          ))}

          <div className="slbl" style={{ marginTop:8 }}>Contact to Advertise</div>
          <div className="contact-box">
            <div style={{ fontSize:11, color:"var(--mt)", marginBottom:6 }}>Send your advertising enquiry to:</div>
            <div className="contact-email">akturbothrills@gmail.com</div>
            <div className="contact-detail">
              Include: Brand name · Budget · Target audience · Preferred package<br/>
              Response guaranteed within 24 hours<br/>
              Custom packages available for long-term partnerships<br/>
              All major payment methods accepted
            </div>
          </div>

          <div className="slbl" style={{ marginTop:14 }}>Live Ad Previews</div>
          {ADS.map((ad,i) => <AdBanner key={i} ad={ad} type={i===1?"card":"strip"}/>)}
        </>}

      </div>

      <div className="bnav">
        {[["home","🏠","Home"],["diagnose","🤖","AI Fix"],["videos","▶️","Videos"],["repair","🔧","Repairs"],["premium","👑","Premium"]].map(([id,icon,label]) => (
          <button key={id} className={`bnb ${screen===id?"on":""}`} onClick={() => setScreen(id)}>
            <span className="bni">{icon}</span>{label}
          </button>
        ))}
      </div>
    </div>
  );
}
