/** @type {import("jquery")} */
$;

/** @template T */
class NoRepeat {
    /** @type {T[]} The array of items that can be chosen from */
    items
    /** @type {T[]} The array of items that have been chosen */
    chosen
    /** @type {number} Custom number of times `getRandom` can be called until all items are are reset to an unchosen state */
    resetAt
    /** @type {number} How many times the items have been cycled through */
    resetCount
    /**
     * @type {boolean}
     * If `reset()` is called, this is set to true. It is set to false when all elements are chosen and the items automatically resets.
     * Default: `true`
     */
    lastResetWasAutomatic

    /**
     * @param {T[]} items An array of items to choose from.
     * @param {number} [resetAt] If provided, the number of times `getRandom` can be called until the array of available items is reset.
     * @param {T[]} [used] If provided, items to not pick from until after the first reset
     * @returns 
     */
    constructor(items, resetAt, used) {
        if (!Array.isArray(items)) err("input", "an Array");
        else if (used !== undefined && !Array.isArray(used)) err("used", "an Array");
        else if (resetAt !== undefined && typeof resetAt !== "number") err("resetAt", "a Number");
        this.items = items;
        this.chosen = used ?? [];
        this.resetAt = resetAt;
        this.resetCount = 0;
        this.lastResetWasAutomatic = true;
        return this;
    }

    /**
     * Returns a random item that hasn't been picked since the last reset.
     * Once the last item is picked, all items are reset, with the exception of the one returned.
     */
    getRandom() {
        const index = Math.floor(Math.random() * this.items.length);
        const element = this.items.splice(index, 1)?.[0];
        if (this.items.length === 0 || (this.resetAt !== undefined && this.chosen.length >= this.resetAt)) {
            // only one element. kinda silly lol
            if (this.items.length === 0 && this.chosen.length === 0) {
                this.chosen.push(element);
            }
            this.privReset(true);
        } else if (!(this.items.length === 0 && this.chosen.length === 0)) {
            this.chosen.push(element);
        }
        return element;
    }
    /**
     * Puts all items back in the item pool so they can be selected again
     */
    reset () {
        this.privReset(false);
    }
    privReset(auto) {
        this.items = this.items.concat(this.chosen);
        this.chosen = [];
        this.lastResetWasAutomatic = auto;
        this.resetCount++;
        return this;
    }
}

const patterns = new Map([
    [1, { num: 1, color: "#ca9b07", isSolid: true }],
    [2, { num: 2, color: "#0b2152", isSolid: true }],
    [3, { num: 3, color: "#9a1e16", isSolid: true }],
    [4, { num: 4, color: "#331a42", isSolid: true }],
    [5, { num: 5, color: "#ce2a07", isSolid: true }],
    [6, { num: 6, color: "#004b2d", isSolid: true }],
    [7, { num: 7, color: "#511016", isSolid: true }],
    [8, { num: 8, color: "#000000", isSolid: true }],

    [9,  { num: 9,  color: "#ca9b07", isSolid: false }],
    [10, { num: 10, color: "#0b2152", isSolid: false }],
    [11, { num: 11, color: "#9a1e16", isSolid: false }],
    [12, { num: 12, color: "#331a42", isSolid: false }],
    [13, { num: 13, color: "#ce2a07", isSolid: false }],
    [14, { num: 14, color: "#004b2d", isSolid: false }],
    [15, { num: 15, color: "#511016", isSolid: false }],
])

const NEW_GAME = "#new-game";
const BALLS_PICKED = "#balls-picked";
const BALL = "#ball-reveal-parent";
const DRAW = "#ball-number";
const HIDE = "#hide-draw"

let repeater = new NoRepeat([...patterns.keys()]);
let timeout;
let ballsPicked = 0;

function setBallsPicked(picked) {
    ballsPicked = picked;
    $(NEW_GAME).prop("disabled", ballsPicked === 0);
    $(BALLS_PICKED).text(`Balls Picked: ${ballsPicked}`);
}

function newGame() {
    repeater.reset();
    setBallsPicked(0);

    const parent = $(BALL);
    parent.fadeTo(500, 0, () => {
        hideBall();
        setTimeout(() => parent.fadeTo(500, 1), 500);
    })
}

function animate() {
    const parent = $(BALL)
    parent.effect("shake", { distance: 10, times: 2 }, 200)
}

function getBall() {
    const parent = $(BALL);
    if (!parent.hasClass("ballUnpicked")) return hideBall();

    if (ballsPicked === 15) {
        $(BALLS_PICKED).text("Max players reached. Start a new game?");
        return animate();
    }

    const num = repeater.getRandom();
    const pattern = patterns.get(num);


    parent.removeClass("ballUnpicked");
    if (!pattern.isSolid) parent.addClass("striped");
    $(":root").css("--color", pattern.color);

    $(DRAW).text(pattern.num);
    disableHideButton(false);

    setBallsPicked(ballsPicked + 1);

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
        timeout = undefined;
        hideBall();
    }, 5 * 1_000)
}

function hideBall() {
    if (timeout) clearTimeout(timeout);

    const parent = $(BALL);
    parent.addClass("ballUnpicked");
    parent.removeClass("striped");

    $(DRAW).text("?");

    disableHideButton()
}

function disableHideButton(disable = true) {
    const button = $(HIDE);
    button.prop("disabled", disable)
}
