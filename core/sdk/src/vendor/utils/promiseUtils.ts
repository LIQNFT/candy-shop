export function sleepPromise(ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

/* Helper buddy for removing async/await try/catch litter */
export const safeAwait = <T>(promise: Promise<T>, finallyCallback?: any) => {
  return promise
    .then((data) => {
      return { result: data, error: undefined };
    })
    .catch((error: Error) => {
      return { result: undefined, error: error };
    })
    .finally(() => {
      if (finallyCallback && typeof finallyCallback === 'function') {
        finallyCallback();
      }
    });
};
