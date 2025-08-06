import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.move.createMany({
    data: [
      {
        name: "Contorted Dodge",
        categories: ["target"],
        roles: ["support"],
        effects: ["buff"],
        affectedStats: [{ "stat": "speed", "amount": 25 }, { "stat": "defense", "amount": 15 }],
        power: 0,
        accuracy: 95,
        targetTypes: ["self"],
        duration: 1,
        moveType: "special",
        contact: false,
        exceptionHandler: null,
        moveSound: null,
        animation: null,
        relatedCharacters: ["7", "Gyutaro"],
        description: "Using his unnaturally flexible body, increasing his speed and defense for a short time."
      },
      
      {
        name: "Cursed Blood Mist",
        categories: ["target"],
        roles: ["support"],
        effects: ["debuff"],
        affectedStats: [{ "stat": "hp", "amount": -15 }],
        power: 0,
        accuracy: 100,
        targetTypes: ["all"],
        duration: 3,
        moveType: "special",
        contact: false,
        exceptionHandler: null,
        moveSound: null,
        animation: null,
        relatedCharacters: ["7", "Gyutaro"],
        description: "Gyutaro releases a toxic mist of his blood across the battlefield, poisoning all enemies and lowering their attack power."
      }
      


                   
      // {
      //   name: "Satoru Gojo",
      //   title: "Jujutsu Sorcerer",
      //   universe: "Jujutsu Kaisen",
      //   image: "https://4kwallpapers.com/images/walls/thumbs_3t/9292.jpg",
      //   description: "The strongest sorcerer alive, wielding the Limitless and Six Eyes.",
      //   stats: { hp: 90, attack: 85, defense: 70, speed: 95 },
      //   movePool: [
      //     { name: "Infinity Barrier", type: "Defense", power: 0, description: "Creates an impenetrable shield of Infinity, blocking incoming attacks." },
      //     { name: "Reversal: Red", type: "Attack", power: 80, description: "Pushes enemies away with a strong repulsive cursed energy blast." },
      //     { name: "Cursed Technique: Lapse Blue", type: "Attack", power: 85, description: "Generates a powerful vacuum that pulls enemies inward." },
      //     { name: "Hollow Purple", type: "Attack", power: 120, description: "Combines Red & Blue for massive destructive cursed energy damage." },
      //     { name: "Six Eyes Insight", type: "Buff", power: 0, description: "Predicts enemy actions, boosting speed & evasion temporarily." },
      //     { name: "Infinity Step", type: "Utility", power: 0, description: "Teleports short distances instantly to evade or reposition." },
      //     { name: "Domain Expansion: Unlimited Void", type: "Special", power: 0, description: "Traps enemies in Unlimited Void, overwhelming their senses." },
      //     { name: "Cursed Energy Overcharge", type: "Buff", power: 0, description: "Temporarily increases attack power at the cost of defense." },
      //     { name: "Infinity Push", type: "Attack", power: 60, description: "Knocks enemies back with a burst of Infinity." },
      //     { name: "Energy Amplification", type: "Buff", power: 0, description: "Charges up the next attack for extra damage." }
      //   ],        
      //   abilities: {
      //     special: { name: "Limitless", effect: "Takes 50% less damage from physical attacks." },
      //     hidden: { name: "Six Eyes", effect: "Regenerates 5% HP every turn." }
      //   },
      //   theme: {
      //     primaryColor: "#00e6ff",
      //     secondaryColor: "#0033cc",
      //     borderColor: "cyan",
      //     glowColor: "rgba(0, 150, 255, 0.7)"
      //   }
      // },
      // {
      //   name: "Tanjiro Kamado",
      //   title: "Demon Slayer",
      //   universe: "Demon Slayer",
      //   image: "https://images6.alphacoders.com/136/1362340.png",
      //   description: "A kind-hearted boy who wields Water Breathing techniques.",
      //   stats: { hp: 80, attack: 75, defense: 65, speed: 85 },
      //   movePool: [
      //     { name: "Water Surface Slash", type: "Physical", power: 70, description: "A quick water breathing slash." },
      //     { name: "Water Wheel", type: "Physical", power: 75, description: "A spinning slash attack." },
      //     { name: "Dance of the Fire God", type: "Ultimate", power: 110, description: "A powerful flame-enhanced attack." },
      //     { name: "Enhanced Smell", type: "Special", description: "Predicts opponent moves with heightened senses." }
      //   ],
      //   abilities: {
      //     special: { name: "Sun Breathing", effect: "Increases attack by 20% when HP is below 50%." }
      //   },
      //   theme: {
      //     primaryColor: "#ff9966",
      //     secondaryColor: "#cc3300",
      //     borderColor: "#ff6600",
      //     glowColor: "rgba(255, 102, 0, 0.7)"
      //   }
      // },
      // {
      //   name: "Saitama",
      //   title: "Caped Baldy",
      //   universe: "One Punch Man",
      //   image: "https://images3.alphacoders.com/654/654249.png",
      //   description: "The hero for fun who can defeat anyone with a single punch.",
      //   stats: { hp: 100, attack: 999, defense: 80, speed: 90 },
      //   movePool: [
      //     { name: "Normal Punch", type: "Physical", power: 200, description: "A casual punch." },
      //     { name: "Serious Punch", type: "Ultimate", power: 999, description: "An earth-shattering serious punch." },
      //     { name: "Consecutive Normal Punches", type: "Physical", power: 250, description: "A flurry of quick punches." },
      //     { name: "Serious Sideways Jumps", type: "Special", description: "Dodges all incoming attacks for one turn." }
      //   ],
      //   abilities: {
      //     special: { name: "Overwhelming Power", effect: "Always deals at least 200 damage regardless of defense." }
      //   },
      //   theme: {
      //     primaryColor: "#ffeb3b",
      //     secondaryColor: "#f57c00",
      //     borderColor: "#ff9800",
      //     glowColor: "rgba(255, 193, 7, 0.7)"
      //   }
      // },
      // {
      //   name: "Levi Ackerman",
      //   title: "Humanity's Strongest",
      //   universe: "Attack on Titan",
      //   image: "https://i.pinimg.com/736x/b5/89/db/b589dbe9abc83b729095a560a243625b.jpg",
      //   description: "A captain of the Survey Corps known for his speed and skill.",
      //   stats: { hp: 70, attack: 80, defense: 60, speed: 100 },
      //   movePool: [
      //     { name: "Blade Slash", type: "Physical", power: 75, description: "Quick blade strike with ODM gear." },
      //     { name: "Spinning Slash", type: "Physical", power: 80, description: "Rapid spinning attack mid-air." },
      //     { name: "Decapitation", type: "Ultimate", power: 120, description: "Instantly aims for the kill." },
      //     { name: "Quick Reflexes", type: "Special", description: "Dodge the first attack in a turn." }
      //   ],
      //   abilities: {
      //     special: { name: "Ackerman Instincts", effect: "Attack increases by 10% each turn Levi is alive." }
      //   },
      //   theme: {
      //     primaryColor: "#66bb6a",
      //     secondaryColor: "#2e7d32",
      //     borderColor: "#1b5e20",
      //     glowColor: "rgba(76, 175, 80, 0.7)"
      //   }
      // },
      // {
      //   name: "Naruto Uzumaki",
      //   title: "Seventh Hokage",
      //   universe: "Naruto",
      //   image: "https://i.pinimg.com/736x/3c/13/36/3c133632a63bfd91ef357c30ccbdc3c4.jpg",
      //   description: "The ninja who never gives up, wielding the power of Kurama.",
      //   stats: { hp: 95, attack: 85, defense: 75, speed: 90 },
      //   movePool: [
      //     { name: "Rasengan", type: "Energy", power: 90, description: "A spinning chakra sphere attack." },
      //     { name: "Shadow Clone Barrage", type: "Physical", power: 85, description: "A coordinated clone assault." },
      //     { name: "Nine-Tails Chakra Mode", type: "Ultimate", power: 130, description: "Boosted chakra-enhanced attack." },
      //     { name: "Healing Factor", type: "Special", description: "Regenerates 10% HP per turn for 3 turns." }
      //   ],
      //   abilities: {
      //     special: { name: "Nine-Tails Cloak", effect: "Takes 20% less damage when below 50% HP." },
      //     hidden: { name: "Sage of Six Paths", effect: "Increases all stats by 10% for 3 turns once per match." }
      //   },
      //   theme: {
      //     primaryColor: "#ffcc00",
      //     secondaryColor: "#ff6600",
      //     borderColor: "#ff9900",
      //     glowColor: "rgba(255, 165, 0, 0.7)"
      //   }
      // }
    ]
  });
}

main()
  .then(() => {
    console.log("Database seeded with characters!");
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
