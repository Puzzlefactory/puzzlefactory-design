import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

export async function startBuiltApp(distUrl) {
  const distPath = fileURLToPath(distUrl);
  const server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    const relativePath = normalize(pathname).replace(/^[/\\]+/, "");
    const requestedPath = join(distPath, relativePath || "index.html");

    if (!requestedPath.startsWith(distPath)) {
      response.writeHead(400);
      response.end("Invalid path");
      return;
    }

    try {
      const content = await readFile(requestedPath);
      response.writeHead(200, {
        "content-type": CONTENT_TYPES[extname(requestedPath)] ?? "application/octet-stream",
      });
      response.end(content);
    } catch {
      try {
        const content = await readFile(join(distPath, "index.html"));
        response.writeHead(200, { "content-type": CONTENT_TYPES[".html"] });
        response.end(content);
      } catch {
        response.writeHead(404);
        response.end("Not found");
      }
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not determine built app server address.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    }),
  };
}
