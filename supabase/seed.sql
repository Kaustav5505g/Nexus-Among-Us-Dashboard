-- ==============================================================================
-- NEXUS Among Us: Coded Chaos & Tech Mystery
-- Seed Data for Station Tasks, Mystery Dossiers, Facilitators & Squads
-- ==============================================================================

-- 1. SEED OFFICIAL ADMIN FACILITATOR CREDENTIALS (Stored in Database)
INSERT INTO public.admin_users (id, facilitator_id, username, name, email, role, password, poc_room, title)
VALUES
    (
        'a0000000-0000-0000-0000-000000000001',
        'NX-SUPER-01',
        'nx-super-01',
        'Tejas Narula',
        'tejas@nexus.org',
        'super_admin',
        'master2026',
        NULL,
        'Lead Operations Facilitator (Super Admin)'
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        'NX-ADMIN-02',
        'nx-admin-02',
        'Aarav Sharma',
        'aarav@nexus.org',
        'admin',
        'admin2026',
        NULL,
        'Station Operations Admin'
    ),
    (
        'a0000000-0000-0000-0000-000000000003',
        'NX-POC-03',
        'nx-poc-03',
        'Zoya Khan',
        'zoya@nexus.org',
        'moderator',
        'poc2026',
        'Reactor',
        'Field Moderator & Reactor Sector POC'
    )
ON CONFLICT (username) DO UPDATE SET
    facilitator_id = EXCLUDED.facilitator_id,
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    password = EXCLUDED.password,
    poc_room = EXCLUDED.poc_room,
    title = EXCLUDED.title;

-- 2. SEED PRIMARY EVENT MASTER CONTROLS
INSERT INTO public.event_controls (id, status, impostor_powers_active, elapsed_seconds, current_round, active_sabotage, emergency_active)
VALUES
    ('primary_match', 'running', true, 1420, 1, NULL, false)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    impostor_powers_active = EXCLUDED.impostor_powers_active;

