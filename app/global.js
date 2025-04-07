// Global error handling for chunk loading errors
if (typeof window !== 'undefined') {
  // Store the original chunk load error handler
  const originalNextjsChunkErrorHandler = window.__NEXT_CHUNK_LOAD_ERROR__;

  // Create a retry mechanism for chunk loading
  const retryChunkLoad = (chunkPath, maxRetries = 3, delay = 1000) => {
    let retries = 0;

    const attemptLoad = () => {
      return new Promise((resolve, reject) => {
        try {
          // Create a new script element
          const script = document.createElement('script');
          script.src = chunkPath;
          script.async = true;

          script.onload = () => {
            console.log(`Successfully loaded chunk: ${chunkPath}`);
            resolve();
          };

          script.onerror = () => {
            if (retries < maxRetries) {
              retries++;
              console.log(`Retrying chunk load (${retries}/${maxRetries}): ${chunkPath}`);
              setTimeout(attemptLoad, delay);
            } else {
              console.error(`Failed to load chunk after ${maxRetries} retries: ${chunkPath}`);
              reject(new Error(`Failed to load chunk: ${chunkPath}`));
            }
          };

          document.head.appendChild(script);
        } catch (error) {
          reject(error);
        }
      });
    };

    return attemptLoad();
  };

  // Override the Next.js chunk load error handler
  window.__NEXT_CHUNK_LOAD_ERROR__ = (error) => {
    // Call the original handler first
    if (originalNextjsChunkErrorHandler) {
      originalNextjsChunkErrorHandler(error);
    }

    // Extract the chunk path from the error message
    const chunkPathMatch = error.message.match(/Loading chunk (\S+) failed/);
    if (chunkPathMatch && chunkPathMatch[1]) {
      const chunkPath = `/_next/static/chunks/${chunkPathMatch[1]}.js`;
      console.log(`Attempting to recover from chunk load error: ${chunkPath}`);

      // Try to load the chunk again
      retryChunkLoad(chunkPath)
        .then(() => {
          console.log('Chunk recovered, reloading page...');
          window.location.reload();
        })
        .catch((err) => {
          console.error('Failed to recover from chunk load error:', err);
          // Show a user-friendly error message
          const errorDiv = document.createElement('div');
          errorDiv.style.position = 'fixed';
          errorDiv.style.top = '0';
          errorDiv.style.left = '0';
          errorDiv.style.width = '100%';
          errorDiv.style.padding = '20px';
          errorDiv.style.backgroundColor = '#f8d7da';
          errorDiv.style.color = '#721c24';
          errorDiv.style.textAlign = 'center';
          errorDiv.style.zIndex = '9999';
          errorDiv.innerHTML = `
            <p><strong>Error loading page content.</strong></p>
            <p>Please <button onclick="window.location.reload()" style="background: #721c24; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">reload the page</button> or try again later.</p>
          `;
          document.body.prepend(errorDiv);
        });
    }
  };

  // Also catch general errors
  window.addEventListener('error', (event) => {
    // Check if it's a chunk loading error
    if (
      (event.error && (
        event.error.message?.includes('Loading chunk') ||
        event.error.message?.includes('ChunkLoadError')
      )) ||
      (event.message && (
        event.message.includes('Loading chunk') ||
        event.message.includes('ChunkLoadError')
      ))
    ) {
      console.error('Chunk loading error detected:', event);

      // Prevent the error from being reported to the console
      event.preventDefault();
    }
  });
}
