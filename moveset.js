// ============================================================
// MOVE SET — CHARACTER ANIMATIONS & FRAME DATA
// ============================================================
// Every move is defined with frame data: startup, active, recovery.
// At 60 FPS this maps cleanly to seconds (e.g. 12 frames = 200ms).
//
// Frame phases:
//   startup  — wind-up, can't hit or be interrupted yet
//   active   — hitbox is live, can connect
//   recovery — cooldown, vulnerable if whiffed
//
// Each move carries `animKey` which maps to your sprite/animation system.
// ============================================================

export const MoveCategory = {
  NORMAL: "normal",
  SPECIAL: "special",
  SUPER: "super",
  MOVEMENT: "movement",
  DEFENSIVE: "defensive",
};

// ----------------------------------------------------------
// MOVE TEMPLATE
// ----------------------------------------------------------
// This is the shape every move follows. Extend or trim as needed.
export const moveTemplate = {
  id: "",              // unique slug
  name: "",            // display name
  category: "",        // MoveCategory
  animKey: "",         // key into your animation atlas
  input: [],           // e.g. ["d", "df", "f", "P"] — quarter-circle motions
  damage: 0,           // raw damage on hit
  chipDamage: 0,       // damage dealt if blocked (defaults to 20% of damage)
  knockback: 0,        // pushback force on hit
  launch: false,       // does it pop the opponent into the air (juggle starter)?
  // --- Frame data ---
  startup: 0,          // frames before hitbox activates
  active: 0,           // frames hitbox is live
  recovery: 0,         // frames before returning to idle
  hitstun: 0,          // frames opponent is stunned on hit
  blockstun: 0,        // frames opponent is stunned on block
  // --- Meter ---
  meterCost: 0,        // super meter consumed (0 for normals)
  meterGain: 0,        // super meter gained on hit
  // --- Conditions ---
  airborne: false,     // can this move be used in the air?
  crouchOnly: false,   // must be crouching to execute
  counterable: true,    // can this be interrupted during startup?
  // --- Hit/Block spark FX ---
  hitFx: "hit_light",  // visual effect key on hit
  blockFx: "block",    // visual effect key on block
  hitSound: "punch_hit",
  blockSound: "block_hit",
  whiffSound: "whoosh",
};

// ----------------------------------------------------------
// FULL MOVE SET
// ----------------------------------------------------------