-- 3. SEED INITIAL AMONG US STATION TASKS
INSERT INTO public.station_tasks (id, title, room, description, snippet, clue_hint, flag_answer, points, status)
VALUES
    ('task-elec-01', 'Fix Circuit Breakers & Logic Gate', 'Electrical', 'Resolve the asynchronous race condition in the primary breaker module to stabilize lighting grid.', 'async function restorePower() {\n  await resetBreaker(0x7F);\n  return true;\n}', 'Check bitwise mask 0x7F against breaker switch array #4.', 'FLAG_VOLTAGE_NOMINAL', 100, 'pending'),
    ('task-elec-02', 'Divert Aux Power to Shields', 'Electrical', 'Reroute high-draw conduits from non-essential galley heaters to external magnetic deflection deflectors.', 'reroute(powerGrid.galley, powerGrid.deflectors, 85);', 'Flip auxiliary relays 3 and 7 on the central electrical chassis.', 'FLAG_AUX_SHIELDS_ONLINE', 120, 'pending'),
    ('task-react-01', 'Quantum Core Synchronization', 'Reactor', 'Calibrate harmonic resonance between upper and lower quantum flux manifolds to prevent thermal runaway.', 'const resonance = Math.sqrt(fluxA * fluxB) / 2.718;', 'Match frequencies to Euler harmonic ratio (e = 2.718).', 'FLAG_CORE_SYNCHRONIZED', 150, 'pending'),
    ('task-react-02', 'Unlock Primary Manifolds', 'Reactor', 'Input sequence 1-10 on numeric matrix keypad in ascending prime order.', 'keypad.enterSequence([2, 3, 5, 7]);', 'Only enter the prime values strictly under 10.', 'FLAG_MANIFOLD_UNLOCKED', 110, 'pending'),
    ('task-med-01', 'DNA Sample Scan & Cipher Match', 'MedBay', 'Deconvolve the synthetic nucleotide sequence left on the biometric scanner.', 'MATCH // ATCG-9921-X // PATIENT CLASSIFIED', 'Look for adenine-thymine base inversion in strand 3.', 'FLAG_DNA_DECONVOLVED', 120, 'pending'),
    ('task-med-02', 'Inspect Biometric Diagnostic Bed', 'MedBay', 'Run complete 60-second diagnostic cycle on station biometric pod alpha.', 'scanner.runDiagnostics({ target: "player_biometrics", depth: "cellular" });', 'Ensure the player remains standing on the green sensor plate.', 'FLAG_DIAGNOSTICS_CLEAR', 90, 'pending'),
    ('task-nav-01', 'Chart Sublight Trajectory Coordinates', 'Navigation', 'Plot shortest vector path through asteroid belt sector 7G avoid collision corridors.', 'dijkstra(starMap, "Skeld", "NexusHub");', 'Compute path weight using shortest distance node Dijkstra.', 'FLAG_NAV_VECTOR_LOCKED', 110, 'pending'),
    ('task-nav-02', 'Stabilize Steering Gyroscope', 'Navigation', 'Align crosshairs over the pulsating telemetry beacon until drift reaches zero.', 'gyro.calibrate({ pitch: 0.00, yaw: 0.00, roll: 0.00 });', 'Hold cursor within 2-pixel tolerance for 3 continuous seconds.', 'FLAG_GYRO_STABILIZED', 100, 'pending'),
    ('task-admin-01', 'Swipe Holographic ID Card', 'Admin', 'Calibrate card swipe duration between 0.8s and 1.2s without speed jitter.', 'AUTH PROTOCOL: SWIPE_SPEED = 0.94s [ACCEPTED]', 'A steady medium swipe yields green pass verification.', 'FLAG_CARD_VERIFIED', 80, 'pending'),
    ('task-admin-02', 'Upload Biometric Route Logs', 'Admin', 'Transmit local Skeld sector routing records to planetary command downlink.', 'transferFile("route_logs.tar.gz", "downlink://ground-control");', 'Do not close the transfer dialog before packet 100/100.', 'FLAG_ROUTE_LOGS_UPLOADED', 100, 'pending'),
    ('task-o2-01', 'Clean Atmospheric Filter Canister', 'O2', 'Purge scrubbed carbon particulate from manifold B secondary bypass chamber.', 'SCRUB_O2_PRESSURE = 101.3 kPa [NOMINAL]', 'Drag 6 discarded leaves into the waste ejection chute.', 'FLAG_O2_SCRUBBER_CLEAN', 90, 'pending'),
    ('task-o2-02', 'Empty Waste Ejection Chute', 'O2', 'Pull down pneumatic lever for 3 seconds to expel non-recyclable canister debris.', 'chute.release(PNEUMATIC_VALVE_MAX);', 'Hold handle firmly until audio hiss completes.', 'FLAG_CHUTE_EXPELLED', 90, 'pending'),
    ('task-weap-01', 'Target Calibration & Meteor Deflection', 'Weapons', 'Calculate lead firing angle for approaching orbital debris traveling at 0.15c.', 'trajectory = leadTarget(debrisVector, 0.15);', 'Destroy 20 asteroid obstacles using laser battery turrets.', 'FLAG_METEORS_DEFLECTED', 130, 'pending'),
    ('task-comms-01', 'Descramble Transmission Beacon', 'Communications', 'Tune bandpass filter to 1420.405 MHz to eliminate foreign carrier hum.', 'radio.frequency = 1420.405; // Hydrogen Line', 'Rotate tuning knob until frequency display locks in solid green.', 'FLAG_COMMS_CLEARED', 100, 'pending'),
    ('task-cafe-01', 'Emergency Fuel Pod Balancing', 'Cafeteria', 'Equalize gravity ballast chambers 1 and 2 to stabilize dining deck orbital trim.', 'ballast.balance(50, 50);', 'Calibrate fuel gauge pointers to exact 50-50 parity.', 'FLAG_BALLAST_BALANCED', 100, 'pending')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    room = EXCLUDED.room,
    description = EXCLUDED.description,
    snippet = EXCLUDED.snippet,
    clue_hint = EXCLUDED.clue_hint,
    flag_answer = EXCLUDED.flag_answer,
    points = EXCLUDED.points;

