function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(url, options = {}, config = {}) {
  const {
    retries = 3,
    initialDelay = 500,
    factor = 2,
    maxDelay = 5000,
    retryOnStatuses = [429, 502, 503, 504],
  } = config;

  let attempt = 0;
  let delay = initialDelay;

  while (true) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      const shouldRetry =
        retryOnStatuses.includes(response.status) && attempt < retries;

      if (!shouldRetry) {
        return response;
      }
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }
    }

    await wait(delay);
    delay = Math.min(delay * factor, maxDelay);
    attempt += 1;
  }
}
