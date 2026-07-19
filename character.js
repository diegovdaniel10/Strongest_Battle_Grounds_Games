// ============================================================
// CHARACTER & HEALTH BAR LOGIC
// ============================================================
// Core character class with health management, damage handling,
// blocking, and round/win state tracking.
// ============================================================

const MAX_HEALTH = 100;
const MAX_SUPER_METER = 100;
const BLOCK_DAMAGE_MULTIPLIER = 0.2;   // chip damage when blocking
const CHIP_MIN = 1;                      // minimum chip damage
const HEALTH_REGEN_RATE = 0;            // set > 0 for regen mode

export class Fighter {
  constructor(config) {
    // --- Identity ---
    this.name = config.name ?? "Fighter";
    this.color = config.color ?? "#ef4444";

    // --- Vitals ---
    this.maxHealth = MAX_HEALTH;
    this.health = MAX_HEALTH;
    this.maxSuper = MAX_SUPER_METER;
    this.superMeter = 0;

    // --- State ---
    this.state = "idle";        // idle | walking | jumping | crouching | attacking | blocking | hit | knocked_down
    this.facing = config.facing ?? 1;  // 1 = right, -1 = left
    this.isBlocking = false;
    this.invulnerable = false;
    this.alive = true;

    // --- Combat flags ---
    this.currentMove = null;
    this.moveFrame = 0;          // current frame within active move
    this.comboCount = 0;
    this.comboTimer = 0;
    this.hitStun = 0;            // frames of hitstun remaining
    this.blockStun = 0;          // frames of blockstun remaining

    // --- Round tracking ---
    this.roundsWon = 0;
  }

  // ----------------------------------------------------------
  // HEALTH OPERATIONS
  // ----------------------------------------------------------

  /**
   * Apply damage to the fighter.
   * @param {number} rawDamage - The full, unmitigated damage value
   * @param {object} options - { chip: bool, buildMeter: bool }
   * @returns {object} result summary { damageDealt, wasBlocked, killed }
   */
  takeDamage(rawDamage, options = {}) {
    if (!this.alive || this.invulnerable) {
      return { damageDealt: 0, wasBlocked: false, killed: false };
    }

    const { chip = false } = options;
    let actualDamage = rawDamage;

    // --- Block mitigation ---
    if (this.isBlocking && !chip) {
      actualDamage = Math.max(
        Math.floor(rawDamage * BLOCK_DAMAGE_MULTIPLIER),
        CHIP_MIN
      );
      this.blockStun = Math.max(this.blockStun, 12); // ~200ms at 60fps
      this._buildMeter(actualDamage * 0.5);
      return { damageDealt: actualDamage, wasBlocked: true, killed: false };
    }

    // --- Hit ---
    this.health = Math.max(0, this.health - actualDamage);
    this.hitStun = Math.max(this.hitStun, 20);
    this.comboCount += 1;
    this.comboTimer = 60; // 1-second window to continue combo
    this.state = "hit";

    // Build super meter from taking damage
    this._buildMeter(actualDamage * 0.3);

    if (this.health <= 0) {
      this.alive = false;
      this.state = "knocked_down";
      return { damageDealt: actualDamage, wasBlocked: false, killed: true };
    }

    return { damageDealt: actualDamage, wasBlocked: false, killed: false };
  }

  /**
   * Heal the fighter (if your game supports healing pickups/super).
   */
  heal(amount) {
    if (!this.alive) return;
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  /**
   * Regenerate a small amount of health per frame (optional mode).
   * Call this every frame in your game loop.
   */
  tickRegen() {
    if (HEALTH_REGEN_RATE > 0 && this.alive && this.state === "idle") {
      this.health = Math.min(this.maxHealth, this.health + HEALTH_REGEN_RATE);
    }
  }

  // ----------------------------------------------------------
  // SUPER METER
  // ----------------------------------------------------------

  _buildMeter(amount) {
    this.superMeter = Math.min(this.maxSuper, this.superMeter + amount);
  }

  spendMeter(amount) {
    if (this.superMeter >= amount) {
      this.superMeter -= amount;
      return true;
    }
    return false;
  }

  // ----------------------------------------------------------
  // COMBO SYSTEM
  // ----------------------------------------------------------

  tickCombo() {
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }
    if (this.hitStun > 0) this.hitStun--;
    if (this.blockStun > 0) this.blockStun--;
  }

