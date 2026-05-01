const TX_KEY = "metavote_transactions";

export function logTransaction(type, data) {
  const logs = getTransactionLog();
  const entry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type,
    ...data,
  };
  logs.push(entry);
  try {
    localStorage.setItem(TX_KEY, JSON.stringify(logs));
  } catch {
    // localStorage might be full; drop oldest entries
    const trimmed = logs.slice(-100);
    localStorage.setItem(TX_KEY, JSON.stringify(trimmed));
  }
  return entry;
}

export function getTransactionLog() {
  try {
    return JSON.parse(localStorage.getItem(TX_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearTransactionLog() {
  localStorage.removeItem(TX_KEY);
}

export function downloadLog() {
  const logs = getTransactionLog();
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `metavote-transactions-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