-- 4. SEED TECH MYSTERY CASE DOSSIERS
INSERT INTO public.mystery_clues (id, case_file, title, difficulty, location, description, puzzle_content, hint, flag_hash, points)
VALUES
    ('clue-01', 'DOSSIER #01: THE GHOST IN ELECTRICAL', 'The Inverted Binary Log', 'Novice', 'Electrical Main Panel', 'A shredded flash drive recovered near the breaker has a raw inverted byte stream. Decode the embedded ASCII token.', '01001110 01000101 01011000 01010101 01010011 01011111 01000011 01001000 01000001 01001111 01010011', 'Convert binary 8-bit bytes to standard ASCII characters.', 'NEXUS_CHAOS', 250),
    ('clue-02', 'DOSSIER #02: MEDBAY METADATA', 'The Caesar Shift of Patient Zero', 'Investigator', 'MedBay Quarantine Bio-Terminal', 'The autopsy report timestamp was encrypted with a classic cryptographic rotation (ROT-13). Decipher the infected compartment name.', 'GUR_VZCBFGBE_VF_VAFVQR_GRPABYBTl', 'Rotate every Latin letter forward or backward by 13 positions.', 'THE_IMPOSTOR_IS_INSIDE_TECHNOLOGY', 350),
    ('clue-03', 'DOSSIER #03: NAVIGATION HEX TRAIL', 'The Quantum Coordinates Hex Dump', 'Cyber Detective', 'Navigation Sub-console', 'Steering telemetry was overridden. The intruder left a hexadecimal signature pointing to their secret communication channel.', '4e 45 58 55 53 5f 52 45 44 5f 53 55 53', 'Hexadecimal to ASCII decoder. Look for color markers.', 'NEXUS_RED_SUS', 500),
    ('clue-04', 'DOSSIER #04: THE REACTOR KEYCARD', 'Base64 Memory Leak', 'Investigator', 'Lower Reactor Access Shaft', 'An intercepted packet during reactor stabilization contained an obfuscated payload string.', 'Q09ERURfQ0hBT1NfV0lOTkVS', 'RFC 4648 Base64 decoding reveals the victory token.', 'CODED_CHAOS_WINNER', 300),
    ('clue-05', 'DOSSIER #05: O2 SCRUBBER WHISPER', 'Vigenere Cipher Over Airwaves', 'Cyber Detective', 'Oxygen Scrubber Manifold C', 'Sub-atmospheric frequency recorded repeating harmonic hum modulated with key "SKELD".', 'VWV_UKVE_WYS_JAZU', 'Vigenere decipher using passphrase "SKELD".', 'THE_CORE_HAS_FALLEN', 450)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    case_file = EXCLUDED.case_file,
    difficulty = EXCLUDED.difficulty,
    location = EXCLUDED.location,
    description = EXCLUDED.description,
    puzzle_content = EXCLUDED.puzzle_content,
    hint = EXCLUDED.hint,
    flag_hash = EXCLUDED.flag_hash,
    points = EXCLUDED.points;

-- 5. SEED INITIAL SQUADS
INSERT INTO public.teams (id, name, leader_name, email, phone, members, color, score, tasks_completed, clues_solved, status, badge_code, assigned_room, is_impostor, impostor_player_name)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Cyber Phantoms', 'Arjun Verma', 'arjun@nexus.org', '9876543210', '["Arjun Verma", "Priya Singh", "Rohan Mehta", "Ananya Roy"]'::jsonb, '#00F0FF', 1850, 14, 3, 'active', 'NX-7841', 'Electrical', true, 'Rohan Mehta'),
    ('b0000000-0000-0000-0000-000000000002', 'Quantum Breakers', 'Sara Chen', 'sara@nexus.org', '9876543211', '["Sara Chen", "Dev Patel", "Meera Joshi"]'::jsonb, '#7000FF', 1620, 11, 2, 'active', 'NX-9923', 'Reactor', false, NULL),
    ('b0000000-0000-0000-0000-000000000003', 'Binary Raiders', 'Kabir Sen', 'kabir@nexus.org', '9876543212', '["Kabir Sen", "Tara Alvi", "Karan Kapoor", "Simran Kaur"]'::jsonb, '#FF0055', 1490, 9, 2, 'active', 'NX-3312', 'MedBay', false, NULL),
    ('b0000000-0000-0000-0000-000000000004', 'Glitch Mob', 'Nikhil Rao', 'nikhil@nexus.org', '9876543213', '["Nikhil Rao", "Sneha Nair", "Aakash Gupta"]'::jsonb, '#FFE600', 1380, 8, 1, 'active', 'NX-6654', 'Navigation', true, 'Sneha Nair'),
    ('b0000000-0000-0000-0000-000000000005', 'Null Pointers', 'Farhan Zaidi', 'farhan@nexus.org', '9876543214', '["Farhan Zaidi", "Ishaan Malhotra", "Rhea Pillai"]'::jsonb, '#00FF66', 1210, 7, 1, 'active', 'NX-1149', 'Admin', false, NULL),
    ('b0000000-0000-0000-0000-000000000006', 'Zero Day Ops', 'Aditi Deshmukh', 'aditi@nexus.org', '9876543215', '["Aditi Deshmukh", "Vikram Rathore", "Kavya Menon"]'::jsonb, '#FF6600', 1050, 6, 1, 'active', 'NX-5521', 'Weapons', false, NULL)
ON CONFLICT (name) DO UPDATE SET
    leader_name = EXCLUDED.leader_name,
    score = EXCLUDED.score,
    assigned_room = EXCLUDED.assigned_room,
    is_impostor = EXCLUDED.is_impostor,
    impostor_player_name = EXCLUDED.impostor_player_name;

-- 6. SYSTEM INITIAL LOG
INSERT INTO public.activity_logs (type, message, severity)
VALUES ('system', 'NEXUS Skeld Station Database online. Master schemas and realtime replication ready.', 'info');
