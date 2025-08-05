import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.character.createMany({
    data: [
      {
        name: "Zenitsu Agatsuma",
        title: "Demon Slayer",
        universe: "Demon Slayer",
        image: "https://wallpapers.com/images/hd/demon-slayer-zenitsu-pfp-oaizqqb7636rfdzf.jpg",
        description: "A member of the Demon Slayer Corps, Zenitsu wields Thunder Breathing with extraordinary speed and reflexes, often revealing his true potential in unconscious states.",
        stats: { hp: 90, speed: 99, strength: 85, power: 88, agility: 95 },
        movePool: [
          { name: "First Form: Thunderclap and Flash (Six Fold)", type: "Physical", power: 80, description: "Executes six rapid consecutive slashes at lightning speed." },
          { name: "Thunderclap and Flash: God Speed", type: "Ultimate", power: 105, description: "Zenitsu pushes his speed to the maximum, striking with blinding force." },
          { name: "Seventh Form: Honoikazuchi no Kami", type: "Ultimate", power: 110, description: "Unleashes a lightning dragon-like attack, embodying thunder’s fury." },
          { name: "Enhanced Hearing Combat Reflex", type: "Passive", power: 0, description: "Uses superhuman hearing to predict enemy movements and react instinctively." }
        ],
        abilities: {
          special: { name: "Lightning Reflex", effect: "Increases dodge chance by 25% when HP drops below 50%." }
        },
        theme: {
          primaryColor: "#fffa65",
          secondaryColor: "#ffb300",
          borderColor: "yellow",
          glowColor: "rgba(255, 255, 0, 0.7)"
        }
      },
      {
        name: "Gyutaro",
        title: "Upper Moon 6",
        universe: "Demon Slayer",
        image: "https://imgs.search.brave.com/FGN7EtFBlpglZnsmugYlMaeDd97-hnFANGJ453MqIj0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/YW5pbWUtcGxhbmV0/LmNvbS9jaGFyYWN0/ZXJzL3ByaW1hcnkv/Z3l1dGFyby0xLTI4/NXg0MDAud2VicD90/PTE2NDI3Mjg4ODA",
        description: "An Upper Rank Six demon of the Twelve Kizuki, Gyutaro wields deadly poisoned blood sickles and an unrelenting hatred for Demon Slayers.",
        stats: { hp: 99, speed: 93, strength: 95, power: 94, poisonPotency: 100 },
        movePool: [
          { name: "Sickle Slash Barrage", type: "Physical", power: 90, description: "Unleashes a rapid flurry of deadly sickle strikes." },
          { name: "Rotating Circular Slashes", type: "Physical", power: 85, description: "Creates rotating arcs of slashes to overwhelm opponents." },
          { name: "Flying Blood Sickles", type: "Ranged", power: 95, description: "Launches blood-infused sickles that slice through enemies at high speed." },
          { name: "Poisoned Blood Sickle Strike", type: "Special", power: 100, description: "A devastating poisoned slash that weakens and damages targets over time." }
        ],
        abilities: {
          special: { name: "Demonic Regeneration", effect: "Heals 10% HP every turn and nullifies poison effects on self." }
        },
        theme: {
          primaryColor: "#004d26",
          secondaryColor: "#007a33",
          borderColor: "#00ff66",
          glowColor: "rgba(0, 255, 128, 0.6)"
        }
      },
      {
        name: "Obanai Iguro",
        title: "Serpent Hashira",
        universe: "Demon Slayer",
        image: "https://i.ebayimg.com/images/g/-igAAeSw5pRoGT9Q/s-l500.jpg",
        description: "The Serpent Hashira of the Demon Slayer Corps, Obanai Iguro uses swift, twisting strikes and serpent-like movements with precision and lethality.",
        stats: { hp: 91, speed: 94, strength: 89, serpentAgility: 96, venomResistance: 92 },
        movePool: [
          { name: "First Form: Winding Serpent Slash", type: "Physical", power: 85, description: "A winding slash mimicking the unpredictable movement of a serpent." },
          { name: "Third Form: Coil of the Serpent", type: "Physical", power: 88, description: "Encircles the target with coiling strikes to restrict their movement." },
          { name: "Fourth Form: Twin-Headed Reptile", type: "Physical", power: 92, description: "A two-directional attack imitating the dual strike of a serpent." },
          { name: "Fifth Form: Slithering Serpent", type: "Special", power: 94, description: "A swift, slithering technique allowing seamless evasion and counterattacks." }
        ],
        abilities: {
          special: { name: "Serpent Reflexes", effect: "Increases dodge rate by 25% and grants immunity to binding effects." }
        },
        theme: {
          primaryColor: "#f5f5f5",
          secondaryColor: "#c8a2ff",
          borderColor: "#b399ff",
          glowColor: "rgba(179, 153, 255, 0.6)"
        }
      },
      {
        name: "Doma",
        title: "Upper Moon 2",
        universe: "Demon Slayer",
        image: "https://wallpapercave.com/wp/wp10836762.jpg",
        description: "The Upper Rank 2 demon of the Twelve Kizuki, Doma wields deadly cryokinesis, freezing everything in his path with ruthless elegance.",
        stats: { hp: 99, speed: 96, strength: 94, iceManipulation: 100, regeneration: 98 },
        movePool: [
          { name: "Frozen Lotus", type: "Special", power: 90, description: "Unleashes icy lotus flowers that freeze anything they touch." },
          { name: "Frozen Cloud", type: "Special", power: 88, description: "Generates a freezing mist to obscure vision and freeze targets." },
          { name: "Lotus Frost Bite", type: "Physical", power: 92, description: "A frost-infused strike that chills opponents to the core." },
          { name: "Devouring Frost", type: "Ultimate", power: 110, description: "A devastating freezing technique that engulfs everything in lethal frost." }
        ],
        abilities: {
          special: { name: "Cryokinesis Mastery", effect: "Immune to cold-based attacks and increases ice attack power by 30%." }
        },
        theme: {
          primaryColor: "#f0f9ff",
          secondaryColor: "#66ccff",
          borderColor: "#80e6ff",
          glowColor: "rgba(150, 220, 255, 0.6)"
        }
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