export const MOVES = [
  // ====--- LIGHT ATTACKS (fast, low damage, combo starters) ---====
  {
    id: "jab",
    name: "Jab",
    category: MoveCategory.NORMAL,
    animKey: "jab_anim",
    input: ["LP"],
    damage: 4,
    knockback: 1,
    startup: 4,
    active: 3,
    recovery: 6,
    hitstun: 14,
    blockstun: 10,
    meterGain: 2,
    hitFx: "hit_light",
    hitSound: "punch_light",
    whiffSound: "whoosh_light",
  },
  {
    id: "low_kick",
    name: "Low Kick",
    category: MoveCategory.NORMAL,
    animKey: "low_kick_anim",
    input: ["LK"],
    damage: 6,
    knockback: 2,
    startup: 7,
    active: 4,
    recovery: 10,
    hitstun: 16,
    blockstun: 12,
    meterGain: 3,
    crouchOnly: false,
    hitFx: "hit_light",
    hitSound: "kick_light",
  },
  {
    id: "standing_kick",
    name: "Standing Kick",
    category: MoveCategory.NORMAL,
    animKey: "standing_kick_anim",
    input: ["HK"],
    damage: 8,
    knockback: 4,
    startup: 9,
    active: 4,
    recovery: 14,
    hitstun: 18,
    blockstun: 14,
    meterGain: 4,
    hitFx: "hit_medium",
    hitSound: "kick_medium",
  },

  // ====--- HEAVY ATTACKS (slow, high damage, combo finishers) ---====
  {
    id: "uppercut",
    name: "Dragon Uppercut",
    category: MoveCategory.NORMAL,
    animKey: "uppercut_anim",
    input: ["d", "HP"],
    damage: 14,
    knockback: 8,
    launch: true,         // pops opponent up — juggle window opens
    startup: 6,
    active: 5,
    recovery: 28,
    hitstun: 30,
    blockstun: 16,
    meterGain: 6,
    counterable: false,   // invincible-ish startup (DP-like)
    hitFx: "hit_heavy",
    hitSound: "uppercut_hit",
  },
  {
    id: "roundhouse",
    name: "Roundhouse Kick",
    category: MoveCategory.NORMAL,
    animKey: "roundhouse_anim",
    input: ["f", "HK"],
    damage: 12,
    knockback: 10,
    startup: 12,
    active: 5,
    recovery: 22,
    hitstun: 24,
    blockstun: 18,
    meterGain: 5,
    hitFx: "hit_heavy",
    hitSound: "roundhouse_hit",
  },
  {
    id: "overhead",
    name: "Overhead Smash",
    category: MoveCategory.NORMAL,
    animKey: "overhead_anim",
    input: ["f", "HP"],
    damage: 10,
    knockback: 6,
    startup: 16,
    active: 4,
    recovery: 20,
    hitstun: 20,
    blockstun: 14,
    meterGain: 4,
    hitFx: "hit_medium",
    hitSound: "overhead_hit",
    // Note: overheads must be blocked standing — defeats crouch blockers
  },

  // ====--- SPECIAL MOVES (require motion inputs, cost meter or have cooldown) ---====
  {
    id: "fireball",
    name: "Plasma Bolt",
    category: MoveCategory.SPECIAL,
    animKey: "fireball_anim",
    input: ["d", "df", "f", "P"],
    damage: 8,
    knockback: 5,
    startup: 14,
    active: 0,          // projectile spawned at end of startup
    recovery: 24,
    hitstun: 18,
    blockstun: 14,
    meterGain: 4,
    hitFx: "fireball_explode",
    hitSound: "fireball_shoot",
  },
  {
    id: "dp_uppercut",
    name: "Rising Dragon",
    category: MoveCategory.SPECIAL,
    animKey: "dp_uppercut_anim",
    input: ["f", "d", "df", "P"],
    damage: 16,
    knockback: 10,
    launch: true,
    startup: 4,
    active: 8,
    recovery: 32,
    hitstun: 32,
    blockstun: 18,
    meterGain: 5,
    counterable: false,
    hitFx: "hit_special",
    hitSound: "dp_hit",
  },
  {
    id: "spin_kick",
    name: "Hurricane Spin",
    category: MoveCategory.SPECIAL,
    animKey: "spin_kick_anim",
    input: ["d", "db", "b", "K"],
    damage: 12,
    knockback: 8,
    startup: 10,
    active: 12,
    recovery: 20,
    hitstun: 22,
    blockstun: 16,
    meterGain: 4,
    airborne: true,
    hitFx: "hit_special",
    hitSound: "spin_kick_hit",
  },
  {
    id: "command_grab",
    name: "Suplex Slam",
    category: MoveCategory.SPECIAL,
    animKey: "command_grab_anim",
    input: ["d", "db", "b", "P"],
    damage: 18,
    knockback: 14,
    startup: 8,
    active: 3,
    recovery: 30,
    hitstun: 40,
    blockstun: 0,       // grabs can't be blocked — must be avoided
    meterGain: 6,
    counterable: true,
    hitFx: "grab_slam",
    hitSound: "slam_hit",
  },

  // ====--- SUPER MOVE (requires full meter, big damage, cinematic) ---====
  {
    id: "super_combo",
    name: "Final Barrage",
    category: MoveCategory.SUPER,
    animKey: "super_combo_anim",
    input: ["d", "df", "f", "d", "df", "f", "P"],
    damage: 32,
    knockback: 20,
    launch: true,
    startup: 8,
    active: 30,          // long cinematic multi-hit sequence
    recovery: 40,
    hitstun: 60,
    blockstun: 20,
    meterCost: 100,      // requires full super meter
    meterGain: 0,
    counterable: false,
    hitFx: "super_flash",
    hitSound: "super_combo_hit",
  },

  // ====--- MOVEMENT OPTIONS ---====
  {
    id: "walk_fwd",
    name: "Walk Forward",
    category: MoveCategory.MOVEMENT,
    animKey: "walk_fwd_anim",
    input: ["f"],
    damage: 0,
    startup: 0,
    active: 0,
    recovery: 0,
    hitstun: 0,
    blockstun: 0,
    meterGain: 0,
  },
  {
    id: "walk_back",
    name: "Walk Back",
    category: MoveCategory.MOVEMENT,
    animKey: "walk_back_anim",
    input: ["b"],
    damage: 0,
    startup: 0,
    active: 0,
    recovery: 0,
    hitstun: 0,
    blockstun: 0,
    meterGain: 0,
  },
  {
    id: "dash_fwd",
    name: "Forward Dash",
    category: MoveCategory.MOVEMENT,
    animKey: "dash_fwd_anim",
    input: ["f", "f"],
    damage: 0,
    startup: 4,
    active: 12,
    recovery: 8,
    hitstun: 0,
    blockstun: 0,
    meterGain: 0,
  },
  {
    id: "jump",
    name: "Jump",
    category: MoveCategory.MOVEMENT,
    animKey: "jump_anim",
    input: ["u"],
    damage: 0,
    startup: 4,
    active: 0,
    recovery: 0,
    hitstun: 0,
    blockstun: 0,
    meterGain: 0,
    airborne: true,
  },
  {
    id: "air_dash",
    name: "Air Dash",
    category: MoveCategory.MOVEMENT,
    animKey: "air_dash_anim",
    input: ["u", "f", "f"],
    damage: 0,
    startup: 6,
    active: 10,
    recovery: 8,
    hitstun: 0,
    blockstun: 0,
    meterGain: 0,
    airborne: true,
  },

  // ====--- DEFENSIVE OPTIONS ---====
  {
    id: "block_high",
    name: "High Block",
    category: MoveCategory.DEFENSIVE,
    animKey: "block_high_anim",
    input: ["b"],
    damage: 0,
    startup: 0,
    active: 0,
    recovery: 0,
    hitstun: 0,
    blockstun: 0,
    meterGain: 1,
  },
  {
    id: "crouch_block",
    name: "Crouch Block",
    category: MoveCategory.DEFENSIVE,
    animKey: "crouch_block_anim",
    input: ["db"],
    damage: 0,
    startup: 0,
    active: 0,
    recovery: 0,
    hitstun: 0,
    blockstun: 0,
    meterGain: 1,
    crouchOnly: true,
  },
  {
    id: "tech_throw",
    name: "Throw Tech",
    category: MoveCategory.DEFENSIVE,
    animKey: "tech_anim",
    input: ["LP", "LK"],
    damage: 0,
    startup: 3,
    active: 4,
    recovery: 12,
    hitstun: 0,
    blockstun: 0,
    meterGain: 2,
    // Must be pressed within 7-frame window when grabbed
  },
  {
    id: "roll_recovery",
    name: "Quick Recovery",
    category: MoveCategory.DEFENSIVE,
    animKey: "quick_recovery_anim",
    input: ["d", "d"],
    damage: 0,
    startup: 2,
    active: 0,
    recovery: 14,
    hitstun: 0,
    blockstun: 0,
    meterGain: 0,
    // Used when knocked down — input timing window: 1-15 frames after hitting ground
  },
];

