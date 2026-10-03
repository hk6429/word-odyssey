// One feedback result can advance once, whether activated by a click or the timer.
export function createAutoAdvance({ delay = 900, schedule = setTimeout, unschedule = clearTimeout } = {}) {
  let timer = null, current = null;
  function cancel() {
    if (timer !== null) unschedule(timer);
    timer = null;
    current = null;
  }
  function prepare(action, automatic = false) {
    cancel();
    const ticket = {};
    current = ticket;
    const advance = () => {
      if (current !== ticket) return;
      cancel();
      return action();
    };
    if (automatic) timer = schedule(advance, delay);
    return advance;
  }
  return { prepare, cancel };
}
