// src/services/historyService.js

let history = [];

/**
 * Add an item to history
 */
export function addToHistory(item) {
  history.unshift({
    id: Date.now(),
    ...item,
  });
}

/**
 * Get all history
 */
export function getHistory() {
  return history;
}