// ============================================================
// MOVE EXECUTION SYSTEM
// ============================================================
// Handles starting a move, ticking through its frames, and
// determining hitbox timing.

export class MoveExecutor {
  constructor(fighter) {
    this.fighter = fighter;
    this.activeMove = null;
    this.frame = 0;
    this.phase = "idle";   // idle | startup | active | recovery | done
    this.hasHit = false;   // prevent multi-hit on single active window
  }

  /**
   * Attempt to start a move. Returns true if it began.
   */
  start(move) {
    // Can't act during hitstun, blockstun, or another move
    if (this.fighter.hitStun > 0 || this.fighter.blockStun > 0) return false;
    if (this.phase !== "idle" && this.phase !== "done") return false;

    // Check meter cost
    if (move.meterCost > 0) {
      if (!this.fighter.spendMeter(move.meterCost)) return false;
    }

    // Check conditions
    if (move.crouchOnly && this.fighter.state !== "crouching") return false;
    if (move.airborne && this.fighter.state !== "jumping") return false;
    if (!move.airborne && this.fighter.state === "jumping") {
      // Can't do grounded moves in air
      if (!move.input.includes("u")) return false;
    }

    this.activeMove = move;
    this.frame = 0;
    this.phase = "startup";
    this.hasHit = false;
    this.fighter.state = "attacking";
    this.fighter.currentMove = move.id;

    // Play whiff/startup sound
    return true;
  }