  resetCombo() {
    this.comboCount = 0;
    this.comboTimer = 0;
  }

  // ----------------------------------------------------------
  // BLOCKING
  // ----------------------------------------------------------

  startBlock() {
    if (this.state === "attacking" || this.state === "knocked_down") return;
    this.isBlocking = true;
    if (this.state !== "hit") this.state = "blocking";
  }

  stopBlock() {
    this.isBlocking = false;
    if (this.state === "blocking") this.state = "idle";
  }

  // ----------------------------------------------------------
  // ROUND / MATCH
  // ----------------------------------------------------------

  winRound() {
    this.roundsWon++;
  }

  resetForRound() {
    this.health = this.maxHealth;
    this.superMeter = Math.floor(this.superMeter * 0.5); // carry half meter
    this.state = "idle";
    this.isBlocking = false;
    this.invulnerable = false;
    this.currentMove = null;
    this.moveFrame = 0;
    this.hitStun = 0;
    this.blockStun = 0;
    this.resetCombo();
  }

  // ----------------------------------------------------------
  // HEALTH BAR DATA (for rendering)
  // ----------------------------------------------------------

  getHealthBarData() {
    return {
      name: this.name,
      color: this.color,
      current: this.health,
      max: this.maxHealth,
      percentage: (this.health / this.maxHealth) * 100,
      isLow: this.health <= this.maxHealth * 0.25,
      isCritical: this.health <= this.maxHealth * 0.10,
      super: this.superMeter,
      superMax: this.maxSuper,
      superFull: this.superMeter >= this.maxSuper,
    };
  }
}

// ============================================================
// HEALTH BAR RENDERER (Canvas)
// ============================================================

export class HealthBarRenderer {
  constructor(ctx, options = {}) {
    this.ctx = ctx;
    this.barWidth = options.barWidth ?? 300;
    this.barHeight = options.barHeight ?? 20;
    this.borderColor = options.borderColor ?? "#ffffff";
    this.lowColor = options.lowColor ?? "#ef4444";
    this.normalColor = options.normalColor ?? "#22c55e";
    this.criticalColor = options.criticalColor ?? "#dc2626";
    this.meterColor = options.meterColor ?? "#3b82f6";
  }

  /**
   * Draw a health bar for a fighter.
   * @param {Fighter} fighter
   * @param {number} x - top-left x
   * @param {number} y - top-left y
   * @param {boolean} mirror - if true, bar depletes left-to-right (for P2)
   */
  draw(fighter, x, y, mirror = false) {
    const ctx = this.ctx;
    const data = fighter.getHealthBarData();

    // --- Choose color based on health ---
    let fillColor = this.normalColor;
    if (data.isCritical) fillColor = this.criticalColor;
    else if (data.isLow) fillColor = this.lowColor;

    // --- Background (empty bar) ---
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x, y, this.barWidth, this.barHeight);

    // --- Filled portion ---
    const fillWidth = (this.barWidth * data.percentage) / 100;
    const fillX = mirror ? x + (this.barWidth - fillWidth) : x;

    ctx.fillStyle = fillColor;
    ctx.fillRect(fillX, y, fillWidth, this.barHeight);

    // --- Border ---
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.barWidth, this.barHeight);

    // --- Name label ---
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = mirror ? "right" : "left";
    ctx.fillText(data.name, mirror ? x + this.barWidth : x, y - 5);

    // --- Super meter (below health bar) ---
    const meterY = y + this.barHeight + 4;
    const meterHeight = 6;
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(x, meterY, this.barWidth, meterHeight);

    const meterFill = (this.barWidth * data.super) / data.superMax;
    const meterFillX = mirror ? x + (this.barWidth - meterFill) : x;
    ctx.fillStyle = data.superFull ? "#fbbf24" : this.meterColor;
    ctx.fillRect(meterFillX, meterY, meterFill, meterHeight);
  }
}
