/**
 * codeProjects.ts — Predefined Codebase Projects & Mission Briefs
 * 
 * Defines thematic codebases randomly assigned to matches upon start.
 * Each project details the code name, architecture brief, system classification,
 * and module breakdown across the facility rooms.
 */

export interface CodeModule {
  file: string;
  room: string;
  role: string;
  description: string;
}

export interface CodeProject {
  id: string;
  name: string;
  codeName: string;
  system: string;
  category: string;
  securityLevel: string;
  brief: string;
  objective: string;
  modules: CodeModule[];
}

export const CODE_PROJECTS: CodeProject[] = [
  {
    id: 'space-station-core-services',
    name: 'Space Station Core Services',
    codeName: 'PROJECT_ORBITAL_STATION // SECTOR-7',
    system: 'Deep Space Orbital Server Cluster v2.4',
    category: 'ORBITAL MICROSERVICES & LIFE SUPPORT',
    securityLevel: 'CRITICAL • SECURITY CLEARANCE LEVEL-5',
    brief: 'Mission-critical spacecraft microservice cluster providing user authentication, transaction processing, real-time database caching, sorted utility telemetry, and bootstrap lifecycle management.',
    objective: 'Debug corrupted algorithms across the station terminals, eliminate syntax vulnerabilities introduced by the Imposter, and restore global system stability to 100% before orbital decay.',
    modules: [
      {
        file: 'auth.js',
        room: 'AUTH LAB',
        role: 'Session Access Control',
        description: 'Enforces cryptographic JWT authorization headers and prevents credential bypass attacks.',
      },
      {
        file: 'database.js',
        room: 'DATABASE',
        role: 'Telemetry Storage Layer',
        description: 'Maintains low-latency query connection adapters and state synchronization caches.',
      },
      {
        file: 'payment.js',
        room: 'BILLING & CREDITS',
        role: 'Transaction Engine',
        description: 'Processes life-support resource allocations, station credits, and verifies zero-amount exploit checks.',
      },
      {
        file: 'utils.js',
        room: 'UTILITY LAB',
        role: 'Data Stream Sorting',
        description: 'Normalizes raw sensor payloads, cleanses string buffers, and orders diagnostic logs.',
      },
      {
        file: 'app.js',
        room: 'MAINFRAME',
        role: 'Cluster Bootstrapper',
        description: 'Coordinates cluster health checks, microservice discovery, and root mainframe failovers.',
      },
    ],
  },
  {
    id: 'aegis-rover-nav',
    name: 'Autonomous Rover Navigation OS',
    codeName: 'PROJECT_AEGIS_ROVER // VOYAGER-IX',
    system: 'Deep Space Autonomous Robotics Stack v4.1',
    category: 'AUTONOMOUS ROBOTICS & NAVIGATION',
    securityLevel: 'RESTRICTED • MIL-SPEC TELEMETRY',
    brief: 'Planetary exploration rover firmware managing autonomous LiDAR pathfinding, obstacle avoidance heuristics, sensor cache queues, energy transaction pipelines, and robotic drive motors.',
    objective: 'Resolve calculation inverted sorting errors, patch permission escalations, and restore pathing routines before the rover enters the uncharted canyon zone.',
    modules: [
      {
        file: 'auth.js',
        room: 'AUTH LAB',
        role: 'Pilot Remote Key Handshake',
        description: 'Validates biometric remote uplink signatures and restricts unauthorized manual overrides.',
      },
      {
        file: 'database.js',
        room: 'DATABASE',
        role: 'LiDAR Terrain Cache',
        description: 'Stores point-cloud topographical elevation maps and surface obstacle coordinate logs.',
      },
      {
        file: 'payment.js',
        room: 'BILLING & CREDITS',
        role: 'Power Budgeting Core',
        description: 'Calculates watt-hour expenditure limits per motor sub-unit to avoid battery depletion.',
      },
      {
        file: 'utils.js',
        room: 'UTILITY LAB',
        role: 'Waypoint Metric Sorter',
        description: 'Calculates optimal distance vectors and cleanses noisy optical sensor inputs.',
      },
      {
        file: 'app.js',
        room: 'MAINFRAME',
        role: 'Autopilot Kernel Init',
        description: 'Bootstraps navigation micro-kernels and maintains active heartbeat with orbital satellites.',
      },
    ],
  },
  {
    id: 'sentinel-defense-grid',
    name: 'Sentinel Cyber Defense Grid',
    codeName: 'PROJECT_SENTINEL_GRID // NODE-OMEGA',
    system: 'Quantum Perimeter Firewall Matrix v3.8',
    category: 'CYBER SECURITY & DEFENSE PROTOCOLS',
    securityLevel: 'MAXIMUM • QUANTUM DEFENSE DIRECTIVE',
    brief: 'High-throughput perimeter security network protecting orbital command nodes from distributed malware payloads, logic traps, and unauthorized data exfiltration routines.',
    objective: 'Re-align corrupted conditional security gates, fix inverted filtering arrays, and prevent Imposter backdoor scripts from compromising the defensive shield matrix.',
    modules: [
      {
        file: 'auth.js',
        room: 'AUTH LAB',
        role: 'Perimeter Intrusion Gateway',
        description: 'Authenticates inbound encrypted cipher streams and rejects privilege escalation exploits.',
      },
      {
        file: 'database.js',
        room: 'DATABASE',
        role: 'Threat Vector Registry',
        description: 'Indexes real-time anomaly signatures and persists security telemetry to encrypted flash sectors.',
      },
      {
        file: 'payment.js',
        room: 'BILLING & CREDITS',
        role: 'Compute Quota Governor',
        description: 'Manages dynamic bandwidth allocations to throttle hostile brute-force connection floods.',
      },
      {
        file: 'utils.js',
        room: 'UTILITY LAB',
        role: 'Packet Filter & Sanitizer',
        description: 'Strips malicious script injections and sorts firewall rule priorities by threat severity.',
      },
      {
        file: 'app.js',
        room: 'MAINFRAME',
        role: 'Matrix Core Orchestrator',
        description: 'Manages real-time shield re-routing and coordinates system recovery upon security breaches.',
      },
    ],
  },
  {
    id: 'hyperion-propulsion-core',
    name: 'Hyperion Warp Propulsion Engine',
    codeName: 'PROJECT_HYPERION_CORE // TITAN-IV',
    system: 'Sub-Light & Hyperdrive Vector Engine v5.0',
    category: 'QUANTUM PROPULSION & ANTIMATTER RELAYS',
    securityLevel: 'CLASSIFIED • PROPULSION DYNAMICS',
    brief: 'Deep-space propulsion control suite regulating antimatter containment fields, plasma coolant distribution, thruster trajectory vectors, and hyperdrive spool sequencing.',
    objective: 'Repair faulty magnetic flux conditionals, re-enable dead database sensor links, and resolve race conditions before reactor temperature reaches catastrophic critical mass.',
    modules: [
      {
        file: 'auth.js',
        room: 'AUTH LAB',
        role: 'Chief Engineer Lockout',
        description: 'Restricts hyperdrive ignition authority strictly to certified propulsion personnel.',
      },
      {
        file: 'database.js',
        room: 'DATABASE',
        role: 'Plasma Flux Telemetry',
        description: 'Monitors real-time thermal readings across antimatter injectors and coolant manifolds.',
      },
      {
        file: 'payment.js',
        room: 'BILLING & CREDITS',
        role: 'Fuel Consumption Ledger',
        description: 'Regulates fuel canister burn ratios and enforces zero-consumption idle safety thresholds.',
      },
      {
        file: 'utils.js',
        room: 'UTILITY LAB',
        role: 'Vector Calculation Pipeline',
        description: 'Orders warp trajectory coordinate matrices in ascending velocity sequences.',
      },
      {
        file: 'app.js',
        room: 'MAINFRAME',
        role: 'Ignition Sequence Master',
        description: 'Coordinates simultaneous chamber pressurization and triggers hyperspace transition jump.',
      },
    ],
  },
  {
    id: 'eden-life-support',
    name: 'Eden Hydroponic Life Matrix',
    codeName: 'PROJECT_EDEN_BIOS // HABITAT-ALPHA',
    system: 'Closed-Loop Bio-Regenerative Habitat v2.9',
    category: 'BIOSYHERE & LIFE SUPPORT SYSTEMS',
    securityLevel: 'HIGH • HABITAT SURVIVAL ESSENTIAL',
    brief: 'Autonomous environmental life support regulating atmospheric O2/CO2 scrubbing, atmospheric barometric pressure, nutrient recycling, water purification, and bio-dome illumination cycles.',
    objective: 'Eliminate logic anomalies in scrubber thresholds, reconnect environmental monitoring databases, and deploy the survival patch before habitat air quality deteriorates.',
    modules: [
      {
        file: 'auth.js',
        room: 'AUTH LAB',
        role: 'Bio-Safety Door Controls',
        description: 'Secures contaminated quarantine airlocks and validates medical decontamination passes.',
      },
      {
        file: 'database.js',
        room: 'DATABASE',
        role: 'Atmospheric Sensor Vault',
        description: 'Tracks oxygen PPM levels and logs humidity deviations across all habitat sectors.',
      },
      {
        file: 'payment.js',
        room: 'BILLING & CREDITS',
        role: 'Water & Ration Dispenser',
        description: 'Monitors daily nutrient rations and prevents unauthorized reservoir drain requests.',
      },
      {
        file: 'utils.js',
        room: 'UTILITY LAB',
        role: 'Air Filtration Sorter',
        description: 'Prioritizes scrub cycle queues and normalizes carbon dioxide sensor readings.',
      },
      {
        file: 'app.js',
        room: 'MAINFRAME',
        role: 'Bio-Dome Ecosystem Root',
        description: 'Executes sunrise simulation sequences and orchestrates emergency oxygen rerouting.',
      },
    ],
  },
];

export const DEFAULT_CODE_PROJECT: CodeProject = CODE_PROJECTS[0];

export function getRandomCodeProject(): CodeProject {
  const index = Math.floor(Math.random() * CODE_PROJECTS.length);
  return CODE_PROJECTS[index] || DEFAULT_CODE_PROJECT;
}

export function getCodeProjectById(id: string): CodeProject {
  return CODE_PROJECTS.find((p) => p.id === id) || DEFAULT_CODE_PROJECT;
}