  /**
   * Advance the move by one frame. Returns the phase info for
   * the game loop to check hitboxes, play sounds, etc.
   */
  tick() {
    if (!this.activeMove) return { phase: "idle" };

    const move = this.activeMove;
    this.frame++;

    // --- Phase transitions ---
    if (this.phase === "startup" && this.frame > move.startup) {
      this.phase = "active";
      this.frame = 0;
    } else if (this.phase === "active" && this.frame > move.active) {
      this.phase = "recovery";
      this.frame = 0;
    } else if (this.phase === "recovery" && this.frame > move.recovery) {
      this.phase = "done";
    }

    if (this.phase === "done") {
      this.end();
      return { phase: "idle" };
    }

    return {
      phase: this.phase,
      frame: this.frame,
      move: move,
      hitboxActive: this.phase === "active" && !this.hasHit,
      moveId: move.id,
    };
  }

  /**
   * Mark that the active hitbox connected (prevents multi-hit).
   */
  registerHit() {
    this.hasHit = true;
  }

  /**
   * End the current move and return to idle.
   */
  end() {
    this.activeMove = null;
    this.frame = 0;
    this.phase = "idle";
    this.hasHit = false;
    this.fighter.currentMove = null;
    if (this.fighter.alive) this.fighter.state = "idle";
  }

  /**
   * Cancel the current move (e.g., hit-confirm into special).
   * Called when a move is cancelled into another.
   */
  cancel() {
    this.end();
  }

  /**
   * Is the fighter currently in a cancellable recovery frame?
   * (Used for special-cancel combos)
   */
  isCancellable() {
    return (
      this.activeMove &&
      this.phase === "active" &&
      this.hasHit === true
    );
  }
}

// ============================================================
// INPUT BUFFER
// ============================================================
// Stores recent inputs so motion commands are detected even if
// the player presses buttons slightly out of frame-perfect timing.

export class InputBuffer {
  constructor(window = 10) {
    this.window = window;     // frames of input history to keep
    this.inputs = [];         // [{ input, frame, held }]
    this.frameCount = 0;
  }

  /** Add an input press to the buffer. */
  press(input) {
    this.inputs.push({ input, frame: this.frameCount, held: true });
  }

  /** Mark an input as released. */
  release(input) {
    const entry = [...this.inputs].reverse().find(i => i.input === input && i.held);
    if (entry) entry.held = false;
  }

  /** Advance by one frame and prune old entries. */
  tick() {
    this.frameCount++;
    this.inputs = this.inputs.filter(
      i => this.frameCount - i.frame <= this.window
    );
  }

  /**
   * Check if a motion input sequence was performed within the buffer window.
   * @param {string[]} sequence - e.g. ["d", "df", "f", "P"]
   * @returns {boolean}
   */
  matches(sequence) {
    const recent = this.inputs.filter(
      i => this.frameCount - i.frame <= this.window
    );

    let seqIndex = 0;
    for (const entry of recent) {
      if (entry.input === sequence[seqIndex]) {
        seqIndex++;
        if (seqIndex === sequence.length) return true;
      }
    }
    return false;
  }

  clear() {
    this.inputs = [];
  }
}
